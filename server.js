const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

// Middleware to parse JSON body requests
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS, Images) from the current folder
app.use(express.static(__dirname));

// Helper function to read current submissions from file
const getSubmissions = () => {
  try {
    if (!fs.existsSync(SUBMISSIONS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(SUBMISSIONS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading submissions file:', error);
    return [];
  }
};

// Helper function to save submissions array to file
const saveSubmissions = (submissions) => {
  try {
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to submissions file:', error);
    return false;
  }
};

// API Endpoint to receive contact form submissions
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;

  // Server-side validation
  if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation Failed: Name, email, and message are required fields.' 
    });
  }

  // Create new contact submission entry
  const newSubmission = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    message: message.trim(),
    timestamp: new Date().toISOString()
  };

  // Load existing records, append new one, and write back to database
  const submissions = getSubmissions();
  submissions.push(newSubmission);

  if (saveSubmissions(submissions)) {
    console.log(`[Contact Submit] New entry received from: ${newSubmission.name} <${newSubmission.email}>`);
    return res.status(200).json({ 
      success: true, 
      message: 'Your message has been received successfully! Thank you for contacting Santosh Nasta Centre.' 
    });
  } else {
    return res.status(500).json({ 
      success: false, 
      message: 'Server Error: Failed to save submission. Please try again later.' 
    });
  }
});

// Default route fallback to index.html for undefined requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start listening for requests
app.listen(PORT, () => {
  console.log('======================================================');
  console.log(`🚀 Santosh Nasta Centre Server is running!`);
  console.log(`🔗 Local Address: http://localhost:${PORT}`);
  console.log(`📁 Saving contact forms in: submissions.json`);
  console.log('======================================================');
});

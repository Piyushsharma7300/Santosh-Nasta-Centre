/**
 * Santosh Nasta Centre - Main JavaScript Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // PAGE LOADER
  // ==========================================================================
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
      }, 800); // 800ms display for premium feeling
    });
    
    // Fallback if window load event already fired or delayed too long
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
    }, 2500);
  }

  // ==========================================================================
  // DARK / LIGHT MODE THEME TOGGLE
  // ==========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const body = document.body;

  // Retrieve existing choice from localStorage
  const savedTheme = localStorage.getItem('selected-theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark');
  } else {
    body.classList.remove('dark');
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      body.classList.toggle('dark');
      const currentTheme = body.classList.contains('dark') ? 'dark' : 'light';
      localStorage.setItem('selected-theme', currentTheme);
      showToast(`Switched to ${currentTheme} mode!`, 'success');
    });
  }

  // ==========================================================================
  // STICKY HEADER & SCROLL PROGRESS BAR & BACK TO TOP BUTTON
  // ==========================================================================
  const header = document.querySelector('header');
  const scrollProgressBar = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Header Scroll Effect
    if (scrollPos > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll Progress Bar
    if (scrollProgressBar && documentHeight > 0) {
      const scrollPercentage = (scrollPos / documentHeight) * 100;
      scrollProgressBar.style.width = `${scrollPercentage}%`;
    }

    // Back to Top Button visibility
    if (backToTopBtn) {
      if (scrollPos > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // Update Nav Active Link State
    updateActiveNavLink();
  });

  // Back to Top Click
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ==========================================================================
  // MOBILE NAVIGATION MENU (HAMBURGER)
  // ==========================================================================
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });

    // Close menu when clicking outside of it
    document.addEventListener('click', (event) => {
      const isClickInsideMenu = navMenu.contains(event.target);
      const isClickInsideHamburger = hamburger.contains(event.target);
      
      if (!isClickInsideMenu && !isClickInsideHamburger && navMenu.classList.contains('open')) {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });
  }

  // ==========================================================================
  // SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once revealed to keep layout performant
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // ==========================================================================
  // ACTIVE NAV LINK SELECTION ON SCROLL
  // ==========================================================================
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNavLink() {
    const scrollPos = window.scrollY;
    
    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120; // offset for sticky header
      const sectionId = section.getAttribute('id');
      const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (activeLink) {
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          navLinks.forEach(link => link.classList.remove('active'));
          activeLink.classList.add('active');
        }
      }
    });
  }

  // ==========================================================================
  // CONTACT FORM & TOAST INTEGRATION
  // ==========================================================================
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Retrieve form values
      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const phone = document.getElementById('form-phone').value.trim();
      const message = document.getElementById('form-message').value.trim();

      // Basic front-end validation
      if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      // Real API POST call to the Express backend
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';

      fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, message })
      })
      .then(response => response.json().then(data => ({ status: response.status, body: data })))
      .then(({ status, body }) => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        if (status === 200 && body.success) {
          // Reset form
          contactForm.reset();
          showToast(body.message || 'Message sent successfully!', 'success');
          
          // Remove focus styling from fields by simulating empty checks
          const inputs = contactForm.querySelectorAll('.form-input');
          inputs.forEach(input => {
            input.dispatchEvent(new Event('input')); // Reset float label
          });
        } else {
          showToast(body.message || 'Error occurred while sending message.', 'error');
        }
      })
      .catch(error => {
        console.error('Submit Error:', error);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        showToast('Connection error. Please check if server is running.', 'error');
      });
    });
  }

  // Helper function to manage floating labels manually if browser autocomplete changes them
  const formInputs = document.querySelectorAll('.form-input');
  formInputs.forEach(input => {
    // Add event listener to check if field is empty or has text
    input.addEventListener('input', () => {
      if (input.value !== '') {
        input.setAttribute('value', input.value);
      } else {
        input.removeAttribute('value');
      }
    });
    
    // Initial check in case of browser autocomplete
    if (input.value !== '') {
      input.setAttribute('value', input.value);
    }
  });

  // ==========================================================================
  // TOAST DISPLAY SYSTEM
  // ==========================================================================
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  function showToast(message, type = 'success') {
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.className = `toast ${type} show`;

    // Automatically fade out after 4 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }
});

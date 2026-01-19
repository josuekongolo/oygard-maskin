/**
 * Øygard Maskin - Main JavaScript
 * Handles navigation, form submission, and interactive features
 */

(function() {
    'use strict';

    // ==========================================================================
    // DOM Ready
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initSmoothScroll();
        initContactForm();
        initHeaderScroll();
    });

    // ==========================================================================
    // Mobile Navigation
    // ==========================================================================
    function initNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        const body = document.body;

        if (!navToggle || !navMenu) return;

        // Toggle mobile menu
        navToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            body.style.overflow = isExpanded ? '' : 'hidden';
        });

        // Close menu when clicking on a link
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                body.style.overflow = '';
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
                body.style.overflow = '';
                navToggle.focus();
            }
        });
    }

    // ==========================================================================
    // Smooth Scroll for Anchor Links
    // ==========================================================================
    function initSmoothScroll() {
        const anchors = document.querySelectorAll('a[href^="#"]');

        anchors.forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');

                if (targetId === '#') return;

                const target = document.querySelector(targetId);

                if (target) {
                    e.preventDefault();
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const topBarHeight = document.querySelector('.top-bar')?.offsetHeight || 0;
                    const offset = headerHeight + topBarHeight + 20;

                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ==========================================================================
    // Header Scroll Effect
    // ==========================================================================
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScroll = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;

            // Add shadow on scroll
            if (currentScroll > 10) {
                header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            }

            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ==========================================================================
    // Contact Form
    // ==========================================================================
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const successMessage = document.getElementById('form-success');
        const errorMessage = document.getElementById('form-error');

        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Get form elements
            const submitBtn = form.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');

            // Validate form
            if (!validateForm(form)) {
                return;
            }

            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            submitBtn.disabled = true;

            // Gather form data
            const formData = {
                name: form.name.value.trim(),
                email: form.email.value.trim(),
                phone: form.phone.value.trim(),
                address: form.address?.value.trim() || '',
                projectType: form.projectType.value,
                description: form.description.value.trim(),
                wantSiteVisit: form.siteVisit?.checked || false,
                timestamp: new Date().toISOString()
            };

            try {
                // Simulate API call (replace with actual Resend API integration)
                await sendFormData(formData);

                // Show success message
                form.style.display = 'none';
                successMessage.style.display = 'block';

                // Reset form
                form.reset();

            } catch (error) {
                console.error('Form submission error:', error);

                // Show error message
                form.style.display = 'none';
                errorMessage.style.display = 'block';

            } finally {
                // Reset button state
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }

    // ==========================================================================
    // Form Validation
    // ==========================================================================
    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');

        // Clear previous errors
        form.querySelectorAll('.form-error').forEach(el => el.remove());
        form.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

        requiredFields.forEach(function(field) {
            if (!field.value.trim()) {
                showFieldError(field, 'Dette feltet er påkrevd');
                isValid = false;
            } else if (field.type === 'email' && !isValidEmail(field.value)) {
                showFieldError(field, 'Vennligst oppgi en gyldig e-postadresse');
                isValid = false;
            } else if (field.name === 'phone' && !isValidPhone(field.value)) {
                showFieldError(field, 'Vennligst oppgi et gyldig telefonnummer');
                isValid = false;
            }
        });

        return isValid;
    }

    function showFieldError(field, message) {
        field.classList.add('input-error');
        const errorEl = document.createElement('span');
        errorEl.className = 'form-error';
        errorEl.textContent = message;
        errorEl.style.color = '#E53E3E';
        errorEl.style.fontSize = '0.875rem';
        errorEl.style.marginTop = '0.25rem';
        errorEl.style.display = 'block';
        field.parentNode.appendChild(errorEl);
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        // Norwegian phone number validation (8 digits, optionally with country code)
        const cleanPhone = phone.replace(/[\s\-\+]/g, '');
        const phoneRegex = /^(\+?47)?[2-9]\d{7}$/;
        return phoneRegex.test(cleanPhone);
    }

    // ==========================================================================
    // Send Form Data
    // ==========================================================================
    async function sendFormData(data) {
        // This is a placeholder for the actual API integration
        // Replace with Resend API or your preferred email service

        // For demonstration, we'll simulate a successful submission
        // In production, you would send data to your backend or email service

        return new Promise((resolve, reject) => {
            // Simulate network delay
            setTimeout(() => {
                // Log form data (for testing)
                console.log('Form submitted:', data);

                // Simulate success (90% of the time)
                if (Math.random() > 0.1) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Simulated error'));
                }
            }, 1500);
        });

        /*
        // Example Resend API integration:
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Øygard Maskin Nettside <noreply@oygardmaskin.no>',
                to: 'post@oygardmaskin.no',
                subject: `Ny forespørsel: ${data.projectType}`,
                html: `
                    <h2>Ny forespørsel fra nettsiden</h2>
                    <p><strong>Navn:</strong> ${data.name}</p>
                    <p><strong>E-post:</strong> ${data.email}</p>
                    <p><strong>Telefon:</strong> ${data.phone}</p>
                    <p><strong>Adresse:</strong> ${data.address || 'Ikke oppgitt'}</p>
                    <p><strong>Type prosjekt:</strong> ${data.projectType}</p>
                    <p><strong>Ønsker befaring:</strong> ${data.wantSiteVisit ? 'Ja' : 'Nei'}</p>
                    <h3>Beskrivelse:</h3>
                    <p>${data.description}</p>
                `
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send email');
        }

        return response.json();
        */
    }

    // ==========================================================================
    // Utility Functions
    // ==========================================================================

    // Debounce function for scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function for frequent events
    function throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

})();

// ==========================================================================
// Add error styling to CSS dynamically
// ==========================================================================
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .input-error {
            border-color: #E53E3E !important;
        }
        .input-error:focus {
            border-color: #E53E3E !important;
            box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.2) !important;
        }
    `;
    document.head.appendChild(style);
})();

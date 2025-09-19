/**
 * UI Components for L'Île aux Oiseaux website
 * Reusable component classes following modern JavaScript patterns
 */

import { A11y, Animation, DOM, Events } from './utils.js';

/**
 * Mobile Navigation Component
 */
export class MobileNav {
  constructor(selector) {
    this.nav = DOM.query(selector);
    this.toggle = DOM.query('.header__mobile-toggle');
    this.isOpen = false;
    this.cleanup = [];

    if (this.nav && this.toggle) {
      this.init();
    }
  }

  init() {
    // Toggle button click
    this.cleanup.push(Events.on(this.toggle, 'click', () => this.toggleNav()));

    // Close on escape key
    this.cleanup.push(
      Events.on(document, 'keydown', e => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeNav();
        }
      })
    );

    // Close when clicking outside
    this.cleanup.push(
      Events.on(document, 'click', e => {
        if (
          this.isOpen &&
          !this.nav.contains(e.target) &&
          !this.toggle.contains(e.target)
        ) {
          this.closeNav();
        }
      })
    );

    // Handle resize
    this.cleanup.push(
      Events.on(
        window,
        'resize',
        Events.throttle(() => {
          if (window.innerWidth > 768 && this.isOpen) {
            this.closeNav();
          }
        }, 250)
      )
    );

    // Set initial ARIA attributes
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.setAttribute('aria-controls', 'main-navigation');
    this.nav.id = 'main-navigation';
  }

  toggleNav() {
    if (this.isOpen) {
      this.closeNav();
    } else {
      this.openNav();
    }
  }

  openNav() {
    this.isOpen = true;
    this.nav.classList.add('header__nav--open');
    this.toggle.setAttribute('aria-expanded', 'true');
    this.toggle.innerHTML = '✕'; // Close icon

    // Focus first nav link
    const firstLink = DOM.query('.nav__link', this.nav);
    if (firstLink) {
      firstLink.focus();
    }

    A11y.announce('Menu ouvert', 'polite');
  }

  closeNav() {
    this.isOpen = false;
    this.nav.classList.remove('header__nav--open');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.innerHTML = '☰'; // Hamburger icon

    A11y.announce('Menu fermé', 'polite');
  }

  destroy() {
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
  }
}

/**
 * Smooth Scroll Navigation Component
 */
export class SmoothScroll {
  constructor(selector = 'a[href^="#"]') {
    this.links = DOM.queryAll(selector);
    this.cleanup = [];
    this.init();
  }

  init() {
    this.links.forEach(link => {
      this.cleanup.push(
        Events.on(link, 'click', e => this.handleClick(e, link))
      );
    });
  }

  handleClick(e, link) {
    e.preventDefault();

    const targetId = link.getAttribute('href').substring(1);
    const target = DOM.query(`#${targetId}`);

    if (target) {
      // Update URL without triggering scroll
      if (history.pushState) {
        history.pushState(null, null, `#${targetId}`);
      }

      // Smooth scroll to target
      Animation.scrollTo(target, {
        behavior: 'smooth',
        block: 'start',
      });

      // Focus target for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.addEventListener(
        'blur',
        () => {
          target.removeAttribute('tabindex');
        },
        { once: true }
      );
    }
  }

  destroy() {
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
  }
}

/**
 * Form Validation Component
 */
export class FormValidator {
  constructor(formSelector) {
    this.form = DOM.query(formSelector);
    this.fields = [];
    this.cleanup = [];

    if (this.form) {
      this.init();
    }
  }

  init() {
    // Find all form fields with validation rules
    const inputs = DOM.queryAll(
      'input[required], input[type="email"], input[type="tel"]',
      this.form
    );
    const textareas = DOM.queryAll('textarea[required]', this.form);
    const selects = DOM.queryAll('select[required]', this.form);

    this.fields = [...inputs, ...textareas, ...selects];

    // Add validation listeners
    this.fields.forEach(field => {
      this.cleanup.push(
        Events.on(field, 'blur', () => this.validateField(field)),
        Events.on(
          field,
          'input',
          Events.debounce(() => this.clearFieldError(field), 300)
        )
      );
    });

    // Form submission
    this.cleanup.push(
      Events.on(this.form, 'submit', e => this.handleSubmit(e))
    );
  }

  validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    let isValid = true;
    let message = '';

    // Required field check
    if (field.hasAttribute('required') && !value) {
      isValid = false;
      message = `Le champ ${this.getFieldLabel(field)} est requis.`;
    }

    // Email validation
    else if (field.type === 'email' && value && !this.validateEmail(value)) {
      isValid = false;
      message = 'Veuillez saisir une adresse email valide.';
    }

    // Phone validation
    else if (field.type === 'tel' && value && !this.validatePhone(value)) {
      isValid = false;
      message = 'Veuillez saisir un numéro de téléphone valide.';
    }

    // Custom validation rules
    if (isValid && field.dataset.validate) {
      const result = this.customValidation(field, value);
      isValid = result.isValid;
      message = result.message;
    }

    if (isValid) {
      this.clearFieldError(field);
    } else {
      this.showFieldError(field, message);
    }

    return isValid;
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  validatePhone(phone) {
    const re = /^[\+]?[(]?[\d\s\-\(\)]{8,}$/;
    return re.test(phone.replace(/\s/g, ''));
  }

  customValidation(field, value) {
    // Add custom validation rules here
    // Example: age validation for child's age
    if (field.dataset.validate === 'age') {
      const age = parseInt(value, 10);
      if (isNaN(age) || age < 0 || age > 10) {
        return {
          isValid: false,
          message: 'Veuillez saisir un âge valide (0-10 ans).',
        };
      }
    }

    return { isValid: true, message: '' };
  }

  getFieldLabel(field) {
    const label = DOM.query(`label[for="${field.id}"]`);
    return label ? label.textContent.replace('*', '').trim() : field.name;
  }

  showFieldError(field, message) {
    this.clearFieldError(field);

    field.classList.add('form-input--error');
    field.setAttribute('aria-invalid', 'true');

    const errorId = `${field.id}-error`;
    const error = DOM.create(
      'span',
      {
        id: errorId,
        className: 'form-error',
        'aria-live': 'polite',
      },
      message
    );

    field.setAttribute('aria-describedby', errorId);

    // Insert error after field or field container
    const container = field.closest('.form-group') || field.parentNode;
    container.appendChild(error);
  }

  clearFieldError(field) {
    field.classList.remove('form-input--error');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');

    const error = DOM.query(`#${field.id}-error`);
    if (error) {
      error.remove();
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    let isFormValid = true;

    // Validate all fields
    this.fields.forEach(field => {
      if (!this.validateField(field)) {
        isFormValid = false;
      }
    });

    if (isFormValid) {
      this.submitForm();
    } else {
      // Focus first invalid field
      const firstError = DOM.query('.form-input--error', this.form);
      if (firstError) {
        firstError.focus();
        A11y.announce(
          'Veuillez corriger les erreurs dans le formulaire.',
          'assertive'
        );
      }
    }
  }

  async submitForm() {
    const submitBtn = DOM.query('button[type="submit"]', this.form);
    const originalText = submitBtn ? submitBtn.textContent : '';

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi en cours...';
      }

      // Here you would normally send the form data to a server
      // For this static site, we'll just simulate success
      await this.simulateSubmission();

      this.showSuccess();
      this.form.reset();
    } catch (error) {
      this.showError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Form submission error:', error);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  simulateSubmission() {
    return new Promise(resolve => setTimeout(resolve, 2000));
  }

  showSuccess() {
    const message = DOM.create('div', {
      className: 'alert alert--success',
      'aria-live': 'polite',
    });

    message.innerHTML = `
      <div class="alert__content">
        <div class="alert__title">Message envoyé avec succès !</div>
        <div class="alert__message">
          Nous vous contacterons très bientôt. Merci pour votre demande.
        </div>
      </div>
    `;

    this.form.parentNode.insertBefore(message, this.form);

    // Scroll to message
    Animation.scrollTo(message);

    // Remove message after 5 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 5000);
  }

  showError(errorMessage) {
    const message = DOM.create('div', {
      className: 'alert alert--error',
      'aria-live': 'assertive',
    });

    message.innerHTML = `
      <div class="alert__content">
        <div class="alert__title">Erreur</div>
        <div class="alert__message">${errorMessage}</div>
      </div>
    `;

    this.form.parentNode.insertBefore(message, this.form);

    // Remove message after 5 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 5000);
  }

  destroy() {
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
  }
}

/**
 * FAQ Accordion Component
 */
export class FAQAccordion {
  constructor(selector = '.faq') {
    this.container = DOM.query(selector);
    this.items = [];
    this.cleanup = [];

    if (this.container) {
      this.init();
    }
  }

  init() {
    const questions = DOM.queryAll('.faq__question', this.container);

    questions.forEach((question, index) => {
      const item = question.closest('.faq__item');
      const answer = DOM.query('.faq__answer', item);

      if (item && answer) {
        // Set up ARIA attributes
        const questionId = `faq-question-${index}`;
        const answerId = `faq-answer-${index}`;

        question.id = questionId;
        question.setAttribute('aria-expanded', 'false');
        question.setAttribute('aria-controls', answerId);

        answer.id = answerId;
        answer.setAttribute('aria-labelledby', questionId);
        answer.style.display = 'none';

        // Add click handler
        this.cleanup.push(
          Events.on(question, 'click', () =>
            this.toggleItem(item, question, answer)
          )
        );

        this.items.push({ item, question, answer });
      }
    });
  }

  toggleItem(item, question, answer) {
    const isOpen = question.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      this.closeItem(item, question, answer);
    } else {
      // Close other items (uncomment for accordion behavior)
      // this.closeAllItems();
      this.openItem(item, question, answer);
    }
  }

  openItem(item, question, answer) {
    question.setAttribute('aria-expanded', 'true');
    item.setAttribute('open', '');
    answer.style.display = 'block';

    // Animate if not reduced motion
    if (!A11y.prefersReducedMotion()) {
      Animation.fadeIn(answer);
    }
  }

  closeItem(item, question, answer) {
    question.setAttribute('aria-expanded', 'false');
    item.removeAttribute('open');

    if (!A11y.prefersReducedMotion()) {
      Animation.fadeOut(answer);
    } else {
      answer.style.display = 'none';
    }
  }

  closeAllItems() {
    this.items.forEach(({ item, question, answer }) => {
      this.closeItem(item, question, answer);
    });
  }

  destroy() {
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
  }
}

/**
 * Scroll Spy Component
 */
export class ScrollSpy {
  constructor(navSelector, sectionsSelector) {
    this.nav = DOM.query(navSelector);
    this.sections = DOM.queryAll(sectionsSelector);
    this.navLinks = DOM.queryAll('a[href^="#"]', this.nav);
    this.currentSection = null;
    this.cleanup = [];

    if (this.nav && this.sections.length) {
      this.init();
    }
  }

  init() {
    this.cleanup.push(
      Events.on(
        window,
        'scroll',
        Events.throttle(() => this.updateActiveSection(), 100)
      )
    );

    // Initial check
    this.updateActiveSection();
  }

  updateActiveSection() {
    const scrollPos = window.scrollY + 100; // Offset for header

    let activeSection = null;

    this.sections.forEach(section => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;

      if (scrollPos >= top && scrollPos < bottom) {
        activeSection = section;
      }
    });

    if (activeSection && activeSection !== this.currentSection) {
      this.currentSection = activeSection;
      this.updateNavigation(activeSection.id);
    }
  }

  updateNavigation(sectionId) {
    // Remove active class from all links
    this.navLinks.forEach(link => {
      link.classList.remove('nav__link--active');
    });

    // Add active class to current link
    const activeLink = DOM.query(`a[href="#${sectionId}"]`, this.nav);
    if (activeLink) {
      activeLink.classList.add('nav__link--active');
    }
  }

  destroy() {
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
  }
}

/**
 * Image Lazy Loading Component
 */
export class LazyImages {
  constructor(selector = 'img[data-src]') {
    this.images = DOM.queryAll(selector);
    this.observer = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      });

      this.images.forEach(img => {
        this.observer.observe(img);
      });
    } else {
      // Fallback for older browsers
      this.images.forEach(img => this.loadImage(img));
    }
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.add('loaded');
      img.removeAttribute('data-src');
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Export all components
export default {
  MobileNav,
  SmoothScroll,
  FormValidator,
  FAQAccordion,
  ScrollSpy,
  LazyImages,
};

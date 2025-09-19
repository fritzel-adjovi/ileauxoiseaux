/**
 * Utility functions for L'Île aux Oiseaux website
 * Pure vanilla JavaScript utilities following modern ES6+ patterns
 */

/**
 * DOM Utilities
 */
export const DOM = {
  /**
   * Query selector with error handling
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element (default: document)
   * @returns {Element|null} - Found element or null
   */
  query: (selector, context = document) => {
    try {
      return context.querySelector(selector);
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
      return null;
    }
  },

  /**
   * Query all selector with error handling
   * @param {string} selector - CSS selector
   * @param {Element} context - Context element (default: document)
   * @returns {NodeList} - Found elements
   */
  queryAll: (selector, context = document) => {
    try {
      return context.querySelectorAll(selector);
    } catch (error) {
      console.warn(`Invalid selector: ${selector}`, error);
      return [];
    }
  },

  /**
   * Create element with attributes and content
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {string|Element[]} content - Text content or child elements
   * @returns {Element} - Created element
   */
  create: (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });

    // Set content
    if (typeof content === 'string') {
      element.textContent = content;
    } else if (Array.isArray(content)) {
      content.forEach(child => {
        if (child instanceof Element) {
          element.appendChild(child);
        }
      });
    }

    return element;
  },

  /**
   * Check if element is visible in viewport
   * @param {Element} element - Element to check
   * @param {number} threshold - Visibility threshold (0-1)
   * @returns {boolean} - True if visible
   */
  isVisible: (element, threshold = 0) => {
    const rect = element.getBoundingClientRect();
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.bottom >= threshold * windowHeight &&
      rect.right >= threshold * windowWidth &&
      rect.top <= (1 - threshold) * windowHeight &&
      rect.left <= (1 - threshold) * windowWidth
    );
  },
};

/**
 * Event Utilities
 */
export const Events = {
  /**
   * Add event listener with automatic cleanup
   * @param {Element} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   * @returns {Function} - Cleanup function
   */
  on: (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  },

  /**
   * Throttle function execution
   * @param {Function} func - Function to throttle
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Throttled function
   */
  throttle: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Debounce function execution
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {boolean} immediate - Execute immediately
   * @returns {Function} - Debounced function
   */
  debounce: (func, wait, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  /**
   * Wait for DOM to be ready
   * @param {Function} callback - Callback function
   */
  ready: callback => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  },
};

/**
 * Animation Utilities
 */
export const Animation = {
  /**
   * Smooth scroll to element
   * @param {Element|string} target - Target element or selector
   * @param {Object} options - Scroll options
   */
  scrollTo: (target, options = {}) => {
    const element = typeof target === 'string' ? DOM.query(target) : target;
    if (!element) return;

    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options,
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) {
      defaultOptions.behavior = 'auto';
    }

    element.scrollIntoView(defaultOptions);
  },

  /**
   * Animate element with CSS classes
   * @param {Element} element - Target element
   * @param {string} animationClass - CSS animation class
   * @param {number} duration - Animation duration in ms
   * @returns {Promise} - Promise that resolves when animation completes
   */
  animate: (element, animationClass, duration = 300) => {
    return new Promise(resolve => {
      element.classList.add(animationClass);

      const cleanup = () => {
        element.classList.remove(animationClass);
        resolve();
      };

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      if (prefersReducedMotion) {
        cleanup();
        return;
      }

      setTimeout(cleanup, duration);
    });
  },

  /**
   * Fade in element
   * @param {Element} element - Target element
   * @param {number} duration - Animation duration in ms
   */
  fadeIn: (element, duration = 300) => {
    element.style.opacity = '0';
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms ease-in-out`;

    // Trigger reflow
    element.offsetHeight;

    element.style.opacity = '1';
  },

  /**
   * Fade out element
   * @param {Element} element - Target element
   * @param {number} duration - Animation duration in ms
   */
  fadeOut: (element, duration = 300) => {
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = '0';

    setTimeout(() => {
      element.style.display = 'none';
      element.style.transition = '';
    }, duration);
  },
};

/**
 * Form Utilities
 */
export const Form = {
  /**
   * Serialize form data
   * @param {HTMLFormElement} form - Form element
   * @returns {Object} - Serialized form data
   */
  serialize: form => {
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // Handle multiple values for same key
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }

    return data;
  },

  /**
   * Validate email format
   * @param {string} email - Email string
   * @returns {boolean} - True if valid
   */
  validateEmail: email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number (simple validation)
   * @param {string} phone - Phone number string
   * @returns {boolean} - True if valid
   */
  validatePhone: phone => {
    const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Show form field error
   * @param {Element} field - Form field element
   * @param {string} message - Error message
   */
  showError: (field, message) => {
    // Remove existing error
    Form.clearError(field);

    field.classList.add('form-input--error');
    field.setAttribute('aria-invalid', 'true');

    const error = DOM.create(
      'span',
      {
        className: 'form-error',
        id: `${field.id}-error`,
        'aria-live': 'polite',
      },
      message
    );

    field.setAttribute('aria-describedby', error.id);
    field.parentNode.appendChild(error);
  },

  /**
   * Clear form field error
   * @param {Element} field - Form field element
   */
  clearError: field => {
    field.classList.remove('form-input--error');
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');

    const existingError = DOM.query(`#${field.id}-error`);
    if (existingError) {
      existingError.remove();
    }
  },
};

/**
 * Accessibility Utilities
 */
export const A11y = {
  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level (polite, assertive)
   */
  announce: (message, priority = 'polite') => {
    const announcer = DOM.create('div', {
      'aria-live': priority,
      'aria-atomic': 'true',
      className: 'sr-only',
    });

    document.body.appendChild(announcer);
    announcer.textContent = message;

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  },

  /**
   * Manage focus trap within container
   * @param {Element} container - Container element
   * @returns {Object} - Focus trap controls
   */
  focusTrap: container => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const trapFocus = e => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    const activate = () => {
      container.addEventListener('keydown', trapFocus);
      firstElement?.focus();
    };

    const deactivate = () => {
      container.removeEventListener('keydown', trapFocus);
    };

    return { activate, deactivate };
  },

  /**
   * Check if user prefers reduced motion
   * @returns {boolean} - True if reduced motion preferred
   */
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
};

/**
 * Storage Utilities
 */
export const Storage = {
  /**
   * Set local storage item with error handling
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} - True if successful
   */
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('Failed to set localStorage item:', error);
      return false;
    }
  },

  /**
   * Get local storage item with error handling
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if not found
   * @returns {any} - Retrieved value or default
   */
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to get localStorage item:', error);
      return defaultValue;
    }
  },

  /**
   * Remove local storage item
   * @param {string} key - Storage key
   * @returns {boolean} - True if successful
   */
  removeItem: key => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('Failed to remove localStorage item:', error);
      return false;
    }
  },
};

/**
 * URL Utilities
 */
export const URL = {
  /**
   * Get query parameter value
   * @param {string} param - Parameter name
   * @returns {string|null} - Parameter value
   */
  getParam: param => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  /**
   * Set query parameter
   * @param {string} param - Parameter name
   * @param {string} value - Parameter value
   * @param {boolean} replace - Replace current history entry
   */
  setParam: (param, value, replace = false) => {
    const url = new URL(window.location);
    url.searchParams.set(param, value);

    if (replace) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }
  },
};

// Default export with all utilities
export default {
  DOM,
  Events,
  Animation,
  Form,
  A11y,
  Storage,
  URL,
};

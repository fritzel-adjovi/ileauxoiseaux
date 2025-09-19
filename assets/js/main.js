/**
 * Main JavaScript file for L'Île aux Oiseaux website
 * Initializes all components and handles global functionality
 */

import Components from './components.js';
import Utils from './utils.js';

const { DOM, Events, Animation, A11y } = Utils;
const {
  MobileNav,
  SmoothScroll,
  FormValidator,
  FAQAccordion,
  ScrollSpy,
  LazyImages,
} = Components;

/**
 * Main Application Class
 */
class App {
  constructor() {
    this.components = {};
    this.cleanup = [];
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    Events.ready(() => {
      this.initializeComponents();
      this.setupGlobalEventListeners();
      this.setupAccessibilityFeatures();
      this.setupThemeToggle();
      this.announcePageLoad();
    });
  }

  /**
   * Initialize all components
   */
  initializeComponents() {
    // Mobile Navigation
    this.components.mobileNav = new MobileNav('.header__nav');

    // Smooth Scroll Navigation
    this.components.smoothScroll = new SmoothScroll('a[href^="#"]');

    // Form Validation (if contact form exists)
    const contactForm = DOM.query('#contact-form');
    if (contactForm) {
      this.components.formValidator = new FormValidator('#contact-form');
    }

    // FAQ Accordion (if FAQ page)
    const faqContainer = DOM.query('.faq');
    if (faqContainer) {
      this.components.faqAccordion = new FAQAccordion('.faq');
    }

    // Scroll Spy for navigation
    this.components.scrollSpy = new ScrollSpy('.header__nav', 'section[id]');

    // Lazy loading for images
    this.components.lazyImages = new LazyImages('img[data-src]');
  }

  /**
   * Setup global event listeners
   */
  setupGlobalEventListeners() {
    // Handle external links
    this.setupExternalLinks();

    // Handle WhatsApp and phone links
    this.setupContactLinks();

    // Keyboard navigation improvements
    this.setupKeyboardNavigation();

    // Handle print requests
    this.setupPrintHandling();
  }

  /**
   * Setup external links with proper attributes
   */
  setupExternalLinks() {
    const externalLinks = DOM.queryAll(
      'a[href^="http"]:not([href*="' + window.location.hostname + '"])'
    );

    externalLinks.forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');

      // Add screen reader text for external links
      if (!link.querySelector('.sr-only')) {
        const srText = DOM.create(
          'span',
          { className: 'sr-only' },
          ' (ouvre dans un nouvel onglet)'
        );
        link.appendChild(srText);
      }
    });
  }

  /**
   * Setup contact links (WhatsApp, phone, email)
   */
  setupContactLinks() {
    // WhatsApp links
    const whatsappLinks = DOM.queryAll('a[href^="https://wa.me"]');
    whatsappLinks.forEach(link => {
      this.cleanup.push(
        Events.on(link, 'click', e => {
          // Analytics tracking could go here
          console.log('WhatsApp link clicked');
        })
      );
    });

    // Phone links
    const phoneLinks = DOM.queryAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
      this.cleanup.push(
        Events.on(link, 'click', e => {
          // Analytics tracking could go here
          console.log('Phone link clicked');
        })
      );
    });

    // Email links
    const emailLinks = DOM.queryAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
      this.cleanup.push(
        Events.on(link, 'click', e => {
          // Analytics tracking could go here
          console.log('Email link clicked');
        })
      );
    });
  }

  /**
   * Setup keyboard navigation improvements
   */
  setupKeyboardNavigation() {
    // Focus visible on all interactive elements
    const interactiveElements = DOM.queryAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    interactiveElements.forEach(element => {
      this.cleanup.push(
        Events.on(element, 'focus', () => {
          element.classList.add('focus-visible');
        }),
        Events.on(element, 'blur', () => {
          element.classList.remove('focus-visible');
        })
      );
    });

    // Skip to main content functionality
    const skipLink = DOM.query('.skip-link');
    const mainContent = DOM.query('#main-content');

    if (skipLink && mainContent) {
      this.cleanup.push(
        Events.on(skipLink, 'click', e => {
          e.preventDefault();
          mainContent.focus();
          Animation.scrollTo(mainContent);
        })
      );
    }
  }

  /**
   * Setup accessibility features
   */
  setupAccessibilityFeatures() {
    // Announce route changes for SPA-like navigation
    this.setupRouteAnnouncements();

    // Handle focus management
    this.setupFocusManagement();

    // Setup reduced motion preferences
    this.setupReducedMotionPreferences();
  }

  /**
   * Setup route change announcements
   */
  setupRouteAnnouncements() {
    // Listen for hash changes
    this.cleanup.push(
      Events.on(window, 'hashchange', () => {
        const hash = window.location.hash.substring(1);
        const section = DOM.query(`#${hash}`);

        if (section) {
          const sectionTitle = DOM.query('h1, h2, h3', section);
          const title = sectionTitle ? sectionTitle.textContent : 'Section';
          A11y.announce(`Navigation vers ${title}`, 'polite');
        }
      })
    );
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Ensure focus is visible when navigating with keyboard
    this.cleanup.push(
      Events.on(document, 'keydown', e => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-navigation');
        }
      }),
      Events.on(document, 'mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
      })
    );
  }

  /**
   * Setup reduced motion preferences
   */
  setupReducedMotionPreferences() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleReducedMotion = e => {
      if (e.matches) {
        document.body.classList.add('reduce-motion');
      } else {
        document.body.classList.remove('reduce-motion');
      }
    };

    // Initial check
    handleReducedMotion(mediaQuery);

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleReducedMotion);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleReducedMotion);
    }
  }

  /**
   * Setup theme toggle functionality
   */
  setupThemeToggle() {
    const themeToggle = DOM.query('.theme-toggle');

    if (themeToggle) {
      // Load saved theme
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeToggle(themeToggle, savedTheme);
      }

      // Theme toggle click handler
      this.cleanup.push(
        Events.on(themeToggle, 'click', () => {
          const currentTheme =
            document.documentElement.getAttribute('data-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
          this.updateThemeToggle(themeToggle, newTheme);

          A11y.announce(
            `Thème ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`,
            'polite'
          );
        })
      );
    }
  }

  /**
   * Update theme toggle button
   */
  updateThemeToggle(button, theme) {
    const isDark = theme === 'dark';
    button.textContent = isDark ? '☀️' : '🌙';
    button.setAttribute(
      'aria-label',
      `Basculer vers le thème ${isDark ? 'clair' : 'sombre'}`
    );
  }

  /**
   * Setup print handling
   */
  setupPrintHandling() {
    this.cleanup.push(
      Events.on(window, 'beforeprint', () => {
        // Expand all collapsed content for printing
        const expandableElements = DOM.queryAll('[aria-expanded="false"]');
        expandableElements.forEach(element => {
          element.setAttribute('data-was-collapsed', 'true');
          element.setAttribute('aria-expanded', 'true');
        });
      }),
      Events.on(window, 'afterprint', () => {
        // Restore collapsed state after printing
        const expandedElements = DOM.queryAll('[data-was-collapsed="true"]');
        expandedElements.forEach(element => {
          element.setAttribute('aria-expanded', 'false');
          element.removeAttribute('data-was-collapsed');
        });
      })
    );
  }

  /**
   * Announce page load to screen readers
   */
  announcePageLoad() {
    const pageTitle = document.title;
    A11y.announce(`Page ${pageTitle} chargée`, 'polite');
  }

  /**
   * Cleanup all event listeners and components
   */
  destroy() {
    // Cleanup global event listeners
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];

    // Destroy all components
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });

    this.components = {};
  }
}

/**
 * Performance monitoring
 */
class PerformanceMonitor {
  constructor() {
    this.init();
  }

  init() {
    // Monitor Core Web Vitals if supported
    if ('PerformanceObserver' in window) {
      this.observeWebVitals();
    }

    // Monitor resource loading
    this.observeResourceLoading();
  }

  observeWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        console.log('LCP:', entry.startTime);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        console.log('FID:', entry.processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          console.log('CLS:', entry.value);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  observeResourceLoading() {
    this.cleanup.push(
      Events.on(window, 'load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          console.log(
            'Page load time:',
            navigation.loadEventEnd - navigation.loadEventStart
          );
          console.log(
            'DOM content loaded:',
            navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart
          );
        }
      })
    );
  }
}

/**
 * Error handling
 */
class ErrorHandler {
  constructor() {
    this.init();
  }

  init() {
    // Global error handler
    window.addEventListener('error', event => {
      console.error('Global error:', event.error);
      this.reportError(event.error);
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', event => {
      console.error('Unhandled promise rejection:', event.reason);
      this.reportError(event.reason);
    });
  }

  reportError(error) {
    // In a real application, you would send this to an error reporting service
    console.log('Error reported:', {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }
}

// Initialize application
let app;
let performanceMonitor;
let errorHandler;

// Wait for DOM to be ready
Events.ready(() => {
  try {
    app = new App();
    performanceMonitor = new PerformanceMonitor();
    errorHandler = new ErrorHandler();
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
});

// Cleanup on page unload
Events.on(window, 'beforeunload', () => {
  if (app && typeof app.destroy === 'function') {
    app.destroy();
  }
});

// Export for potential external use
window.IleAuxOiseauxApp = {
  app,
  performanceMonitor,
  errorHandler,
  Utils,
  Components,
};

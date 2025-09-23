/**
 * L'ÎLE AUX OISEAUX - JavaScript Principal
 * Version simplifiée pour GitHub Pages (sans modules ES6)
 * Gestion du menu mobile et effets de scroll
 */

(function () {
  'use strict';

  // ==========================================
  // UTILITAIRES
  // ==========================================

  const Utils = {
    // Sélecteur d'élément
    query: function (selector, context = document) {
      try {
        return context.querySelector(selector);
      } catch (error) {
        console.warn('Sélecteur invalide:', selector);
        return null;
      }
    },

    // Sélecteur multiple
    queryAll: function (selector, context = document) {
      try {
        return Array.from(context.querySelectorAll(selector));
      } catch (error) {
        console.warn('Sélecteur invalide:', selector);
        return [];
      }
    },

    // Debounce
    debounce: function (func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },

    // Throttle
    throttle: function (func, limit) {
      let inThrottle;
      return function (...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    },

    // Vérifier si on préfère les animations réduites
    prefersReducedMotion: function () {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
  };

  // ==========================================
  // GESTION DU HEADER FIXE
  // ==========================================

  const HeaderManager = {
    init: function () {
      this.header = Utils.query('.header');
      this.lastScrollTop = 0;

      if (!this.header) return;

      // Throttle le scroll pour de meilleures performances
      const throttledScrollHandler = Utils.throttle(
        this.handleScroll.bind(this),
        16
      );
      window.addEventListener('scroll', throttledScrollHandler, {
        passive: true,
      });

      // État initial
      this.handleScroll();
    },

    handleScroll: function () {
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Ajouter/enlever la classe scrolled
      if (currentScrollTop > 20) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }

      this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    },
  };

  // ==========================================
  // NAVIGATION MOBILE
  // ==========================================

  const MobileNav = {
    init: function () {
      this.nav = Utils.query('.header__nav');
      this.toggle = Utils.query('.header__mobile-toggle');
      this.isOpen = false;
      this.navLinks = Utils.queryAll('.nav__link');

      if (!this.nav || !this.toggle) return;

      this.setupEventListeners();
      this.setupAriaAttributes();
    },

    setupEventListeners: function () {
      // Toggle button
      this.toggle.addEventListener('click', () => this.toggleNav());

      // Liens de navigation
      this.navLinks.forEach(link => {
        link.addEventListener('click', e => this.handleLinkClick(e, link));
      });

      // Fermer avec Escape
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeNav();
        }
      });

      // Fermer en cliquant à l'extérieur
      document.addEventListener('click', e => {
        if (
          this.isOpen &&
          !this.nav.contains(e.target) &&
          !this.toggle.contains(e.target)
        ) {
          this.closeNav();
        }
      });

      // Fermer lors du redimensionnement
      const debouncedResize = Utils.debounce(() => {
        if (window.innerWidth >= 768 && this.isOpen) {
          this.closeNav();
        }
      }, 250);
      window.addEventListener('resize', debouncedResize);
    },

    setupAriaAttributes: function () {
      this.toggle.setAttribute('aria-expanded', 'false');
      this.toggle.setAttribute('aria-controls', 'main-navigation');
      this.nav.id = 'main-navigation';
    },

    toggleNav: function () {
      if (this.isOpen) {
        this.closeNav();
      } else {
        this.openNav();
      }
    },

    openNav: function () {
      this.isOpen = true;
      this.nav.classList.add('header__nav--open');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.toggle.innerHTML = '✕';

      // Focus sur le premier lien
      const firstLink = this.navLinks[0];
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 100);
      }

      console.log('Menu mobile ouvert');
    },

    closeNav: function () {
      this.isOpen = false;
      this.nav.classList.remove('header__nav--open');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.toggle.innerHTML = '☰';

      console.log('Menu mobile fermé');
    },

    handleLinkClick: function (e, link) {
      // Fermer le menu mobile
      if (this.isOpen) {
        this.closeNav();
      }

      // Smooth scroll pour les liens internes
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        SmoothScroll.scrollToSection(href.substring(1));
      }
    },
  };

  // ==========================================
  // SMOOTH SCROLL
  // ==========================================

  const SmoothScroll = {
    init: function () {
      const links = Utils.queryAll('a[href^="#"]');

      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.length > 1) {
          link.addEventListener('click', e => {
            e.preventDefault();
            this.scrollToSection(href.substring(1));
          });
        }
      });
    },

    scrollToSection: function (sectionId) {
      const target = Utils.query(`#${sectionId}`);
      if (!target) return;

      const headerHeight = 96; // Hauteur du header fixe
      const targetPosition = target.offsetTop - headerHeight;

      // Utiliser scrollTo natif avec smooth behavior
      window.scrollTo({
        top: targetPosition,
        behavior: Utils.prefersReducedMotion() ? 'auto' : 'smooth',
      });

      // Mise à jour de l'URL
      if (history.pushState) {
        history.pushState(null, null, `#${sectionId}`);
      }

      // Focus pour l'accessibilité
      target.setAttribute('tabindex', '-1');
      target.focus();
      target.addEventListener(
        'blur',
        () => {
          target.removeAttribute('tabindex');
        },
        { once: true }
      );
    },
  };

  // ==========================================
  // ANIMATIONS AU SCROLL
  // ==========================================

  const ScrollAnimations = {
    init: function () {
      if (!('IntersectionObserver' in window)) {
        console.log('Intersection Observer non supporté');
        return;
      }

      this.setupIntersectionObserver();
    },

    setupIntersectionObserver: function () {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      };

      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            element.classList.add('animate-in');
            observer.unobserve(element);
          }
        });
      }, observerOptions);

      // Observer les éléments avec animations
      const animatedElements = Utils.queryAll(
        '.excellence-item, .day-card, .timeline-item, .program-card'
      );
      animatedElements.forEach(element => {
        observer.observe(element);
      });
    },
  };

  // ==========================================
  // LAZY LOADING DES IMAGES
  // ==========================================

  const LazyImages = {
    init: function () {
      const images = Utils.queryAll('img[loading="lazy"]');

      // Si le navigateur supporte le lazy loading natif
      if ('loading' in HTMLImageElement.prototype) {
        return;
      }

      // Fallback avec Intersection Observer
      if ('IntersectionObserver' in window) {
        this.setupIntersectionObserver(images);
      } else {
        // Fallback ultime : charger toutes les images
        images.forEach(img => this.loadImage(img));
      }
    },

    setupIntersectionObserver: function (images) {
      const imageObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target);
            imageObserver.unobserve(entry.target);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    },

    loadImage: function (img) {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
      img.classList.add('loaded');
    },
  };

  // ==========================================
  // ACCESSIBILITÉ
  // ==========================================

  const Accessibility = {
    init: function () {
      this.setupSkipLinks();
      this.setupFocusVisible();
      this.setupKeyboardNavigation();
    },

    setupSkipLinks: function () {
      const skipLink = Utils.query('.skip-link');
      const mainContent = Utils.query('#main-content');

      if (skipLink && mainContent) {
        skipLink.addEventListener('click', e => {
          e.preventDefault();
          mainContent.setAttribute('tabindex', '-1');
          mainContent.focus();
          mainContent.addEventListener(
            'blur',
            () => {
              mainContent.removeAttribute('tabindex');
            },
            { once: true }
          );
        });
      }
    },

    setupFocusVisible: function () {
      // Ajouter focus-visible pour la navigation au clavier
      document.addEventListener('keydown', e => {
        if (e.key === 'Tab') {
          document.body.classList.add('keyboard-navigation');
        }
      });

      document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
      });
    },

    setupKeyboardNavigation: function () {
      // Améliorer la navigation au clavier
      const interactiveElements = Utils.queryAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      interactiveElements.forEach(element => {
        element.addEventListener('focus', () => {
          element.classList.add('focus-visible');
        });

        element.addEventListener('blur', () => {
          element.classList.remove('focus-visible');
        });
      });
    },
  };

  // ==========================================
  // GESTION DES LIENS EXTERNES
  // ==========================================

  const ExternalLinks = {
    init: function () {
      const externalLinks = Utils.queryAll(
        'a[href^="http"]:not([href*="' + window.location.hostname + '"])'
      );

      externalLinks.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');

        // Ajouter du texte pour les lecteurs d'écran
        if (!link.querySelector('.sr-only')) {
          const srText = document.createElement('span');
          srText.className = 'sr-only';
          srText.textContent = ' (ouvre dans un nouvel onglet)';
          link.appendChild(srText);
        }
      });
    },
  };

  // ==========================================
  // GESTION DES ERREURS
  // ==========================================

  const ErrorHandler = {
    init: function () {
      window.addEventListener('error', event => {
        console.error('Erreur JavaScript:', event.error);
        this.reportError(event.error);
      });

      window.addEventListener('unhandledrejection', event => {
        console.error('Promise rejetée:', event.reason);
        this.reportError(event.reason);
      });
    },

    reportError: function (error) {
      // En production, vous pourriez envoyer ces erreurs à un service de monitoring
      console.log('Erreur rapportée:', {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    },
  };

  // ==========================================
  // INITIALISATION PRINCIPALE
  // ==========================================

  const App = {
    init: function () {
      console.log("Initialisation de L'Île aux Oiseaux...");

      // Initialiser tous les modules
      HeaderManager.init();
      MobileNav.init();
      SmoothScroll.init();
      ScrollAnimations.init();
      LazyImages.init();
      Accessibility.init();
      ExternalLinks.init();
      ErrorHandler.init();

      console.log("L'Île aux Oiseaux initialisée avec succès!");
    },
  };

  // ==========================================
  // DÉMARRAGE DE L'APPLICATION
  // ==========================================

  // Initialiser quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
  } else {
    App.init();
  }

  // Exposer certaines fonctions pour le debugging
  if (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ) {
    window.IleAuxOiseaux = {
      App,
      HeaderManager,
      MobileNav,
      SmoothScroll,
      Utils,
    };
  }
})();

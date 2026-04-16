document.addEventListener('DOMContentLoaded', () => {
  const GA_MEASUREMENT_ID = 'G-F67MY1F3KQ';
  const COOKIE_CONSENT_KEY = 'tvl_cookie_consent_v1';
  const LOCALE_PREFERENCE_KEY = 'tvl_locale_pref';
  const COOKIE_CONSENT_TTL_MS = 180 * 24 * 60 * 60 * 1000;
  const deniedConsent = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  };
  const grantedAnalyticsConsent = {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  };
  let analyticsInitialized = false;
  let analyticsScriptInjected = false;

  const cookieBanner = document.getElementById('cookieBanner');
  const acceptAnalytics = document.getElementById('acceptAnalytics');
  const declineAnalytics = document.getElementById('declineAnalytics');
  const openCookieSettings = document.getElementById('openCookieSettings');
  const contactSection = document.getElementById('contact');
  const contactFormEmbed = document.getElementById('contactFormEmbed');
  const contactFormError = document.getElementById('contactFormError');
  const localeSwitchLinks = Array.from(document.querySelectorAll('[data-locale-switch]'));
  let pipedriveLoaderPending = false;

  function normalizeLocale(localeCandidate) {
    if (!localeCandidate || typeof localeCandidate !== 'string') return 'en';
    const locale = localeCandidate.toLowerCase();
    return locale.startsWith('ro') ? 'ro' : 'en';
  }

  function writeLocalePreference(locale) {
    try {
      window.localStorage.setItem(LOCALE_PREFERENCE_KEY, normalizeLocale(locale));
    } catch (error) {
      // Ignore storage failures and keep navigation functional.
    }
  }

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };
  }

  function injectAnalyticsScript() {
    if (analyticsScriptInjected) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.dataset.gaMeasurement = GA_MEASUREMENT_ID;
    document.head.appendChild(script);
    analyticsScriptInjected = true;
  }

  function loadAnalytics() {
    ensureGtag();
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;

    if (!analyticsInitialized) {
      window.gtag('js', new Date());
      window.gtag('consent', 'default', deniedConsent);
      window.gtag('consent', 'update', grantedAnalyticsConsent);
      window.gtag('config', GA_MEASUREMENT_ID, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
      analyticsInitialized = true;
    } else {
      window.gtag('consent', 'update', grantedAnalyticsConsent);
    }

    injectAnalyticsScript();
  }

  function getCookieDomains(hostname) {
    const domains = new Set(['', hostname, `.${hostname}`]);
    const parts = hostname.split('.');

    for (let index = 1; index < parts.length - 1; index += 1) {
      const suffix = parts.slice(index).join('.');
      if (suffix.includes('.')) domains.add(`.${suffix}`);
    }

    return Array.from(domains);
  }

  function expireCookie(name, domain = '') {
    const domainAttribute = domain ? `; domain=${domain}` : '';
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=/${domainAttribute}; SameSite=Lax`;
  }

  function clearAnalyticsCookies() {
    const cookieNames = document.cookie
      .split(';')
      .map(cookie => cookie.trim().split('=')[0])
      .filter(name => name === '_ga' || name.startsWith('_ga_'));

    if (!cookieNames.length) return;

    const domains = getCookieDomains(window.location.hostname);

    cookieNames.forEach(name => {
      domains.forEach(domain => expireCookie(name, domain));
    });
  }

  function readCookieConsent() {
    try {
      const rawValue = window.localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!rawValue) return null;

      const parsedValue = JSON.parse(rawValue);
      if (!parsedValue || typeof parsedValue.state !== 'string' || typeof parsedValue.updatedAt !== 'number') {
        window.localStorage.removeItem(COOKIE_CONSENT_KEY);
        return null;
      }

      if (Date.now() - parsedValue.updatedAt > COOKIE_CONSENT_TTL_MS) {
        window.localStorage.removeItem(COOKIE_CONSENT_KEY);
        return null;
      }

      return parsedValue.state;
    } catch (error) {
      return null;
    }
  }

  function writeCookieConsent(state) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
        state,
        updatedAt: Date.now()
      }));
    } catch (error) {
      // Ignore storage failures and keep the current session functional.
    }
  }

  function showCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.hidden = false;
  }

  function hideCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.hidden = true;
  }

  function grantAnalyticsConsent({ persist = true } = {}) {
    const hadAnalytics = analyticsInitialized;

    if (persist) writeCookieConsent('granted');
    loadAnalytics();
    hideCookieBanner();

    if (hadAnalytics && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
      });
    }
  }

  function denyAnalyticsConsent({ persist = true } = {}) {
    if (persist) writeCookieConsent('denied');
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;

    if (analyticsInitialized && window.gtag) {
      window.gtag('consent', 'update', deniedConsent);
    }

    clearAnalyticsCookies();
    hideCookieBanner();
  }

  function initializeCookieConsent() {
    const savedPreference = readCookieConsent();

    if (savedPreference === 'granted') {
      grantAnalyticsConsent({ persist: false });
      return;
    }

    if (savedPreference === 'denied') {
      denyAnalyticsConsent({ persist: false });
      return;
    }

    showCookieBanner();
  }

  function loadPipedriveFormEmbed() {
    if (!contactFormEmbed || pipedriveLoaderPending || contactFormEmbed.dataset.loaded === 'true') return;

    const formUrl = contactFormEmbed.dataset.pdWebforms;
    if (!formUrl) return;

    pipedriveLoaderPending = true;

    if (contactFormError) contactFormError.hidden = true;

    contactFormEmbed.classList.add('is-loading');

    const wrapper = document.createElement('div');
    wrapper.className = 'pipedriveWebForms';
    wrapper.dataset.pdWebforms = formUrl;
    contactFormEmbed.replaceChildren(wrapper);
    const stopObserving = new MutationObserver(() => {
      if (!wrapper.childElementCount) return;
      stopObserving.disconnect();
      window.clearTimeout(loadingFallback);
      contactFormEmbed.classList.remove('is-loading');
    });
    stopObserving.observe(wrapper, { childList: true, subtree: true });
    const loadingFallback = window.setTimeout(() => {
      stopObserving.disconnect();
      contactFormEmbed.classList.remove('is-loading');
    }, 4000);

    const script = document.createElement('script');
    script.src = 'https://webforms.pipedrive.com/f/loader';
    script.async = true;
    script.dataset.pipedriveLoader = 'true';

    script.onload = () => {
      pipedriveLoaderPending = false;
      window.clearTimeout(loadingFallback);
      contactFormEmbed.dataset.loaded = 'true';
    };

    script.onerror = () => {
      pipedriveLoaderPending = false;
      window.clearTimeout(loadingFallback);
      stopObserving.disconnect();
      script.remove();
      contactFormEmbed.classList.remove('is-loading');
      if (contactFormError) contactFormError.hidden = false;
    };

    document.body.appendChild(script);
  }

  function initializePipedriveEmbed() {
    if (!contactFormEmbed) return;

    if (!('IntersectionObserver' in window) || !contactSection) {
      loadPipedriveFormEmbed();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (!entry || !entry.isIntersecting) return;
      observer.disconnect();
      loadPipedriveFormEmbed();
    }, {
      rootMargin: '480px 0px'
    });

    observer.observe(contactSection);
  }

  initializeCookieConsent();
  initializePipedriveEmbed();
  writeLocalePreference(document.documentElement.lang);

  // Copyright dinamic
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // FAQ accordion
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));
  faqItems.forEach((item, index) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    const questionId = `faq-question-${index + 1}`;
    const answerId = `faq-answer-${index + 1}`;
    btn.id = questionId;
    btn.setAttribute('aria-controls', answerId);
    btn.setAttribute('aria-expanded', 'false');
    answer.id = answerId;
    answer.setAttribute('role', 'region');
    answer.setAttribute('aria-labelledby', questionId);
    answer.setAttribute('aria-hidden', 'true');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      faqItems.forEach(entry => {
        entry.classList.remove('open');
        const entryBtn = entry.querySelector('.faq-question');
        const entryAnswer = entry.querySelector('.faq-answer');
        if (entryBtn) entryBtn.setAttribute('aria-expanded', 'false');
        if (entryAnswer) entryAnswer.setAttribute('aria-hidden', 'true');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
      }
    });
  });

  // Email anti-obfuscation
  const emailLink = document.getElementById('emailLink');
  if (emailLink) {
    const e = 'sales' + '@' + 'tvl' + '.' + 'tech';
    emailLink.textContent = e;
    emailLink.addEventListener('click', () => window.location = 'mailto:' + e);
  }

  if (acceptAnalytics) {
    acceptAnalytics.addEventListener('click', grantAnalyticsConsent);
  }

  if (declineAnalytics) {
    declineAnalytics.addEventListener('click', denyAnalyticsConsent);
  }

  if (openCookieSettings) {
    openCookieSettings.addEventListener('click', () => {
      showCookieBanner();
      if (acceptAnalytics) acceptAnalytics.focus();
    });
  }

  localeSwitchLinks.forEach(link => {
    const locale = link.dataset.localeSwitch;
    if (!locale) return;

    link.addEventListener('click', () => {
      writeLocalePreference(locale);
    });
  });

});

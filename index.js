document.addEventListener('DOMContentLoaded', () => {

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

});

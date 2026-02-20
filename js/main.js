/**
 * NAMEFED Mock-up – Mobile navigation toggle & form handling
 */
(function () {
  function closeNav() {
    const nav = document.querySelector('#main-nav');
    const toggle = document.querySelector('.nav-toggle');
    const closeBtn = document.querySelector('.nav-close');
    if (nav) nav.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (closeBtn) closeBtn.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('#main-nav');
    const closeBtn = document.querySelector('.nav-close');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', isOpen);
        if (closeBtn) closeBtn.setAttribute('aria-hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      if (closeBtn) {
        closeBtn.addEventListener('click', closeNav);
      }

      nav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeNav);
      });
    }
  }

  document.addEventListener('headerloaded', initNav);
  if (document.querySelector('#main-nav')) initNav();

  // Mock-up forms: prevent submit, show message
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('This is a mock-up. Form submissions are not processed.');
    });
  });
})();

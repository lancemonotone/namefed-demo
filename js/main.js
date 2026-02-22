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

  // Fade out body when navigating away
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link || !link.href) return;
    if (link.target === '_blank' || link.hasAttribute('download')) return;
    if (link.getAttribute('href') && link.getAttribute('href').charAt(0) === '#') return;
    if (link.protocol === 'javascript:' || link.protocol === 'mailto:' || link.protocol === 'tel:') return;
    if (link.pathname === window.location.pathname) return;

    e.preventDefault();
    document.body.classList.add('is-navigating');
    setTimeout(function () {
      window.location.href = link.href;
    }, 300);
  });

  document.addEventListener('submit', function (e) {
    if (e.target.tagName === 'FORM') {
      e.preventDefault();
    }
  });
})();

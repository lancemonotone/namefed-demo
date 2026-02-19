/**
 * NAMEFED Mock-up – Mobile navigation toggle & form handling
 */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Mock-up forms: prevent submit, show message
  document.querySelectorAll('form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('This is a mock-up. Form submissions are not processed.');
    });
  });
})();

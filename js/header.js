/**
 * NAMEFED – Load shared header and set active page
 */
(function () {
  const placeholder = document.getElementById('header-placeholder');
  if (!placeholder) return;

  const path = window.location.pathname || '';
  let page = 'home';
  const match = path.match(/\/([^/]+)\.html$/);
  if (match) {
    page = match[1] === 'index' ? 'home' : match[1];
  }

  fetch('partials/header.html')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      placeholder.insertAdjacentHTML('afterend', html);
      placeholder.remove();

      const activeLink = document.querySelector('.main-nav a[data-page="' + page + '"]');
      if (activeLink) {
        activeLink.setAttribute('aria-current', 'page');
      }

      document.dispatchEvent(new CustomEvent('headerloaded'));
    })
    .catch(function () {
      placeholder.innerHTML = '<p>Navigation could not be loaded.</p>';
    });
})();

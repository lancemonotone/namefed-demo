/**
 * NAMEFED – Load shared footer
 */
(function () {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;

  fetch('partials/footer.html')
    .then(function (r) { return r.text(); })
    .then(function (html) {
      placeholder.insertAdjacentHTML('afterend', html);
      placeholder.remove();
    })
    .catch(function () {
      placeholder.innerHTML = '<p>Footer could not be loaded.</p>';
    });
})();

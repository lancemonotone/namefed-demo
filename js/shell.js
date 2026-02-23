/**
 * NAMEFED – Load shared page shell, then scripts
 * Fetches partials/page-shell.html, injects into body, loads header/footer/content scripts.
 */
(function () {
  function getPage() {
    const path = window.location.pathname || "";
    const match = path.match(/\/([^/]+)\.html$/);
    if (match) return match[1] === "index" ? "index" : match[1];
    return "index";
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }

  const page = getPage();

  fetch("partials/page-shell.html")
    .then(function (r) {
      if (!r.ok) throw new Error("Shell not found");
      return r.text();
    })
    .then(function (html) {
      const shell = html.replace(/\{\{data-page\}\}/g, page);
      document.body.insertAdjacentHTML("afterbegin", shell);
    })
    .then(function () {
      return loadScript("js/renderers.js")
        .then(function () { return loadScript("js/transformers.js"); })
        .then(function () { return loadScript("js/blocks.js"); })
        .then(function () { return loadScript("js/modal.js"); })
        .then(function () { return loadScript("js/header.js"); })
        .then(function () { return loadScript("js/content.js"); })
        .then(function () { return loadScript("js/footer.js"); })
        .then(function () { return loadScript("js/main.js"); });
    })
    .then(function () {
      if (page === "membership") return loadScript("js/membership.js");
    })
    .catch(function (err) {
      console.error("Shell load error:", err);
      document.body.innerHTML = "<p>Page could not be loaded.</p>";
    });
})();

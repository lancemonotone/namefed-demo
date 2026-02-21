/**
 * NAMEFED – Page content loader (CMS-like)
 * Fetches content.json, renders blocks into #main based on data-page
 */
(function () {
  function getPageKey() {
    const main = document.getElementById("main");
    if (main && main.dataset.page) return main.dataset.page;
    const path = window.location.pathname || "";
    const match = path.match(/\/([^/]+)\.html$/);
    if (match) return match[1] === "index" ? "index" : match[1];
    return "index";
  }

  function renderPage(content) {
    const pageKey = getPageKey();
    const page = content.pages && content.pages[pageKey];
    const main = document.getElementById("main");

    if (!page || !page.blocks || !main) return;

    const shared = Object.assign({}, content.shared || {}, {
      holidays: content.holidays || content.shared && content.shared.holidays
    });
    const promises = page.blocks.map(function (block) {
      return window.renderBlock(block.type, block.data || {}, shared);
    });

    Promise.all(promises)
      .then(function (htmlParts) {
        main.innerHTML = htmlParts.join("");
        document.dispatchEvent(new CustomEvent("contentloaded", { detail: { page: pageKey } }));
      })
      .catch(function (err) {
        console.error("Content load error:", err);
        main.innerHTML = "<p>Content could not be loaded.</p>";
      });
  }

  fetch("data/content.json")
    .then(function (r) {
      if (!r.ok) throw new Error("Content not found");
      return r.json();
    })
    .then(renderPage)
    .catch(function (err) {
      console.error("Content load error:", err);
    });
})();

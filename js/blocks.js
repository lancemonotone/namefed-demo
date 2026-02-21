/**
 * NAMEFED – Block registry + template fetch (CMS-like)
 * Fetches HTML partials, prepares data via block registry, merges and returns HTML.
 * Block logic lives in registry; no content coupling.
 */
(function () {
  const R = window.BlockRenderers;
  const T = window.BlockTransformers;
  const templateCache = {};

  function fetchTemplate(type) {
    if (templateCache[type]) return Promise.resolve(templateCache[type]);
    return fetch("partials/blocks/block-" + type + ".html")
      .then(function (r) {
        if (!r.ok) throw new Error("Template not found: block-" + type);
        return r.text();
      })
      .then(function (html) {
        templateCache[type] = html;
        return html;
      });
  }

  var blockRegistry = {
    hero: {
      template: "hero",
      prepare: function (data) {
        return Object.assign({}, data, {
          ctasHtml: data.ctas ? R.ctas(data.ctas) : "",
        });
      },
    },
    strip: {
      template: "strip",
      prepare: function (data) {
        return data;
      },
    },
    split: {
      template: "split",
      prepare: function (data) {
        return data;
      },
    },
    grid: {
      template: "grid",
      prepare: function (data) {
        return data;
      },
    },
    content: {
      template: "content",
      prepare: function (data) {
        return T.applyGenericTransformers(data);
      },
    },
    pagehead: {
      template: "pagehead",
      prepare: function (data) {
        return data;
      },
    },
    qanda: {
      template: "qanda",
      prepare: function (data) {
        return Object.assign({}, data, {
          itemsHtml: R.qanda(data.items || []),
        });
      },
    },
  };

  function prepareBlockData(type, data, shared) {
    var config = blockRegistry[type];
    var prepared = config && config.prepare ? config.prepare(data) : Object.assign({}, data);
    prepared.modifiers = prepared.modifiers || "";
    return T.resolvePlaceholdersInData(prepared, shared || {});
  }

  window.renderBlock = function (type, data, shared) {
    if (type === "partial") {
      var name = (data && data.name) || "";
      return fetchTemplate(name).then(function (template) {
        return data ? T.replacePlaceholders(template, data) : template;
      });
    }
    var config = blockRegistry[type];
    var templateName = (config && config.template) || type;

    if (type === "grid") {
      return Promise.all([
        fetchTemplate(templateName),
        fetchTemplate("card"),
      ]).then(function (templates) {
        var gridTemplate = templates[0];
        var cardTemplate = templates[1];
        var items = (data && data.items) || [];
        var itemsHtml = items
          .map(function (item) {
            return T.replacePlaceholders(
              cardTemplate,
              R.prepareCardData(item)
            );
          })
          .join("");
        var prepared = prepareBlockData(
          type,
          Object.assign({}, data, { itemsHtml: itemsHtml }),
          shared || {}
        );
        return T.replacePlaceholders(gridTemplate, prepared);
      });
    }

    var prepared = prepareBlockData(type, data, shared || {});
    return fetchTemplate(templateName).then(function (template) {
      return T.replacePlaceholders(template, prepared);
    });
  };
})();

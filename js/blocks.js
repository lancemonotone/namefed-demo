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
      prepare: function (data, fetchTemplateFn) {
        if (!data.ctas || !data.ctas.length)
          return Object.assign({}, data, { ctasHtml: "" });
        return R.renderButtonsHtml(data.ctas, fetchTemplateFn).then(
          function (ctasHtml) {
            return Object.assign({}, data, { ctasHtml: ctasHtml });
          },
        );
      },
    },
    strip: {
      template: "strip",
      prepare: function (data) {
        return data;
      },
    },
    buttons: {
      template: "buttons",
      prepare: function (data, fetchTemplateFn) {
        if (!data.buttons || !data.buttons.length)
          return Object.assign({}, data, { buttonsHtml: "" });
        return R.renderButtonsHtml(data.buttons, fetchTemplateFn).then(
          function (buttonsHtml) {
            return Object.assign({}, data, { buttonsHtml: buttonsHtml });
          },
        );
      },
    },
    split: {
      template: "split",
      prepare: function (data, fetchTemplateFn) {
        var next = Object.assign({}, data);
        var promises = [];
        if (data.media && data.media.src) {
          promises.push(
            R.renderImageHtml(
              data.media.src,
              data.media.alt,
              fetchTemplateFn,
            ).then(function (mediaHtml) {
              next.mediaHtml = mediaHtml;
              delete next.media;
            }),
          );
        }
        if (data.buttons && data.buttons.length) {
          promises.push(
            R.renderButtonsHtml(data.buttons, fetchTemplateFn).then(
              function (buttonsHtml) {
                return fetchTemplateFn("buttons").then(function (tpl) {
                  next.buttonsHtml = T.replacePlaceholders(tpl, {
                    buttonsHtml: buttonsHtml,
                  });
                });
              },
            ),
          );
        } else {
          next.buttonsHtml = "";
        }
        if (!promises.length) return next;
        return Promise.all(promises).then(function () {
          return next;
        });
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
      prepare: function (data, fetchTemplateFn) {
        const promises = [];
        const next = Object.assign({}, data);
        if (data.table) {
          promises.push(
            R.renderTableHtml(data.table, fetchTemplateFn).then(
              function (tableHtml) {
                next.tableHtml = tableHtml;
                delete next.table;
              },
            ),
          );
        }
        if (data.hoursTable) {
          promises.push(
            R.renderTableHtml(data.hoursTable, fetchTemplateFn).then(
              function (hoursTableHtml) {
                next.hoursTableHtml = hoursTableHtml;
                delete next.hoursTable;
              },
            ),
          );
        }
        if (!promises.length)
          return T.applyGenericTransformers(next, fetchTemplateFn);
        return Promise.all(promises).then(function () {
          return T.applyGenericTransformers(next, fetchTemplateFn);
        });
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
      prepare: function (data, fetchTemplateFn) {
        const items = data.items || [];
        if (!items.length) return Object.assign({}, data, { itemsHtml: "" });
        return R.renderQandaHtml(items, fetchTemplateFn).then(
          function (itemsHtml) {
            return Object.assign({}, data, { itemsHtml: itemsHtml });
          },
        );
      },
    },
  };

  function prepareBlockData(type, data, shared) {
    var config = blockRegistry[type];
    var prepared =
      config && config.prepare
        ? config.prepare(data, fetchTemplate)
        : Object.assign({}, data);
    return Promise.resolve(prepared).then(function (p) {
      p.modifiers = p.modifiers || "";
      return T.resolvePlaceholdersInData(p, shared || {}, fetchTemplate);
    });
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
        var itemPromises = items.map(function (item) {
          var cardData = R.prepareCardData(item);
          if (cardData.imageSrc) {
            return R.renderImageHtml(
              cardData.imageSrc,
              cardData.imageAlt,
              fetchTemplate,
            ).then(function (imageHtml) {
              cardData.imageHtml = imageHtml;
              return T.replacePlaceholders(cardTemplate, cardData);
            });
          }
          cardData.imageHtml = "";
          return Promise.resolve(T.replacePlaceholders(cardTemplate, cardData));
        });
        return Promise.all(itemPromises).then(function (cardHtmls) {
          var itemsHtml = cardHtmls.join("");
          return prepareBlockData(
            type,
            Object.assign({}, data, { itemsHtml: itemsHtml }),
            shared || {},
          ).then(function (prepared) {
            return T.replacePlaceholders(gridTemplate, prepared);
          });
        });
      });
    }

    return prepareBlockData(type, data, shared || {}).then(function (prepared) {
      return fetchTemplate(templateName).then(function (template) {
        return T.replacePlaceholders(template, prepared);
      });
    });
  };
})();

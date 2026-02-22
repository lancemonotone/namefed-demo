/**
 * NAMEFED – Pure HTML builders (content-agnostic)
 * Receives data, returns HTML. No knowledge of block types or content domain.
 */
(function () {
  function renderListHtml(data, modifiers, fetchTemplateFn) {
    var groups;
    if (Array.isArray(data)) {
      groups = [{ items: data }];
    } else if (data && Array.isArray(data.items)) {
      groups = [{ items: data.items }];
    } else if (data && data.groups) {
      groups = data.groups;
    } else {
      groups = [];
    }
    if (!groups.length) return Promise.resolve("");
    const T = window.BlockTransformers;
    const mod = modifiers || (data && data.modifiers) || "";
    const baseClass = "block-list" + (mod ? " " + mod : "");
    return Promise.all([
      fetchTemplateFn("list-item"),
      fetchTemplateFn("list-simple"),
      fetchTemplateFn("list-group-title"),
      fetchTemplateFn("list-group-intro"),
      fetchTemplateFn("list-group"),
      fetchTemplateFn("list-note"),
      fetchTemplateFn("list-wrapper"),
    ]).then(function (templates) {
      const itemTpl = templates[0];
      const simpleTpl = templates[1];
      const titleTpl = templates[2];
      const introTpl = templates[3];
      const groupTpl = templates[4];
      const noteTpl = templates[5];
      const wrapperTpl = templates[6];
      function renderItems(items) {
        return (items || [])
          .map(function (item) {
            return T.replacePlaceholders(itemTpl, { content: item });
          })
          .join("");
      }
      if (groups.length === 1 && !groups[0].title && !groups[0].intro) {
        const items = groups[0].items || groups[0].dates || [];
        if (!items.length) return "";
        return T.replacePlaceholders(simpleTpl, {
          modifiers: mod,
          itemsHtml: renderItems(items),
        });
      }
      const idAttr = data.id ? ' id="' + data.id + '"' : "";
      const wrapperClass = baseClass + " block-list--bordered";
      let groupsHtml = "";
      groups.forEach(function (group) {
        const items = group.items || group.dates || [];
        const titleHtml = group.title
          ? T.replacePlaceholders(titleTpl, { title: group.title })
          : "";
        const introHtml = group.intro
          ? T.replacePlaceholders(introTpl, { intro: group.intro })
          : "";
        groupsHtml += T.replacePlaceholders(groupTpl, {
          titleHtml: titleHtml,
          introHtml: introHtml,
          itemsHtml: renderItems(items),
        });
      });
      const noteHtml = data.note
        ? T.replacePlaceholders(noteTpl, { note: data.note })
        : "";
      return T.replacePlaceholders(wrapperTpl, {
        idAttr: idAttr,
        wrapperClass: wrapperClass,
        groupsHtml: groupsHtml,
        noteHtml: noteHtml,
      });
    });
  }

  function renderButtonsHtml(buttons, fetchTemplateFn) {
    if (!buttons || !buttons.length) return Promise.resolve("");
    const T = window.BlockTransformers;
    return Promise.all([
      fetchTemplateFn("button-link"),
      fetchTemplateFn("button-button"),
    ]).then(function (templates) {
      const linkTpl = templates[0];
      const buttonTpl = templates[1];
      return buttons
        .map(function (b) {
          const cls = b.class || "btn btn-primary";
          if (b.href != null) {
            return T.replacePlaceholders(linkTpl, {
              href: b.href || "#",
              class: cls,
              text: b.text || "",
            });
          }
          return T.replacePlaceholders(buttonTpl, {
            type: b.type || "button",
            class: cls,
            idAttr: b.id ? ' id="' + b.id + '"' : "",
            disabled: b.disabled ? " disabled" : "",
            text: b.text || "",
          });
        })
        .join("");
    });
  }

  function renderImageHtml(src, alt, fetchTemplateFn) {
    if (!src) return Promise.resolve("");
    const T = window.BlockTransformers;
    return fetchTemplateFn("image").then(function (template) {
      return T.replacePlaceholders(template, { src: src, alt: alt || "" });
    });
  }

  /** Prepares card data for block-card.html template. Returns raw data; imageHtml built from template. */
  function prepareCardData(item) {
    return {
      modifiers: item.modifiers || "",
      imageSrc: item.image || "",
      imageAlt: item.imageAlt || "",
      title: item.title || "",
      bodyHtml: item.body || "",
    };
  }

  let tableCaptionCounter = 0;

  function renderTableHtml(table, fetchTemplateFn) {
    if (!table) return Promise.resolve("");
    const headers = (table.headers && table.headers[0]) || [];
    const captionId = "block-table-caption-" + ++tableCaptionCounter;
    const T = window.BlockTransformers;
    return Promise.all([
      fetchTemplateFn("table"),
      fetchTemplateFn("table-cell-header"),
      fetchTemplateFn("table-cell"),
      fetchTemplateFn("table-row-header"),
      fetchTemplateFn("table-row"),
    ]).then(function (templates) {
      const mainTpl = templates[0];
      const cellHeaderTpl = templates[1];
      const cellTpl = templates[2];
      const rowHeaderTpl = templates[3];
      const rowTpl = templates[4];
      let headerCellsHtml = "";
      if (headers.length) {
        headerCellsHtml = headers
          .map(function (h) {
            return T.replacePlaceholders(cellHeaderTpl, { content: h });
          })
          .join("");
      }
      const headerRowsHtml = headerCellsHtml
        ? T.replacePlaceholders(rowHeaderTpl, { cellsHtml: headerCellsHtml })
        : "";
      let bodyRowsHtml = "";
      if (table.rows && table.rows.length) {
        bodyRowsHtml = table.rows
          .map(function (row) {
            const cellsHtml = row
              .map(function (cell, i) {
                const dataTitle = headers[i]
                  ? String(headers[i]).replace(/"/g, "&quot;")
                  : "";
                return T.replacePlaceholders(cellTpl, {
                  content: cell,
                  dataTitle: dataTitle,
                });
              })
              .join("");
            return T.replacePlaceholders(rowTpl, { cellsHtml: cellsHtml });
          })
          .join("");
      }
      return T.replacePlaceholders(mainTpl, {
        caption: table.caption || "",
        captionId: captionId,
        modifiers: table.modifiers || "",
        headersHtml: headerRowsHtml,
        rowsHtml: bodyRowsHtml,
      });
    });
  }

  function renderQandaHtml(items, fetchTemplateFn) {
    if (!items || !items.length) return Promise.resolve("");
    const T = window.BlockTransformers;
    return fetchTemplateFn("qanda-item").then(function (template) {
      return items
        .map(function (item) {
          return T.replacePlaceholders(template, {
            question: item.q || "",
            answer: item.a || "",
          });
        })
        .join("");
    });
  }

  window.BlockRenderers = {
    renderListHtml: renderListHtml,
    renderButtonsHtml: renderButtonsHtml,
    renderImageHtml: renderImageHtml,
    prepareCardData: prepareCardData,
    renderTableHtml: renderTableHtml,
    renderQandaHtml: renderQandaHtml,
  };
})();

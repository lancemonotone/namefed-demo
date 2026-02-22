/**
 * NAMEFED – Pure HTML builders (content-agnostic)
 * Receives data, returns HTML. No knowledge of block types or content domain.
 */
(function () {
  function renderListItems(items) {
    return (items || [])
      .map(function (item) {
        return '<li class="block-list__item">' + item + "</li>";
      })
      .join("");
  }

  function buildListHtml(data, modifiers) {
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
    if (!groups.length) return "";

    const mod = modifiers || (data && data.modifiers) || "";
    const baseClass = "block-list" + (mod ? " " + mod : "");

    if (groups.length === 1 && !groups[0].title && !groups[0].intro) {
      const items = groups[0].items || groups[0].dates || [];
      if (!items.length) return "";
      return '<ul class="' + baseClass + '">' + renderListItems(items) + "</ul>";
    }

    const idAttr = data.id ? ' id="' + data.id + '"' : "";
    const wrapperClass = baseClass + " block-list--bordered";
    let html = '<div' + idAttr + ' class="' + wrapperClass + '">';
    groups.forEach(function (group) {
      const items = group.items || group.dates || [];
      html += '<div class="block-list__group">';
      if (group.title) html += '<h3 class="block-list__group-title">' + group.title + "</h3>";
      if (group.intro) html += "<p>" + group.intro + "</p>";
      html += "<ul>" + renderListItems(items) + "</ul></div>";
    });
    if (data.note) html += "<p><em>" + data.note + "</em></p>";
    html += "</div>";
    return html;
  }

  function buildButtonsHtml(buttons) {
    if (!buttons || !buttons.length) return "";
    return buttons
      .map(function (b) {
        const cls = b.class || "btn btn-primary";
        if (b.href != null) {
          return '<a href="' + (b.href || "#") + '" class="' + cls + '">' + b.text + "</a>";
        }
        const type = b.type || "button";
        const disabled = b.disabled ? " disabled" : "";
        const idAttr = b.id ? ' id="' + b.id + '"' : "";
        return (
          "<button type=\"" + type + "\" class=\"" + cls + "\"" + idAttr + disabled + ">" +
          b.text +
          "</button>"
        );
      })
      .join("");
  }

  function buildCtasHtml(ctas) {
    return buildButtonsHtml(ctas);
  }

  /** Prepares card data for block-card.html template. */
  function prepareCardData(item) {
    return {
      modifiers: item.modifiers || "",
      imageHtml: item.image
        ? '<img src="' + item.image + '" alt="' + (item.imageAlt || "") + '">'
        : "",
      title: item.title || "",
      bodyHtml: item.body || "",
    };
  }

  function buildTableHtml(table) {
    if (!table) return "";
    const wide = table.wide ? " block-table--wide" : "";
    let headersHtml = "";
    if (table.headers && table.headers.length) {
      headersHtml =
        "<tr>" +
        table.headers[0].map(function (h) {
          return "<th>" + h + "</th>";
        }).join("") +
        "</tr>";
    }
    let rowsHtml = "";
    if (table.rows && table.rows.length) {
      rowsHtml = table.rows
        .map(function (row) {
          return (
            "<tr>" +
            row.map(function (cell) {
              return "<td>" + cell + "</td>";
            }).join("") +
            "</tr>"
          );
        })
        .join("");
    }
    return (
      '<div class="block-table' +
      wide +
      '"><table class="block-table__table">' +
      '<caption class="visually-hidden">' +
      (table.caption || "") +
      "</caption>" +
      "<thead>" +
      headersHtml +
      "</thead><tbody>" +
      rowsHtml +
      "</tbody></table></div>"
    );
  }

  function buildQandaHtml(items) {
    if (!items || !items.length) return "";
    return items
      .map(function (item) {
        return (
          '<article class="block-qanda__item">' +
          '<h2 class="block-qanda__question">' +
          item.q +
          "</h2>" +
          '<p class="block-qanda__answer">' +
          item.a +
          "</p></article>"
        );
      })
      .join("");
  }

  function buildContactCardHtml(loc) {
    const phoneLabel = loc.phoneLabel || "";
    const faxLabel = loc.faxLabel || "";
    const linkText = loc.contactLinkText || "";
    return (
      '<div class="block-card block-card--compact flow">' +
      "<p><strong>" +
      loc.name +
      "</strong></p>" +
      "<p>" +
      loc.address +
      "</p>" +
      "<p>" +
      phoneLabel +
      " " +
      loc.phone +
      "<br>" +
      faxLabel +
      " " +
      loc.fax +
      "</p>" +
      '<p><a href="' +
      (loc.contactLink || "") +
      '">' +
      linkText +
      "</a></p></div>"
    );
  }

  window.BlockRenderers = {
    list: buildListHtml,
    buttons: buildButtonsHtml,
    ctas: buildCtasHtml,
    prepareCardData: prepareCardData,
    table: buildTableHtml,
    qanda: buildQandaHtml,
    contactCard: buildContactCardHtml,
  };
})();

/**
 * NAMEFED – Data transformers and placeholder resolution
 * Generic transformers, shared ref resolution, placeholder replacement.
 * Content-agnostic: driven by data shape and explicit _render metadata.
 */
(function () {
  const R = window.BlockRenderers;

  function replacePlaceholders(str, data) {
    if (!str) return "";
    return String(str).replace(/\{\{(\w+)\}\}/g, function (_, key) {
      const val = data[key];
      return val != null ? String(val) : "";
    });
  }

  /**
   * Resolves {{@key}} from shared data.
   * Uses explicit _render when present, else falls back to structure detection.
   */
  function resolveSharedRef(key, context, shared) {
    const val = shared[key];
    if (val == null) return "";

    const renderAs = val._render;
    const listModifiers = (context && context.listModifiers) || "";

    if (renderAs === "list") {
      return R.list(val, listModifiers);
    }
    if (renderAs === "contact-card") {
      return R.contactCard(val);
    }

    if (!renderAs) {
      if (Array.isArray(val)) return R.list(val, listModifiers);
      if (val && Array.isArray(val.groups)) return R.list(val, listModifiers);
      if (val && typeof val === "object" && val.name != null && val.address != null) {
        return R.contactCard(val);
      }
    }

    return String(val);
  }

  function replaceSharedRefs(str, context, shared) {
    if (!str || !shared) return str;
    return String(str).replace(/\{\{@(\w+)\}\}/g, function (_, key) {
      return resolveSharedRef(key, context, shared);
    });
  }

  const genericTransformers = [
    {
      key: "list",
      outputKey: "listHtml",
      fn: function (v, data) {
        return R.list(v, data.listModifiers);
      },
    },
    {
      key: "list2",
      outputKey: "list2Html",
      fn: function (v, data) {
        return R.list(v, data.listModifiers);
      },
    },
    {
      key: "table",
      outputKey: "tableHtml",
      fn: R.table,
    },
  ];

  function applyGenericTransformers(data) {
    const result = Object.assign({}, data);
    result.modifiers = result.modifiers || "";
    for (var i = 0; i < genericTransformers.length; i++) {
      const t = genericTransformers[i];
      if (result[t.key] != null) {
        result[t.outputKey] = t.fn(result[t.key], result);
      }
    }
    return result;
  }

  function resolvePlaceholdersInData(data, shared) {
    const result = Object.assign({}, data);
    var keys = ["innerHtml", "contentHtml"];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (result[k]) {
        if (shared && result[k].indexOf("{{@") !== -1) {
          result[k] = replaceSharedRefs(result[k], result, shared);
        }
        result[k] = replacePlaceholders(result[k], result);
      }
    }
    return result;
  }

  window.BlockTransformers = {
    replacePlaceholders: replacePlaceholders,
    replaceSharedRefs: replaceSharedRefs,
    resolveSharedRef: resolveSharedRef,
    applyGenericTransformers: applyGenericTransformers,
    resolvePlaceholdersInData: resolvePlaceholdersInData,
  };
})();

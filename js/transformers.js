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
   * Renders block if shared[key] has type.
   */
  function resolveSharedRef(key, context, shared, fetchTemplateFn) {
    const val = shared[key];
    if (val == null) return "";

    if (val?.type && fetchTemplateFn) {
      return window.renderBlock(val.type, val.data || val, shared);
    }

    return String(val);
  }

  function replaceSharedRefs(str, context, shared, fetchTemplateFn) {
    if (!str || !shared) return Promise.resolve(str);
    if (str.indexOf("{{@") === -1) return Promise.resolve(str);
    const keys = [];
    const seen = {};
    let m;
    const re = /\{\{@(\w+)\}\}/g;
    while ((m = re.exec(str)) !== null) {
      if (!seen[m[1]]) {
        seen[m[1]] = true;
        keys.push(m[1]);
      }
    }
    if (!keys.length) return Promise.resolve(str);
    return Promise.all(
      keys.map(function (k) {
        return Promise.resolve(
          resolveSharedRef(k, context, shared, fetchTemplateFn),
        );
      }),
    ).then(function (results) {
      const map = {};
      keys.forEach(function (k, i) {
        map[k] = results[i];
      });
      return String(str).replace(/\{\{@(\w+)\}\}/g, function (_, key) {
        return map[key] != null ? map[key] : "";
      });
    });
  }

  const genericTransformers = [
    {
      key: "list",
      outputKey: "listHtml",
      fn: function (v, data, fetchTemplateFn) {
        return fetchTemplateFn
          ? R.renderListHtml(v, data.listModifiers, fetchTemplateFn)
          : "";
      },
    },
    {
      key: "list2",
      outputKey: "list2Html",
      fn: function (v, data, fetchTemplateFn) {
        return fetchTemplateFn
          ? R.renderListHtml(v, data.listModifiers, fetchTemplateFn)
          : "";
      },
    },
    {
      key: "buttons",
      outputKey: "buttonsHtml",
      fn: function (v, data, fetchTemplateFn) {
        if (!v || !v.length) return Promise.resolve("");
        if (!fetchTemplateFn) return Promise.resolve("");
        return R.renderButtonsHtml(v, fetchTemplateFn).then(
          function (buttonsHtml) {
            return fetchTemplateFn("buttons").then(function (tpl) {
              return replacePlaceholders(tpl, { buttonsHtml: buttonsHtml });
            });
          },
        );
      },
    },
  ];

  function applyGenericTransformers(data, fetchTemplateFn) {
    const result = Object.assign({}, data);
    result.modifiers = result.modifiers || "";
    const promises = [];
    for (var i = 0; i < genericTransformers.length; i++) {
      (function (t) {
        if (result[t.key] != null) {
          const p = Promise.resolve(
            t.fn(result[t.key], result, fetchTemplateFn),
          );
          promises.push(
            p.then(function (val) {
              result[t.outputKey] = val;
            }),
          );
        }
      })(genericTransformers[i]);
    }
    return Promise.all(promises).then(function () {
      return result;
    });
  }

  function resolvePlaceholdersInData(data, shared, fetchTemplateFn) {
    const result = Object.assign({}, data);
    const keys = ["innerHtml", "contentHtml"];
    let p = Promise.resolve();
    keys.forEach(function (k) {
      if (result[k]) {
        if (shared && result[k].indexOf("{{@") !== -1) {
          p = p
            .then(function () {
              return replaceSharedRefs(
                result[k],
                result,
                shared,
                fetchTemplateFn,
              );
            })
            .then(function (html) {
              result[k] = html;
            });
        }
      }
    });
    return p.then(function () {
      keys.forEach(function (k) {
        if (result[k]) result[k] = replacePlaceholders(result[k], result);
      });
      return result;
    });
  }

  window.BlockTransformers = {
    replacePlaceholders: replacePlaceholders,
    replaceSharedRefs: replaceSharedRefs,
    resolveSharedRef: resolveSharedRef,
    applyGenericTransformers: applyGenericTransformers,
    resolvePlaceholdersInData: resolvePlaceholdersInData,
  };
})();

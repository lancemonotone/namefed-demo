/**
 * NAMEFED – Generic modal (dialog) wrapper
 * Use with <dialog class="modal">. Content-agnostic; can wrap anything.
 */
(function () {
  'use strict';

  var Modal = {
    /**
     * Initialize a modal: wire close button, optional onClose callback.
     * @param {HTMLDialogElement} dialog - The dialog element
     * @param {Object} [options]
     * @param {string} [options.closeSelector='.modal__close'] - Selector for close button
     * @param {Function} [options.onClose] - Called when dialog closes (Escape, close btn, etc.)
     */
    init: function (dialog, options) {
      if (!dialog || dialog.tagName !== 'DIALOG') return;
      options = options || {};
      var closeSelector = options.closeSelector || '.modal__close';
      var closeBtn = dialog.querySelector(closeSelector);
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          dialog.close();
        });
      }
      dialog.addEventListener('click', function (e) {
        if (e.target === dialog) dialog.close();
      });
      if (typeof options.onClose === 'function') {
        dialog.addEventListener('close', options.onClose);
      }
    },

    /**
     * Open a modal and optionally focus an element.
     * @param {HTMLDialogElement} dialog - The dialog element
     * @param {Object} [options]
     * @param {string} [options.focusSelector] - Selector for element to focus when opened
     */
    open: function (dialog, options) {
      if (!dialog || dialog.tagName !== 'DIALOG') return;
      options = options || {};
      dialog.showModal();
      if (options.focusSelector) {
        var el = dialog.querySelector(options.focusSelector);
        if (el) {
          setTimeout(function () { el.focus(); }, 100);
        }
      }
    }
  };

  window.Modal = Modal;
})();

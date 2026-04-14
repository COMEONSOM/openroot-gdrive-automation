/**
 * @product     Drive Smart Renamer
 * @company     OpenRoot Systems
 * @copyright   © 2024 OpenRoot Systems. All rights reserved.
 * @license     Proprietary — Unauthorized copying, cloning, or redistribution
 *              of this software is strictly prohibited.
 */

(function () {
  "use strict";

  // Guard: prevent double-injection if content script loads more than once
  if (window.__openroot_renamer_loaded) return;
  window.__openroot_renamer_loaded = true;

  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    if (request.action !== "START_RENAME") return;

    // Confirm script is alive; popup.js reads this acknowledgement
    sendResponse({ ok: true, source: "openroot-content-script" });
  });

})();
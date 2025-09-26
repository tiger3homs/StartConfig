// ==UserScript==
// @name         CS Crosshairr
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Optimized static line-style crosshair with customizable settings, profiles, shadow, border, and UI panel visibility toggled by Alt+Shift+Z, also managing PointerLock.
// @author       Tiger3homs aka (obbe.00 on discord) - Refactored by AI Assistant
// @match        https://game.play-cs.com/*
// @icon         https://play-cs.com/img/favicon.png
// @grant        none
// @require      https://github.com/tiger3homs/scripts2play-cs/new/main/crosshair/v2/path/to/config.js
// @require      https://github.com/tiger3homs/scripts2play-cs/new/main/crosshair/v2//path/to/storage.js
// @require      https://github.com/tiger3homs/scripts2play-cs/new/main/crosshair/v2//path/to/dom.js
// @require      https://github.com/tiger3homs/scripts2play-cs/new/main/crosshair/v2//path/to/ui.js
// @require      https://github.com/tiger3homs/scripts2play-cs/new/main/crosshair/v2//path/to/events.js
// @require      https://github.com/tiger3homs/scripts2play-cs/new/main/crosshair/v2//path/to/crosshairManager.js
// @resource     CROSSHAIR_CSS https://github.com/tiger3homs/scripts2play-cs/new/main/crosshair/v2/path/to/style.css
// ==/UserScript==

(function () {
    'use strict';

    // Inject CSS from resource
    const styleElement = document.createElement('style');
    styleElement.textContent = GM_getResourceText('CROSSHAIR_CSS');
    document.head.appendChild(styleElement);

    // Initialize the manager once all dependencies are loaded
    window.crosshairInstance = new CrosshairManager();
})();
```

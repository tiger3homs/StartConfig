// events.js - Manages all event listeners
(function() {
    'use strict';

    // Ensure config constants are available
    if (typeof window.UI_PANEL_TOGGLE_KEY_CODE === 'undefined' || typeof window.UI_PANEL_TOGGLE_MODIFIERS === 'undefined') {
        console.error("Events module requires config.js to be loaded first.");
        return;
    }

    // A simple debounce function
    window.debounce = function(func, delay) {
        let timer;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    window.setupCrosshairEventListeners = function(toggleUIPanelAndPointerLockCallback, handlePointerLockChangeCallback, renderCrosshairCallback) {
        document.addEventListener('keydown', (event) => {
            if (event.code === window.UI_PANEL_TOGGLE_KEY_CODE &&
                event.altKey === window.UI_PANEL_TOGGLE_MODIFIERS.alt &&
                event.shiftKey === window.UI_PANEL_TOGGLE_MODIFIERS.shift &&
                !event.repeat) {
                toggleUIPanelAndPointerLockCallback(event);
            }
        });

        document.addEventListener('pointerlockchange', window.debounce(handlePointerLockChangeCallback, 50));

        window.addEventListener('resize', window.debounce(() => {
            renderCrosshairCallback();
        }, 100));
    };
})();

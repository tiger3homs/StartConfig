// config.js - Global constants and default settings
(function() {
    'use strict';

    window.STORAGE_KEY = 'customCrosshairConfigV3';
    window.UI_PANEL_TOGGLE_KEY_CODE = 'KeyZ';
    window.UI_PANEL_TOGGLE_MODIFIERS = { alt: true, shift: true };

    window.DEFAULT_PROFILE_SETTINGS = {
        length: 10,
        thickness: 2,
        gap: 4,
        color: '#ffffff',
        opacity: 1.0,
        shadowEnabled: false,
        shadowColor: '#000000',
        shadowBlur: 2,
        shadowX: 1,
        shadowY: 1,
        borderEnabled: false,
        borderColor: '#000000',
        borderThickness: 1,
    };

    window.DEFAULT_CONFIG = {
        profiles: {
            'Default': { ...window.DEFAULT_PROFILE_SETTINGS }
        },
        currentProfileName: 'Default',
        enabled: true,
        menuVisible: false,
        uiPanelVisible: false,
        gameWasPointerLocked: false
    };
})();

// config.js
// Defines global constants and default configuration settings.

// Changed storage key for V3
window.CH_STORAGE_KEY = 'customCrosshairConfigV3';
window.CH_UI_PANEL_TOGGLE_KEY_CODE = 'KeyZ';
window.CH_UI_PANEL_TOGGLE_MODIFIERS = { alt: true, shift: true };

// Default settings for a single crosshair profile
window.CH_DEFAULT_PROFILE_SETTINGS = {
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

// Global configuration structure
window.CH_DEFAULT_CONFIG = {
    profiles: {
        'Default': { ...CH_DEFAULT_PROFILE_SETTINGS }
    },
    currentProfileName: 'Default',
    enabled: true, // Global ON/OFF for the entire custom crosshair system
    menuVisible: false,
    uiPanelVisible: false,
    gameWasPointerLocked: false
};

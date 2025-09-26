// storage.js - Handles localStorage operations
(function() {
    'use strict';

    // Ensure config constants are available
    if (typeof window.STORAGE_KEY === 'undefined' || typeof window.DEFAULT_CONFIG === 'undefined' || typeof window.DEFAULT_PROFILE_SETTINGS === 'undefined') {
        console.error("Storage module requires config.js to be loaded first.");
        return;
    }

    window.loadCrosshairConfig = function() {
        try {
            const saved = JSON.parse(localStorage.getItem(window.STORAGE_KEY));

            if (saved && typeof saved === 'object' && saved.profiles) {
                for (const profileName in saved.profiles) {
                    saved.profiles[profileName] = { ...window.DEFAULT_PROFILE_SETTINGS, ...saved.profiles[profileName] };
                }
                if (!saved.profiles[saved.currentProfileName]) {
                    saved.currentProfileName = Object.keys(saved.profiles)[0] || 'Default';
                    if (!saved.profiles[saved.currentProfileName]) {
                        saved.profiles = { 'Default': { ...window.DEFAULT_PROFILE_SETTINGS } };
                        saved.currentProfileName = 'Default';
                    }
                }
                return { ...window.DEFAULT_CONFIG, ...saved };
            }
            console.warn("Invalid or old crosshair config detected, using defaults.");
            return { ...window.DEFAULT_CONFIG };
        } catch (e) {
            console.error("Failed to load crosshair config, using defaults.", e);
            return { ...window.DEFAULT_CONFIG };
        }
    };

    window.saveCrosshairConfig = function(config) {
        localStorage.setItem(window.STORAGE_KEY, JSON.stringify(config));
    };

    window.resetCrosshairConfig = function() {
        if (!confirm('Are you sure you want to reset ALL crosshair settings and profiles to default? This cannot be undone.')) {
            return null; // Indicate reset was cancelled
        }
        const newConfig = { ...window.DEFAULT_CONFIG };
        window.saveCrosshairConfig(newConfig);
        return newConfig;
    };
})();

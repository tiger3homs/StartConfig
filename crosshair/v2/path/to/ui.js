// utils.js
// Contains utility functions like debounce and configuration loading/saving.

// Debounce function to limit the rate at which a function can fire
window.CH_debounce = (func, delay) => {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
};

// Loads configuration from localStorage, merging with defaults.
window.CH_loadConfig = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(CH_STORAGE_KEY));

        if (saved && typeof saved === 'object' && saved.profiles) {
            // Ensure all profiles have default settings merged in case new properties are added
            for (const profileName in saved.profiles) {
                saved.profiles[profileName] = { ...CH_DEFAULT_PROFILE_SETTINGS, ...(saved.profiles[profileName] || {}) };
            }
            // Ensure the currentProfileName is valid, or fall back to 'Default'
            if (!saved.profiles[saved.currentProfileName]) {
                saved.currentProfileName = Object.keys(saved.profiles)[0] || 'Default';
                if (!saved.profiles[saved.currentProfileName]) { // If no profiles exist
                    saved.profiles = { 'Default': { ...CH_DEFAULT_PROFILE_SETTINGS } };
                    saved.currentProfileName = 'Default';
                }
            }
            return { ...CH_DEFAULT_CONFIG, ...saved }; // Merge global settings
        }
        console.warn("Invalid or old crosshair config detected, using defaults.");
        return { ...CH_DEFAULT_CONFIG }; // Fallback to full defaults if structure is old or invalid
    } catch (e) {
        console.error("Failed to load crosshair config, using defaults.", e);
        return { ...CH_DEFAULT_CONFIG };
    }
};

// Saves the current configuration to localStorage.
window.CH_saveConfig = (config) => {
    localStorage.setItem(CH_STORAGE_KEY, JSON.stringify(config));
};

// Resets configuration to default.
window.CH_resetConfig = (appInstance) => {
    if (!confirm('Are you sure you want to reset ALL crosshair settings and profiles to default? This cannot be undone.')) {
        return;
    }
    appInstance.config = { ...CH_DEFAULT_CONFIG }; // Reset to initial default structure
    CH_saveConfig(appInstance.config);
    appInstance.initializeUI(); // Re-render UI with default values
    appInstance.renderCrosshair();
};

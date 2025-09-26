// profileManager.js
// Manages crosshair profiles (add, delete, rename).

window.CH_ProfileManager = class {
    constructor(config, saveConfig, initializeUI, renderCrosshair, updateMenuProfileSelector) {
        this.config = config;
        this.saveConfig = saveConfig;
        this.initializeUI = initializeUI;
        this.renderCrosshair = renderCrosshair;
        this.updateMenuProfileSelector = updateMenuProfileSelector; // New dependency
    }

    get currentProfile() {
        if (!this.config.profiles[this.config.currentProfileName]) {
            console.warn(`Current profile '${this.config.currentProfileName}' not found. Reverting to 'Default'.`);
            this.config.currentProfileName = 'Default';
            if (!this.config.profiles['Default']) {
                this.config.profiles['Default'] = { ...CH_DEFAULT_PROFILE_SETTINGS };
            }
            this.saveConfig(this.config);
            this.updateMenuProfileSelector();
        }
        return this.config.profiles[this.config.currentProfileName];
    }

    addProfile(name) {
        if (this.config.profiles[name]) {
            alert(`A profile named '${name}' already exists.`);
            return false;
        }
        this.config.profiles[name] = { ...this.currentProfile }; // Clone current settings
        this.config.currentProfileName = name;
        this.saveConfig(this.config);
        this.initializeUI(); // Rebuild UI to reflect new profile and selection
        this.renderCrosshair();
        return true;
    }

    deleteProfile(name) {
        if (Object.keys(this.config.profiles).length <= 1) {
            alert('Cannot delete the last remaining profile.');
            return false;
        }
        if (name === 'Default') {
            alert('The "Default" profile cannot be deleted.');
            return false;
        }
        if (!confirm(`Are you sure you want to delete profile '${name}'?`)) {
            return false;
        }

        delete this.config.profiles[name];
        if (this.config.currentProfileName === name) {
            this.config.currentProfileName = 'Default'; // Switch to default if active profile deleted
        }
        this.saveConfig(this.config);
        this.initializeUI();
        this.renderCrosshair();
        return true;
    }

    renameProfile(oldName, newName) {
        if (newName === oldName) return;
        if (this.config.profiles[newName]) {
            alert(`A profile named '${newName}' already exists.`);
            return false;
        }
        if (oldName === 'Default') {
            alert('The "Default" profile cannot be renamed.');
            return false;
        }
        if (!confirm(`Rename profile '${oldName}' to '${newName}'?`)) {
            return false;
        }

        this.config.profiles[newName] = this.config.profiles[oldName];
        delete this.config.profiles[oldName];
        if (this.config.currentProfileName === oldName) {
            this.config.currentProfileName = newName;
        }
        this.saveConfig(this.config);
        this.initializeUI();
        this.renderCrosshair();
        return true;
    }
};

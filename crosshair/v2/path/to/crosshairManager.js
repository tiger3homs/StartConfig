// crosshairManager.js - The main class orchestrating all components
(function() {
    'use strict';

    // Ensure all required functions and constants are available from other modules
    if (
        typeof window.STORAGE_KEY === 'undefined' ||
        typeof window.DEFAULT_CONFIG === 'undefined' ||
        typeof window.DEFAULT_PROFILE_SETTINGS === 'undefined' ||
        typeof window.loadCrosshairConfig === 'undefined' ||
        typeof window.saveCrosshairConfig === 'undefined' ||
        typeof window.resetCrosshairConfig === 'undefined' ||
        typeof window.createCrosshairDOM === 'undefined' ||
        typeof window.applyCrosshairStyles === 'undefined' ||
        typeof window.updateCrosshairVisibility === 'undefined' ||
        typeof window.updateMenuVisibility === 'undefined' ||
        typeof window.updateUIPanelVisibility === 'undefined' ||
        typeof window.setupCrosshairMenu === 'undefined' ||
        typeof window.updateMenuProfileSelector === 'undefined' ||
        typeof window.setupUIControlPanel === 'undefined' ||
        typeof window.updateUIControlPanel === 'undefined' ||
        typeof window.setupCrosshairEventListeners === 'undefined' ||
        typeof window.debounce === 'undefined'
    ) {
        console.error("CrosshairManager: One or more dependency modules failed to load correctly.");
        return;
    }

    class CrosshairManager {
        constructor() {
            this.config = window.loadCrosshairConfig();
            this.elements = window.createCrosshairDOM(); // Create initial DOM elements
            this.setupEventListeners();
            this.initializeUI(); // Renders the UI based on loaded config
            this.renderCrosshair(); // Applies crosshair styles
        }

        // --- Configuration & Render Logic ---
        saveConfig() {
            window.saveCrosshairConfig(this.config);
        }

        resetConfig = () => { // Use arrow function to bind 'this'
            const newConfig = window.resetCrosshairConfig();
            if (newConfig) { // Only if reset was confirmed
                this.config = newConfig;
                this.initializeUI(true); // Re-render UI with default values, force full rebuild
                this.renderCrosshair();
                this.saveConfig(); // Save the newly reset config
            }
        }

        get currentProfile() {
            if (!this.config.profiles[this.config.currentProfileName]) {
                console.warn(`Current profile '${this.config.currentProfileName}' not found. Reverting to 'Default'.`);
                this.config.currentProfileName = 'Default';
                if (!this.config.profiles['Default']) {
                    this.config.profiles['Default'] = { ...window.DEFAULT_PROFILE_SETTINGS };
                }
                this.saveConfig();
                window.updateMenuProfileSelector(this.elements, this.config);
            }
            return this.config.profiles[this.config.currentProfileName];
        }

        renderCrosshair() {
            window.updateCrosshairVisibility(this.elements.crosshairContainer, this.config.enabled);
            window.applyCrosshairStyles(this.currentProfile);
        }

        // --- Profile Management Actions (Passed to UI module) ---
        addProfile = () => {
            const newName = prompt('Enter name for new profile (will copy current settings):');
            if (newName && newName.trim() !== '') {
                const trimmedName = newName.trim();
                if (this.config.profiles[trimmedName]) {
                    alert(`A profile named '${trimmedName}' already exists.`);
                    return false;
                }
                this.config.profiles[trimmedName] = { ...this.currentProfile };
                this.config.currentProfileName = trimmedName;
                this.saveConfig();
                this.initializeUI(true);
                this.renderCrosshair();
                return true;
            }
            return false;
        }

        deleteProfile = () => {
            const nameToDelete = this.config.currentProfileName;
            if (Object.keys(this.config.profiles).length <= 1) {
                alert('Cannot delete the last remaining profile.');
                return false;
            }
            if (nameToDelete === 'Default') {
                alert('The "Default" profile cannot be deleted.');
                return false;
            }
            if (!confirm(`Are you sure you want to delete profile '${nameToDelete}'?`)) {
                return false;
            }

            delete this.config.profiles[nameToDelete];
            if (this.config.currentProfileName === nameToDelete) {
                this.config.currentProfileName = 'Default';
            }
            this.saveConfig();
            this.initializeUI(true);
            this.renderCrosshair();
            return true;
        }

        renameProfile = () => {
            const oldName = this.config.currentProfileName;
            if (oldName === 'Default') {
                alert('The "Default" profile cannot be renamed.');
                return;
            }
            const newName = prompt(`Rename '${oldName}' to:`, oldName);
            if (newName && newName.trim() !== '' && newName.trim() !== oldName) {
                const trimmedNewName = newName.trim();
                if (this.config.profiles[trimmedNewName]) {
                    alert(`A profile named '${trimmedNewName}' already exists.`);
                    return false;
                }
                if (!confirm(`Rename profile '${oldName}' to '${trimmedNewName}'?`)) {
                    return false;
                }

                this.config.profiles[trimmedNewName] = this.config.profiles[oldName];
                delete this.config.profiles[oldName];
                if (this.config.currentProfileName === oldName) {
                    this.config.currentProfileName = trimmedNewName;
                }
                this.saveConfig();
                this.initializeUI(true);
                this.renderCrosshair();
                return true;
            }
            return false;
        }


        // --- UI Interactions ---
        toggleCrosshair = () => {
            this.config.enabled = !this.config.enabled;
            this.saveConfig();
            this.renderCrosshair();
            window.updateUIControlPanel(this.elements, this.config);
        }

        toggleMenu = () => {
            this.config.menuVisible = !this.config.menuVisible;
            window.updateMenuVisibility(this.elements.menu, this.config.menuVisible);
            this.saveConfig();
            window.updateUIControlPanel(this.elements, this.config);
        }

        toggleUIPanelAndPointerLock = (event) => {
            if (event) event.preventDefault();

            this.config.uiPanelVisible = !this.config.uiPanelVisible;
            window.updateUIPanelVisibility(this.elements.uiControlPanel, this.config.uiPanelVisible);
            this.saveConfig();

            if (this.config.uiPanelVisible) {
                if (document.pointerLockElement) {
                    this.config.gameWasPointerLocked = true;
                    document.exitPointerLock();
                } else {
                    this.config.gameWasPointerLocked = false;
                }
            } else {
                if (this.config.gameWasPointerLocked) {
                    const gameCanvas = document.querySelector('canvas');
                    if (gameCanvas) {
                        gameCanvas.requestPointerLock().catch(e => console.error("Failed to request pointer lock:", e));
                    } else {
                        document.body.requestPointerLock().catch(e => console.error("Failed to request pointer lock on body:", e));
                    }
                }
                this.config.gameWasPointerLocked = false;
            }
            this.saveConfig();
        }

        handlePointerLockChange = () => {
            if (!document.pointerLockElement && this.config.gameWasPointerLocked && !this.config.uiPanelVisible) {
                this.config.gameWasPointerLocked = false;
                this.saveConfig();
            }
        }

        // --- Setup ---
        setupEventListeners() {
            window.setupCrosshairEventListeners(
                this.toggleUIPanelAndPointerLock,
                this.handlePointerLockChange,
                this.renderCrosshair
            );
        }

        initializeUI(forceMenuRebuild = false) {
            // Only rebuild the menu structure if necessary (e.g., profile added/deleted)
            // Otherwise, just update the values in existing controls.
            if (forceMenuRebuild || !this.elements.menu.hasChildNodes()) {
                window.setupCrosshairMenu(this.elements, this.config, {
                    add: this.addProfile,
                    delete: this.deleteProfile,
                    rename: this.renameProfile,
                    toggleCrosshair: this.toggleCrosshair,
                    reset: this.resetConfig
                }, () => { // Callback for when a control value changes
                    this.saveConfig();
                    this.renderCrosshair();
                });
            } else {
                // Just update the values of existing controls and profile selector
                window.setupCrosshairMenu(this.elements, this.config, {
                    add: this.addProfile,
                    delete: this.deleteProfile,
                    rename: this.renameProfile,
                    toggleCrosshair: this.toggleCrosshair,
                    reset: this.resetConfig
                }, () => { // Callback for when a control value changes
                    this.saveConfig();
                    this.renderCrosshair();
                });
            }

            window.setupUIControlPanel(this.elements, this.toggleCrosshair, this.toggleMenu, this.config);
            window.updateMenuVisibility(this.elements.menu, this.config.menuVisible);
            window.updateUIPanelVisibility(this.elements.uiControlPanel, this.config.uiPanelVisible);
        }
    }

    // Expose the class globally if needed, or instantiate it directly in main.user.js
    window.CrosshairManager = CrosshairManager;
})();

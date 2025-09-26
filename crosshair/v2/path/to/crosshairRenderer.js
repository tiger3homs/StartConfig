// crosshairRenderer.js
// Renders the crosshair based on current settings and manages its visibility.

window.CH_CrosshairRenderer = class {
    constructor(config, elements, profileManager) {
        this.config = config;
        this.elements = elements;
        this.profileManager = profileManager; // To access currentProfile
    }

    applyCrosshairStyles() {
        const profile = this.profileManager.currentProfile;
        if (!profile) return;

        document.documentElement.style.setProperty('--ch-length', `${profile.length}px`);
        document.documentElement.style.setProperty('--ch-thickness', `${profile.thickness}px`);
        document.documentElement.style.setProperty('--ch-gap', `${profile.gap}px`);
        document.documentElement.style.setProperty('--ch-color', profile.color);
        document.documentElement.style.setProperty('--ch-opacity', profile.opacity);

        if (profile.shadowEnabled) {
            document.documentElement.style.setProperty('--ch-box-shadow',
                `${profile.shadowX}px ${profile.shadowY}px ${profile.shadowBlur}px ${profile.shadowColor}`);
        } else {
            document.documentElement.style.setProperty('--ch-box-shadow', 'none');
        }

        if (profile.borderEnabled) {
            document.documentElement.style.setProperty('--ch-outline',
                `${profile.borderThickness}px solid ${profile.borderColor}`);
        } else {
            document.documentElement.style.setProperty('--ch-outline', 'none');
        }
    }

    renderCrosshair() {
        if (this.elements.crosshairContainer) {
            this.elements.crosshairContainer.style.display = this.config.enabled ? 'block' : 'none';
        }
        this.applyCrosshairStyles();
    }
};

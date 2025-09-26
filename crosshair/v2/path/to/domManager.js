// domManager.js
// Handles the creation and initial setup of all necessary DOM elements.

window.CH_DOMManager = class {
    constructor(config) {
        this.config = config;
        this.elements = {}; // To store references to created DOM elements
        this.setupDOM();
    }

    setupDOM() {
        // Crosshair Container and Lines
        this.elements.crosshairContainer = document.createElement('div');
        this.elements.crosshairContainer.id = 'custom-crosshair-lines';
        this.elements.crosshairContainer.innerHTML = `
            <div class="crosshair-line crosshair-line-top"></div>
            <div class="crosshair-line crosshair-line-bottom"></div>
            <div class="crosshair-line crosshair-line-left"></div>
            <div class="crosshair-line crosshair-line-right"></div>
        `;
        document.body.appendChild(this.elements.crosshairContainer);

        // Menu Panel
        this.elements.menu = document.createElement('div');
        this.elements.menu.id = 'custom-crosshair-menu';
        document.body.appendChild(this.elements.menu);

        // UI Control Panel
        this.elements.uiControlPanel = document.createElement('div');
        this.elements.uiControlPanel.id = 'custom-crosshair-ui-panel';
        document.body.appendChild(this.elements.uiControlPanel);
    }
};

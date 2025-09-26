// dom.js - Functions for creating crosshair DOM elements and applying styles
(function() {
    'use strict';

    window.createCrosshairDOM = function() {
        const elements = {};
        elements.crosshairContainer = document.createElement('div');
        elements.crosshairContainer.id = 'custom-crosshair-lines';
        elements.crosshairContainer.innerHTML = `
            <div class="crosshair-line crosshair-line-top"></div>
            <div class="crosshair-line crosshair-line-bottom"></div>
            <div class="crosshair-line crosshair-line-left"></div>
            <div class="crosshair-line crosshair-line-right"></div>
        `;
        document.body.appendChild(elements.crosshairContainer);

        elements.menu = document.createElement('div');
        elements.menu.id = 'custom-crosshair-menu';
        document.body.appendChild(elements.menu);

        elements.uiControlPanel = document.createElement('div');
        elements.uiControlPanel.id = 'custom-crosshair-ui-panel';
        document.body.appendChild(elements.uiControlPanel);

        return elements;
    };

    window.applyCrosshairStyles = function(profile) {
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
    };

    window.updateCrosshairVisibility = function(container, enabled) {
        container.style.display = enabled ? 'block' : 'none';
    };

    window.updateMenuVisibility = function(menuElement, menuVisible) {
        menuElement.style.display = menuVisible ? 'block' : 'none';
    };

    window.updateUIPanelVisibility = function(uiPanelElement, uiPanelVisible) {
        uiPanelElement.style.display = uiPanelVisible ? 'block' : 'none';
    };

})();

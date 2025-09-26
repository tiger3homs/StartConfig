// ui.js - Functions for building and updating the UI
(function() {
    'use strict';

    // Ensure config constants are available
    if (typeof window.DEFAULT_PROFILE_SETTINGS === 'undefined') {
        console.error("UI module requires config.js to be loaded first.");
        return;
    }

    // Helper to create a UI control element
    window.createMenuControl = function(parent, labelText, type, key, value, configRef, updateCallback, options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'crosshair-menu-control';

        const label = document.createElement('label');
        label.textContent = `${labelText}: `;
        wrapper.appendChild(label);

        const input = document.createElement('input');
        input.type = type;
        input.value = value;

        if (type === 'range') {
            input.min = options.min;
            input.max = options.max;
            input.step = options.step;
            const valueDisplay = document.createElement('span');
            valueDisplay.textContent = value;
            valueDisplay.className = 'value-display';
            input.oninput = () => {
                configRef[key] = parseFloat(input.value);
                valueDisplay.textContent = input.value;
                updateCallback();
            };
            wrapper.appendChild(input);
            wrapper.appendChild(valueDisplay);
        } else if (type === 'color' || type === 'number') {
            input.oninput = () => {
                configRef[key] = input.value;
                updateCallback();
            };
            wrapper.appendChild(input);
        } else if (type === 'checkbox') {
            input.checked = value;
            input.onchange = () => {
                configRef[key] = input.checked;
                updateCallback();
            };
            wrapper.appendChild(input);
        }
        parent.appendChild(wrapper);
    };

    // Builds the entire menu structure
    window.setupCrosshairMenu = function(elements, config, profileActions, updateCallback) {
        const menu = elements.menu;
        menu.innerHTML = `<h3>Crosshair Config</h3>`;

        // Profile Management
        const profileManagerDiv = document.createElement('div');
        profileManagerDiv.className = 'profile-manager';
        profileManagerDiv.innerHTML = `
            <div class="crosshair-menu-control">
                <label>Current Profile:</label>
                <select id="profile-selector"></select>
            </div>
            <div class="profile-action-group">
                <button id="add-profile-btn" class="secondary">Save New</button>
                <button id="rename-profile-btn" class="secondary">Rename</button>
                <button id="delete-profile-btn" class="danger">Delete</button>
            </div>
        `;
        menu.appendChild(profileManagerDiv);

        elements.profileSelector = profileManagerDiv.querySelector('#profile-selector');
        elements.addProfileBtn = profileManagerDiv.querySelector('#add-profile-btn');
        elements.renameProfileBtn = profileManagerDiv.querySelector('#rename-profile-btn');
        elements.deleteProfileBtn = profileManagerDiv.querySelector('#delete-profile-btn');

        elements.profileSelector.onchange = (e) => {
            config.currentProfileName = e.target.value;
            updateCallback(true); // Re-render everything for new profile
        };

        elements.addProfileBtn.onclick = profileActions.add;
        elements.renameProfileBtn.onclick = profileActions.rename;
        elements.deleteProfileBtn.onclick = profileActions.delete;

        window.updateMenuProfileSelector(elements, config);

        // Current profile reference for controls
        const currentProfile = config.profiles[config.currentProfileName];

        // Basic Crosshair Settings
        const settingsDiv = document.createElement('div');
        menu.appendChild(settingsDiv);

        window.createMenuControl(settingsDiv, 'Length', 'range', 'length', currentProfile.length, currentProfile, updateCallback, { min: 1, max: 50, step: 1 });
        window.createMenuControl(settingsDiv, 'Thickness', 'range', 'thickness', currentProfile.thickness, currentProfile, updateCallback, { min: 1, max: 10, step: 1 });
        window.createMenuControl(settingsDiv, 'Gap', 'range', 'gap', currentProfile.gap, currentProfile, updateCallback, { min: 0, max: 30, step: 1 });
        window.createMenuControl(settingsDiv, 'Color', 'color', 'color', currentProfile.color, currentProfile, updateCallback);
        window.createMenuControl(settingsDiv, 'Opacity', 'range', 'opacity', currentProfile.opacity, currentProfile, updateCallback, { min: 0.1, max: 1.0, step: 0.05 });

        // Shadow Settings
        const shadowSection = document.createElement('div');
        shadowSection.innerHTML = '<h4 style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px;">Shadow</h4>';
        window.createMenuControl(shadowSection, 'Enable Shadow', 'checkbox', 'shadowEnabled', currentProfile.shadowEnabled, currentProfile, updateCallback);
        window.createMenuControl(shadowSection, 'Shadow Color', 'color', 'shadowColor', currentProfile.shadowColor, currentProfile, updateCallback);
        window.createMenuControl(shadowSection, 'Blur Radius', 'range', 'shadowBlur', currentProfile.shadowBlur, currentProfile, updateCallback, { min: 0, max: 10, step: 1 });
        window.createMenuControl(shadowSection, 'Offset X', 'range', 'shadowX', currentProfile.shadowX, currentProfile, updateCallback, { min: -10, max: 10, step: 1 });
        window.createMenuControl(shadowSection, 'Offset Y', 'range', 'shadowY', currentProfile.shadowY, currentProfile, updateCallback, { min: -10, max: 10, step: 1 });
        menu.appendChild(shadowSection);

        // Border Settings
        const borderSection = document.createElement('div');
        borderSection.innerHTML = '<h4 style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px;">Border (Outline)</h4>';
        window.createMenuControl(borderSection, 'Enable Border', 'checkbox', 'borderEnabled', currentProfile.borderEnabled, currentProfile, updateCallback);
        window.createMenuControl(borderSection, 'Border Color', 'color', 'borderColor', currentProfile.borderColor, currentProfile, updateCallback);
        window.createMenuControl(borderSection, 'Border Thickness', 'range', 'borderThickness', currentProfile.borderThickness, currentProfile, updateCallback, { min: 1, max: 5, step: 1 });
        menu.appendChild(borderSection);

        // Global Controls
        const enableWrapper = document.createElement('div');
        enableWrapper.className = 'crosshair-menu-control';
        enableWrapper.style.marginTop = '15px';
        enableWrapper.style.borderTop = '1px solid #444';
        enableWrapper.style.paddingTop = '10px';
        const enableLabel = document.createElement('label');
        enableLabel.textContent = 'Enable Custom Crosshair (Global): ';
        const enableInput = document.createElement('input');
        enableInput.type = 'checkbox';
        enableInput.checked = config.enabled;
        enableInput.onchange = profileActions.toggleCrosshair;
        enableLabel.appendChild(enableInput);
        enableWrapper.appendChild(enableLabel);
        menu.appendChild(enableWrapper);

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset All to Defaults';
        resetButton.style.cssText = 'width: 100%; margin-top: 15px; padding: 6px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;';
        resetButton.onmouseover = (e) => e.target.style.backgroundColor = '#d32f2f';
        resetButton.onmouseout = (e) => e.target.style.backgroundColor = '#f44336';
        resetButton.onclick = profileActions.reset;
        menu.appendChild(resetButton);

        const keybinds = document.createElement('div');
        keybinds.innerHTML = `<p style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px;">Keybinds:</p>
                                  <ul>
                                    <li>Toggle UI Panel & Pointer Lock: <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd></li>
                                  </ul>`;
        menu.appendChild(keybinds);

        const footer = document.createElement('div');
        footer.style.marginTop = '15px';
        footer.style.borderTop = '1px solid #444';
        footer.style.paddingTop = '10px';
        footer.style.textAlign = 'center';
        footer.innerHTML = `<a href="https://github.com/tiger3homs/"
                               target="_blank"
                               style="color:#4CAF50; text-decoration:none;">
                                obbe.00 on discord
                            </a>`;
        menu.appendChild(footer);
    };

    // Updates the profile selector dropdown
    window.updateMenuProfileSelector = function(elements, config) {
        const selector = elements.profileSelector;
        if (selector) {
            selector.innerHTML = '';
            const profileNames = Object.keys(config.profiles).sort();
            profileNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                selector.appendChild(option);
            });
            selector.value = config.currentProfileName;
        }

        // Disable delete/rename for 'Default' profile or if only one profile exists
        if (config.currentProfileName === 'Default' || Object.keys(config.profiles).length <= 1) {
            elements.deleteProfileBtn.disabled = true;
            elements.renameProfileBtn.disabled = true;
        } else {
            elements.deleteProfileBtn.disabled = false;
            elements.renameProfileBtn.disabled = false;
        }
    };

    // Sets up the UI control panel (buttons at bottom-left)
    window.setupUIControlPanel = function(elements, toggleCrosshairCallback, toggleMenuCallback, config) {
        const uiPanel = elements.uiControlPanel;
        uiPanel.innerHTML = '';

        elements.toggleCrosshairBtn = document.createElement('button');
        elements.toggleCrosshairBtn.id = 'ch-toggle-btn';
        elements.toggleCrosshairBtn.onclick = toggleCrosshairCallback;
        uiPanel.appendChild(elements.toggleCrosshairBtn);

        elements.toggleMenuBtn = document.createElement('button');
        elements.toggleMenuBtn.id = 'ch-menu-btn';
        elements.toggleMenuBtn.onclick = toggleMenuCallback;
        uiPanel.appendChild(elements.toggleMenuBtn);

        window.updateUIControlPanel(elements, config);
    };

    // Updates the text and classes of the control panel buttons
    window.updateUIControlPanel = function(elements, config) {
        const { toggleCrosshairBtn, toggleMenuBtn } = elements;

        if (toggleCrosshairBtn) {
            toggleCrosshairBtn.textContent = config.enabled ? 'Crosshair ON' : 'Crosshair OFF';
            toggleCrosshairBtn.classList.toggle('disabled', !config.enabled);
        }
        if (toggleMenuBtn) {
            toggleMenuBtn.textContent = config.menuVisible ? 'Hide Menu' : 'Show Menu';
            toggleMenuBtn.classList.toggle('active', config.menuVisible);
        }
    };

})();

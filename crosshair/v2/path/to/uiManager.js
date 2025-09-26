// uiManager.js
// Manages the creation and updates of the UI elements (menu and control panel).

window.CH_UIManager = class {
    constructor(config, elements, saveConfig, profileManager, crosshairRenderer, appInstance) {
        this.config = config;
        this.elements = elements;
        this.saveConfig = saveConfig;
        this.profileManager = profileManager;
        this.crosshairRenderer = crosshairRenderer;
        this.appInstance = appInstance; // To call initializeUI and resetConfig from app instance

        this.setupUIControlPanel(); // Initial setup for the control panel buttons
    }

    // Helper to create individual menu controls
    createMenuControl(parent, labelText, type, key, options = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'crosshair-menu-control';

        const label = document.createElement('label');
        label.textContent = `${labelText}: `;
        wrapper.appendChild(label);

        const input = document.createElement('input');
        input.type = type;
        // Use currentProfile for values, and update currentProfile for changes
        input.value = this.profileManager.currentProfile[key];

        if (type === 'range') {
            input.min = options.min;
            input.max = options.max;
            input.step = options.step;
            const valueDisplay = document.createElement('span');
            valueDisplay.textContent = this.profileManager.currentProfile[key];
            valueDisplay.className = 'value-display';
            input.oninput = () => {
                this.profileManager.currentProfile[key] = parseFloat(input.value);
                valueDisplay.textContent = input.value;
                this.saveConfig(this.config);
                this.crosshairRenderer.renderCrosshair();
            };
            wrapper.appendChild(input);
            wrapper.appendChild(valueDisplay);
        } else if (type === 'color' || type === 'number') {
            input.oninput = () => {
                this.profileManager.currentProfile[key] = input.value;
                this.saveConfig(this.config);
                this.crosshairRenderer.renderCrosshair();
            };
            wrapper.appendChild(input);
        } else if (type === 'checkbox') {
            input.checked = this.profileManager.currentProfile[key];
            input.onchange = () => {
                this.profileManager.currentProfile[key] = input.checked;
                this.saveConfig(this.config);
                this.crosshairRenderer.renderCrosshair();
            };
            wrapper.appendChild(input);
        }
        parent.appendChild(wrapper);
    }

    // Populates and updates the profile selector dropdown
    updateMenuProfileSelector() {
        const selector = this.elements.profileSelector;
        if (selector) {
            selector.innerHTML = ''; // Clear existing options
            const profileNames = Object.keys(this.config.profiles).sort();
            profileNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                selector.appendChild(option);
            });
            selector.value = this.config.currentProfileName; // Set selected option
        }

        // Disable delete/rename for 'Default' profile or if only one profile exists
        if (this.elements.deleteProfileBtn && this.elements.renameProfileBtn) {
            const canModify = !(this.config.currentProfileName === 'Default' || Object.keys(this.config.profiles).length <= 1);
            this.elements.deleteProfileBtn.disabled = !canModify;
            this.elements.renameProfileBtn.disabled = !canModify;
        }
    }

    // Builds the entire crosshair configuration menu
    setupMenu() {
        const menu = this.elements.menu;
        if (!menu) return;

        menu.innerHTML = `<h3>Crosshair Config</h3>`;

        // --- Profile Management ---
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

        this.elements.profileSelector = profileManagerDiv.querySelector('#profile-selector');
        this.elements.addProfileBtn = profileManagerDiv.querySelector('#add-profile-btn');
        this.elements.renameProfileBtn = profileManagerDiv.querySelector('#rename-profile-btn');
        this.elements.deleteProfileBtn = profileManagerDiv.querySelector('#delete-profile-btn');

        this.elements.profileSelector.onchange = (e) => {
            this.config.currentProfileName = e.target.value;
            this.saveConfig(this.config);
            this.appInstance.initializeUI(); // Re-render menu controls with new profile's values
            this.crosshairRenderer.renderCrosshair();
        };

        this.elements.addProfileBtn.onclick = () => {
            const newName = prompt('Enter name for new profile (will copy current settings):');
            if (newName && newName.trim() !== '') {
                this.profileManager.addProfile(newName.trim());
            }
        };

        this.elements.renameProfileBtn.onclick = () => {
            const currentName = this.config.currentProfileName;
            if (currentName === 'Default') {
                alert('The "Default" profile cannot be renamed.');
                return;
            }
            const newName = prompt(`Rename '${currentName}' to:`, currentName);
            if (newName && newName.trim() !== '' && newName.trim() !== currentName) {
                this.profileManager.renameProfile(currentName, newName.trim());
            }
        };

        this.elements.deleteProfileBtn.onclick = () => {
            this.profileManager.deleteProfile(this.config.currentProfileName);
        };

        this.updateMenuProfileSelector(); // Populate selector and set button states

        // --- Basic Crosshair Settings ---
        const settingsDiv = document.createElement('div');
        menu.appendChild(settingsDiv);

        this.createMenuControl(settingsDiv, 'Length', 'range', 'length', { min: 1, max: 50, step: 1 });
        this.createMenuControl(settingsDiv, 'Thickness', 'range', 'thickness', { min: 1, max: 10, step: 1 });
        this.createMenuControl(settingsDiv, 'Gap', 'range', 'gap', { min: 0, max: 30, step: 1 });
        this.createMenuControl(settingsDiv, 'Color', 'color', 'color');
        this.createMenuControl(settingsDiv, 'Opacity', 'range', 'opacity', { min: 0.1, max: 1.0, step: 0.05 });

        // --- Shadow Settings ---
        const shadowSection = document.createElement('div');
        shadowSection.innerHTML = '<h4 style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px;">Shadow</h4>';
        this.createMenuControl(shadowSection, 'Enable Shadow', 'checkbox', 'shadowEnabled');
        this.createMenuControl(shadowSection, 'Shadow Color', 'color', 'shadowColor');
        this.createMenuControl(shadowSection, 'Blur Radius', 'range', 'shadowBlur', { min: 0, max: 10, step: 1 });
        this.createMenuControl(shadowSection, 'Offset X', 'range', 'shadowX', { min: -10, max: 10, step: 1 });
        this.createMenuControl(shadowSection, 'Offset Y', 'range', 'shadowY', { min: -10, max: 10, step: 1 });
        menu.appendChild(shadowSection);

        // --- Border Settings ---
        const borderSection = document.createElement('div');
        borderSection.innerHTML = '<h4 style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px;">Border (Outline)</h4>';
        this.createMenuControl(borderSection, 'Enable Border', 'checkbox', 'borderEnabled');
        this.createMenuControl(borderSection, 'Border Color', 'color', 'borderColor');
        this.createMenuControl(borderSection, 'Border Thickness', 'range', 'borderThickness', { min: 1, max: 5, step: 1 });
        menu.appendChild(borderSection);

        // --- Global Controls ---
        const enableWrapper = document.createElement('div');
        enableWrapper.className = 'crosshair-menu-control';
        enableWrapper.style.marginTop = '15px';
        enableWrapper.style.borderTop = '1px solid #444';
        enableWrapper.style.paddingTop = '10px';
        const enableLabel = document.createElement('label');
        enableLabel.textContent = 'Enable Custom Crosshair (Global): ';
        const enableInput = document.createElement('input');
        enableInput.type = 'checkbox';
        enableInput.checked = this.config.enabled;
        enableInput.onchange = this.appInstance.toggleCrosshair;
        enableLabel.appendChild(enableInput); // Checkbox is inside label for better click area
        enableWrapper.appendChild(enableLabel);
        menu.appendChild(enableWrapper);

        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset All to Defaults';
        resetButton.style.cssText = 'width: 100%; margin-top: 15px; padding: 6px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;';
        resetButton.onmouseover = (e) => e.target.style.backgroundColor = '#d32f2f';
        resetButton.onmouseout = (e) => e.target.style.backgroundColor = '#f44336';
        resetButton.onclick = () => {
            CH_resetConfig(this.appInstance); // Call the global reset function
        };
        menu.appendChild(resetButton);


        const keybinds = document.createElement('div');
        keybinds.innerHTML = `<p style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px;">Keybinds:</p>
                                  <ul>
                                    <li>Toggle UI Panel & Pointer Lock: <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd></li>
                                  </ul>`;
        menu.appendChild(keybinds);

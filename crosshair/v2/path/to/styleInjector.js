// styleInjector.js
// Injects the necessary CSS styles into the document.

window.CH_StyleInjector = class {
    constructor(config) {
        this.config = config;
        this.injectStyles();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #custom-crosshair-lines {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9998;
                display: ${this.config.enabled ? 'block' : 'none'};
            }
            .crosshair-line {
                position: absolute;
                background-color: var(--ch-color, #ffffff);
                opacity: var(--ch-opacity, 1.0);
                pointer-events: none;
                box-shadow: var(--ch-box-shadow, none); /* Shadow effect */
                outline: var(--ch-outline, none); /* Border effect using outline */
            }
            .crosshair-line-top {
                width: var(--ch-thickness, 2px);
                height: var(--ch-length, 10px);
                top: calc(50% - var(--ch-gap, 4px) - var(--ch-length, 10px));
                left: calc(50% - var(--ch-thickness, 2px) / 2);
            }
            .crosshair-line-bottom {
                width: var(--ch-thickness, 2px);
                height: var(--ch-length, 10px);
                top: calc(50% + var(--ch-gap, 4px));
                left: calc(50% - var(--ch-thickness, 2px) / 2);
            }
            .crosshair-line-left {
                width: var(--ch-length, 10px);
                height: var(--ch-thickness, 2px);
                top: calc(50% - var(--ch-thickness, 2px) / 2);
                left: calc(50% - var(--ch-gap, 4px) - var(--ch-length, 10px));
            }
            .crosshair-line-right {
                width: var(--ch-length, 10px);
                height: var(--ch-thickness, 2px);
                top: calc(50% - var(--ch-thickness, 2px) / 2);
                left: calc(50% + var(--ch-gap, 4px));
            }

            /* Menu Styles */
            #custom-crosshair-menu {
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(34, 34, 34, 0.95);
                color: #fff;
                padding: 10px;
                border: 1px solid #555;
                border-radius: 5px;
                z-index: 99999;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 12px;
                width: 250px; /* Slightly wider for new controls */
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                display: ${this.config.menuVisible ? 'block' : 'none'};
                max-height: 95vh;
                overflow-y: auto;
            }
            #custom-crosshair-menu h3 {
                margin-top: 0;
                margin-bottom: 10px;
                color: #4CAF50;
                text-align: center;
            }
            .crosshair-menu-control {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .crosshair-menu-control label {
                flex-grow: 1;
                margin-right: 5px;
            }
            .crosshair-menu-control input[type="range"] {
                flex-grow: 2;
                width: auto;
                margin: 0 5px;
            }
            .crosshair-menu-control input[type="number"],
            .crosshair-menu-control input[type="color"],
            .crosshair-menu-control select {
                width: 60px;
                border: 1px solid #444;
                background: #333;
                color: #fff;
                padding: 2px;
                border-radius: 3px;
            }
             .crosshair-menu-control input[type="checkbox"] {
                margin-left: auto;
             }
            .value-display {
                min-width: 25px;
                text-align: right;
            }
            #custom-crosshair-menu ul {
                list-style: none;
                padding: 0;
                margin-top: 10px;
                border-top: 1px solid #444;
                padding-top: 10px;
            }
            #custom-crosshair-menu li {
                margin-bottom: 5px;
                display: flex;
                justify-content: space-between;
            }
            #custom-crosshair-menu kbd {
                background-color: #eee;
                color: #333;
                padding: 2px 4px;
                border-radius: 3px;
                border: 1px solid #bbb;
                font-family: monospace;
            }

            /* Profile Management Styles */
            .profile-manager {
                border-top: 1px solid #444;
                padding-top: 10px;
                margin-top: 10px;
            }
            .profile-selector-group, .profile-action-group {
                display: flex;
                gap: 5px;
                margin-bottom: 8px;
                align-items: center;
            }
            .profile-selector-group select {
                flex-grow: 1;
                width: auto; /* Override default 60px */
            }
            .profile-action-group button {
                flex: 1;
                padding: 5px 8px;
                font-size: 11px;
                border-radius: 3px;
                background-color: #5cb85c;
            }
            .profile-action-group button.secondary { background-color: #f0ad4e; }
            .profile-action-group button.danger { background-color: #d9534f; }
            .profile-action-group button:hover { opacity: 0.9; }


            /* UI Control Panel Styles */
            #custom-crosshair-ui-panel {
                position: fixed;
                bottom: 10px;
                left: 10px;
                z-index: 99999;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: ${this.config.uiPanelVisible ? 'block' : 'none'};
            }
            #custom-crosshair-ui-panel button {
                background-color: #4CAF50;
                border: none;
                color: white;
                padding: 8px 15px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 14px;
                margin: 4px 2px;
                cursor: pointer;
                border-radius: 4px;
                transition: background-color 0.3s ease;
            }
            #custom-crosshair-ui-panel button:hover {
                background-color: #45a049;
            }
            #custom-crosshair-ui-panel button.disabled {
                background-color: #f44336;
            }
            #custom-crosshair-ui-panel button.active {
                 background-color: #2196F3;
            }
             #custom-crosshair-ui-panel button.secondary {
                background-color: #6c757d;
            }
            #custom-crosshair-ui-panel button.secondary:hover {
                background-color: #5a6268;
            }
        `;
        document.head.appendChild(style);
    }
};

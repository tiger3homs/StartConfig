// ==UserScript==
// @name         CS User Config (Executes on Join)
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Automatically executes a set of commands once when you join a server.
// @author       tiger3homs aka obbe.00 on discord (Improved by Gemini)
// @match        https://game.play-cs.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- Configuration ---
    // Manage your commands here. Set 'enabled' to false to disable one without deleting it.
    const commands = [
        { command: 'bind "MWHEELDOWN" "-duck"',       enabled: true },
        { command: 'bind "MWHEELUP" "+duck"',         enabled: true },
        { command: 'bind "f3" "say NOtt LIVE ⚪❌"', enabled: true },
        { command: 'bind "f4" "say KNIVES 🔪🗡️"',   enabled: true },
        { command: 'bind "f8" "flash;flash;sgren;"', enabled: true },
        { command: 'bind "f5" "deagle;secammo"',     enabled: true },
        { command: "cl_lw 1",                       enabled: true },
        { command: "cl_lc 1",                       enabled: true },
        { command: "cl_bob 0",                      enabled: true },
        { command: "stopsound",                     enabled: true },
        { command: "ducks",                         enabled: true },
        { command: "minmodels",                     enabled: true },
    ];

    /**
     * Attempts to find the in-game UI and execute commands.
     * This function is designed to be run repeatedly until it succeeds.
     */
    function initializeConfig() {
        const form = document.querySelector('.hud-message-input form');
        const inputField = document.querySelector('.hud-message-input input');

        // If these elements don't exist yet, it means we are not in a game.
        // We will return and wait for the next check.
        if (!form || !inputField) {
            return;
        }

        // --- UI is found, so we can proceed ---

        // Stop the interval immediately. This ensures the commands only run ONCE.
        clearInterval(initializationInterval);

        console.log('CS User Config: In-game UI detected. Executing commands...');

        // A brief delay to ensure the game is fully ready to accept input.
        setTimeout(() => {
            commands.forEach(({ command, enabled }) => {
                if (enabled) {
                    inputField.value = `;${command}`;
                    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                }
            });

            console.log('CS User Config: All commands have been executed for this session.');
        }, 500);
    }

    // --- Initialization ---

    console.log('CS User Config: Script loaded. Waiting for user to join a server...');

    // Periodically check for the in-game UI. Once it's found, the interval will be cleared.
    const initializationInterval = setInterval(initializeConfig, 1000); // Check every second.

})();

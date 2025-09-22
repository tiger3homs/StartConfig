// ==UserScript==
// @name         CS User Config
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Automatically executes a set of commands in the game console when a match starts.
// @author       tiger3homs aka obbe.00 on discord
// @match        https://game.play-cs.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const commands = [
        ['bind "MWHEELDOWN" "-duck"', true],
        ['bind "MWHEELUP" "+duck"', true],
        ['bind "f3" "say NOtt LIVE ⚪❌"', true],
        ['bind "f4" "say KNIVES 🔪🗡️"', true],

        ['bind "f8" "flash;flash;sgren;"', true],
        ['bind "f5" "deagle;secammo"', true],
        ["cl_lw 1", true],
        ["cl_lc 1", true],

          ["cl_bob 0", true],
          ["stopsound", true],
          ["ducks", true],
          ["minmodels", true],

    ];

    let executed = false;

    function poll$() {
        const timer = document.querySelector('.hud-timer-text');
        if (timer && timer.innerHTML !== '0:00' && !executed) {
            const form = document.querySelector('.hud-message-input form');
            const inputField = document.querySelector('.hud-message-input input');
            if (form && inputField) {
                commands.forEach(([cmd, enabled]) => {
                    if (enabled) {
                        inputField.value = `;${cmd}`;
                        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                    }
                });
                executed = true; // runs once, never resets
            }
        }

        setTimeout(poll$, 500);
    }

    poll$();
})();

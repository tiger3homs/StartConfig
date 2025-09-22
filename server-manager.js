// ==UserScript==
// @name         Server Manager (Maps, Presets, PINs & UI)
// @namespace    http://tampermonkey.net/
// @version      2025-09-19
// @description  Enhances Play-CS.com server management: Smart map selection, customizable server presets (with auto-PIN for 5vs5), collapsible sections, UI cleanup, and improved server links.
// @author       tiger3homs aka obbe.00 on discord
// @match        https://play-cs.com/en/myservers
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  // --- Configuration Object ---
  const CONFIG = {
    favoriteMaps: ['de_mirage', 'de_nuke', 'de_tuscan', 'de_dust2', 'de_inferno', 'de_train',],
    collapsibleHeaders: ['New server', 'Specifications'],
    uiSelectors: {
      servers: 'tr.myserver[data-server]',
      serverLinks: 'td a', // This selector needs to be general enough to catch all links
      saveButtons: 'button.save-btn3', // Selector for your general save buttons
      mainSaveButton: '#my-servers-form button.save-btn3:first-of-type', // Selector for the main 'Save' button in the form
      serverRowMapSelect: (serverID) => `select[name="server[${serverID}][map]"]`,
      serverRowPinInput: (serverID) => `#pin_${serverID}`, // Selector for PIN input by server ID
      serverRowLinkContainer: (serverID) => `#my-server-${serverID}`, // Container for the server's link
      form: '#my-servers-form',
      promoCells: 'td.myserver[colspan="2"]',
      elementsToHide: [
        '#chat_open',
        '#chat_close',
        '.lobby2-tab-header-block.lobby2-border-bottom-white',
        '.lobby2-right-block'
      ],
      tabPanes: '.tab-content .tab-pane',
      goldTabLines: '.gold-tab-line'
    },
    serverPresets: {
      public: {
        isPublic: true,
        checkboxes: {
          'mp_friendlyfire': false, 'mp_autoteambalance': true, 'mp_afkbomb': true,
          'afk_kick': true, 'statistics': true, 'votekick': true, 'bonus_slot': true,
          'tfb': true, 'statsx': true, 'dib3': true, 'rwd_grenadedrop': true
        },
        dropdowns: {
          'minimal_skill': '0', 'ping_limit': '1000', 'mp_roundtime': '1.75',
          'mp_buytime': '0.25', 'mp_c4timer': '35', 'mp_freezetime': '1',
          'mp_startmoney': '5000', 'csem_sank_cd': '300', 'limit_hegren': '1',
          'limit_sgren': '1', 'limit_flash': '2'
        }
      },
      '5vs5': {
        isPublic: true,
        checkboxes: {
          'mp_friendlyfire': true, 'mp_autoteambalance': false, 'mp_afkbomb': true,
          'afk_kick': true, 'statistics': true, 'votekick': false, 'bonus_slot': false
        },
        dropdowns: {
          'minimal_skill': '0', 'ping_limit': '1000', 'mp_roundtime': '1.75',
          'mp_buytime': '0.25', 'mp_c4timer': '35', 'mp_freezetime': '1',
          'mp_startmoney': '800', 'csem_sank_cd': '300', 'limit_hegren': '1',
          'limit_sgren': '1', 'limit_flash': '2'
        }
      },
      deathmatch: {
        isPublic: true,
        checkboxes: {
          'mp_friendlyfire': true, 'mp_autoteambalance': true, 'mp_afkbomb': true,
          'afk_kick': true, 'statistics': true, 'votekick': true, 'bonus_slot': true,
          'tfb': true, 'statsx': true, 'dib3': true, 'rwd_grenadedrop': true
        },
        dropdowns: {
          'minimal_skill': '0', 'ping_limit': '1000', 'mp_roundtime': '2.5',
          'mp_buytime': '0.5', 'mp_c4timer': '35', 'mp_freezetime': '5',
          'mp_startmoney': '1000', 'csem_sank_cd': '300', 'limit_hegren': '1',
          'limit_sgren': '1', 'limit_flash': '2'
        }
      }
    }
  };

  // --- Discord Webhook Configuration ---
  const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1417697895196393502/7iLn-5ClcmrU_ZQ5EH300Aie22WwvznPYyzwGSEN8fRHAzQosQF86t9mvqqeCBxF9c8W';

  // --- Utility Functions ---
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);
  const createElement = (tag, attrs = {}, ...children) => {
    const el = document.createElement(tag);
    for (const key in attrs) {
      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
      } else if (key === 'style' && typeof attrs[key] === 'object') {
        Object.assign(el.style, attrs[key]);
      } else {
        el.setAttribute(key, attrs[key]);
      }
    }
    children.forEach(child => {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else if (child) el.appendChild(child);
    });
    return el;
  };

  /**
   * Generates a random 4-character PIN, either all numbers or all letters.
   * @returns {string} A 4-character PIN.
   */
  const generateRandomPin = () => {
    const useNumbers = Math.random() < 0.5; // 50% chance for numbers, 50% for letters
    let pin = '';
    for (let i = 0; i < 4; i++) {
      if (useNumbers) {
        pin += Math.floor(Math.random() * 10).toString(); // 0-9
      } else {
        const charCode = Math.floor(Math.random() * 26) + 97; // 'a' to 'z'
        pin += String.fromCharCode(charCode);
      }
    }
    return pin;
  };

  /**
   * Sends a plaintext message to the configured Discord webhook.
   * @param {string} content The message content.
   */
  const sendPlaintextDiscordMessage = async (content) => {
    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content, username: 'Play-CS Server Manager' }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send message to Discord:', response.status, errorData);
        alert(`Failed to send message to Discord. Status: ${response.status}. Error: ${errorData.message || 'Unknown error.'}`);
      } else {
        console.log('Message sent to Discord successfully!');
      }
    } catch (error) {
      console.error('Error sending message to Discord:', error);
      alert('An error occurred while trying to send message to Discord.');
    }
  };

  /**
   * Formats a single server's information into a message string for Discord.
   * @param {HTMLElement} serverRow The table row element for the server.
   * @returns {string} The formatted message.
   */
  const formatServerMessage = (serverRow) => {
    const serverID = serverRow.dataset.server;
    const mapSelect = $(CONFIG.uiSelectors.serverRowMapSelect(serverID));
    const pinInput = $(CONFIG.uiSelectors.serverRowPinInput(serverID));
    const linkContainer = $(CONFIG.uiSelectors.serverRowLinkContainer(serverID));
    let serverLink = 'Link not found';
    if (linkContainer && linkContainer.querySelector('a')) {
        serverLink = linkContainer.querySelector('a').href;
    }

    const map = mapSelect ? mapSelect.value : 'N/A';
    const pin = pinInput ? pinInput.value : 'N/A';
    const serverName = serverRow.querySelector('td.server-info-cell > b')?.textContent || `Server ${serverID}`; // Added to get server name

    return `Map: \`${map}\`\nLink: ${serverLink}\nPIN: \`${pin}\``;
  };

  // --- Feature Modules ---

  /**
   * Initializes map selection features: favorite map buttons and a search input.
   */
  const initMapPicker = () => {
    $$(CONFIG.uiSelectors.servers).forEach(server => {
      const serverID = server.dataset.server;
      const mapSelect = server.querySelector(CONFIG.uiSelectors.serverRowMapSelect(serverID));
      if (!mapSelect) return;

      const container = createElement('div', { style: { marginTop: '5px', color: 'black' } });
      mapSelect.parentElement.insertBefore(container, mapSelect);

      const availableMaps = new Set([...mapSelect.options].map(opt => opt.value));

      // Favorite map buttons
      CONFIG.favoriteMaps.forEach(map => {
        if (availableMaps.has(map)) {
          const btn = createElement('button', {
            className: 'save-btn3',
            style: { marginBottom: '3px', marginRight: '3px' },
            onclick: (e) => {
              e.preventDefault();
              mapSelect.value = map;
              mapSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, map);
          container.appendChild(btn);
        }
      });

      // Search input
      const searchInput = createElement('input', {
        type: 'text',
        placeholder: 'Type to search map...',
        style: { marginLeft: '5px', padding: '2px 4px', width: '150px' },
        oninput: () => {
          const filter = searchInput.value.toLowerCase();
          let firstMatch = null;
          Array.from(mapSelect.options).forEach(opt => {
            const match = opt.value.toLowerCase().includes(filter);
            opt.style.display = match ? '' : 'none';
            if (!firstMatch && match) firstMatch = opt;
          });
          if (firstMatch) mapSelect.value = firstMatch.value;
          mapSelect.dispatchEvent(new Event('change', { bubbles: true })); // Trigger change for UI consistency
        },
        onkeydown: (e) => {
          if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            mapSelect.focus();
          }
        }
      });
      container.appendChild(searchInput);
    });
  };

  /**
   * Corrects server links that are missing the 'https:' protocol or are malformed.
   * This function will now be called both initially and after save operations.
   */
  const fixServerLinks = () => {
    $$(CONFIG.uiSelectors.serverLinks).forEach(link => {
      const currentHrefAttribute = link.getAttribute('href');

      // Check for the specific malformed pattern "://play-cs.com..."
      if (currentHrefAttribute && currentHrefAttribute.startsWith('://')) {
        link.setAttribute('href', 'https' + currentHrefAttribute);
        console.log(`Fixed malformed link attribute: ${currentHrefAttribute} -> ${link.getAttribute('href')}`);
      }
      // Additionally, check for links that resolve to a malformed absolute URL but
      // might not have started with '://' in their attribute.
      else if (link.href && link.href.includes('/en/://')) {
          const correctedHref = link.href.replace(/\/en\/:\/\//, '://');
          link.href = 'https' + correctedHref.substring(correctedHref.indexOf('://'));
          console.log(`Fixed absolute resolved link: ${link.href} -> ${link.href}`);
      }
    });
    console.log('fixServerLinks executed.');
  };

  /**
   * Makes specified H3 sections collapsible.
   */
  const initCollapsibleSections = () => {
    $$('h3').forEach(header => {
      if (CONFIG.collapsibleHeaders.includes(header.textContent)) {
        const content = header.nextElementSibling;
        if (content) {
          content.style.display = 'none'; // Initially hide
          header.style.cursor = 'pointer';
          header.addEventListener('click', () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
          });
        }
      }
    });
  };

  /**
   * Cleans up the "Promoted until" display in server table cells.
   */
  const cleanupPromoInfo = () => {
    $$(CONFIG.uiSelectors.promoCells).forEach(cell => {
      const htmlContent = cell.innerHTML;
      const promotedMatch = htmlContent.match(/Promoted until:<br>[\s\S]*/);
      if (promotedMatch && promotedMatch[0]) {
        cell.innerHTML = promotedMatch[0].trim();
      }
    });
  };

  /**
   * Adds buttons to apply predefined server mode presets to all servers.
   */
  const initServerModePresets = () => {
    const myServersForm = $(CONFIG.uiSelectors.form);
    if (!myServersForm) return;

    // Helper to apply settings for a given preset to all servers
    const applyPresetToAllServers = (presetName, presetConfig) => {
      $$(CONFIG.uiSelectors.servers).forEach(server => {
        const serverID = server.dataset.server;

        // Apply public status
        const publicCheckbox = $(`input[id="server[${serverID}][public]"]`);
        if (publicCheckbox) publicCheckbox.checked = presetConfig.isPublic;

        // Reset all cvar checkboxes first (important for applying new presets)
        const cvarControlsContainer = server.nextElementSibling; // Assuming settings are in the next row
        if (cvarControlsContainer) {
          const allCvarCheckboxes = cvarControlsContainer.querySelectorAll('input[type="checkbox"][id^="server['+serverID+'][cvars]"]');
          allCvarCheckboxes.forEach(cb => cb.checked = false);
        }

        // Apply specific checkbox settings
        for (const cvar in presetConfig.checkboxes) {
          const checkbox = $(`input[id="server[${serverID}][cvars][${cvar}]"]`);
          if (checkbox) checkbox.checked = presetConfig.checkboxes[cvar];
        }

        // Apply specific dropdown settings
        for (const cvar in presetConfig.dropdowns) {
          const select = $(`select[name="server[${serverID}][cvars][${cvar}]"]`);
          if (select) select.value = presetConfig.dropdowns[cvar];
        }

        // --- New PIN generation logic for 5vs5 mode ---
        if (presetName === '5vs5') {
          const pinInput = $(CONFIG.uiSelectors.serverRowPinInput(serverID));
          if (pinInput) {
            pinInput.value = generateRandomPin();
          }
        }
        // --- End New PIN generation logic ---

        // Trigger change events for all affected inputs/selects to ensure UI updates
        Array.from(server.querySelectorAll('input, select')).forEach(input => {
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });
    };

    // Create and inject the UI for mode preset buttons
    const modeContainer = createElement('div', { style: { marginBottom: '15px' } },
      createElement('h3', {}, 'Mode Presets')
    );

    for (const modeName in CONFIG.serverPresets) {
      const btn = createElement('button', {
        className: 'save-btn3',
        style: { marginRight: '5px', color: 'black' },
        onclick: (e) => {
          e.preventDefault();
          applyPresetToAllServers(modeName, CONFIG.serverPresets[modeName]); // Pass modeName and presetConfig
        }
      }, modeName.charAt(0).toUpperCase() + modeName.slice(1)); // Capitalize name
      modeContainer.appendChild(btn);
    }
    myServersForm.parentNode.insertBefore(modeContainer, myServersForm);
  };

  /**
   * Hides specified UI elements and adjusts padding for tab panes.
   */
  const cleanupUI = () => {
    // Hide specific elements
    CONFIG.uiSelectors.elementsToHide.forEach(selector => {
      const element = $(selector);
      if (element) element.style.display = 'none';
    });

    // Adjust padding for tab panes
    $$(CONFIG.uiSelectors.tabPanes).forEach(element => {
      element.style.padding = '16px 315px 0px 0px';
    });

    // Remove background image from gold tab lines
    $$(CONFIG.uiSelectors.goldTabLines).forEach(element => {
      element.style.backgroundImage = 'none';
    });
  };

  /**
   * Attaches event listeners to "Save" buttons to re-fix links after a delay.
   */
  const setupPostSaveLinkFix = () => {
    $$(CONFIG.uiSelectors.saveButtons).forEach(button => {
      button.addEventListener('click', () => {
        console.log('Save button clicked, scheduling link fix in 2 seconds...');
        setTimeout(fixServerLinks, 2000); // Wait 2 seconds, then re-run fixServerLinks
      });
    });
  };

  /**
   * Adds a single "Share to Discord" button near the main Save button.
   */
  const addShareAllDiscordButton = () => {
    // Use the mainSaveButton selector for placement
    const mainSaveBtn = $(CONFIG.uiSelectors.mainSaveButton);
    if (mainSaveBtn) {
      const shareAllBtn = createElement('button', {
        className: 'save-btn3', // Keep similar styling
        style: { marginLeft: '10px', backgroundColor: '#7289DA', color: 'white' }, // Discord blue
        onclick: async (e) => {
          e.preventDefault();
          const servers = Array.from($$(CONFIG.uiSelectors.servers));
          if (servers.length === 0) {
            alert('No servers found to share to Discord!');
            return;
          }

          let fullMessage = "\n"; // Start with a clear header
          servers.forEach(server => {
            fullMessage += formatServerMessage(server) + "\n\n"; // Add extra newline for spacing
          });

          await sendPlaintextDiscordMessage(fullMessage);
          // Removed alert here as `sendPlaintextDiscordMessage` already handles success/failure alerts
        }
      }, 'Share to Discord 🚀'); // Changed text for clarity and added icon
      mainSaveBtn.parentNode.insertBefore(shareAllBtn, mainSaveBtn.nextSibling);
    }
  };




  /**
   * Main initialization function that orchestrates all features.
   * Ensures the DOM is ready before executing.
   */
  const initializeScript = () => {
    // Execute all feature modules
    initMapPicker();
    fixServerLinks(); // Initial fix when the page loads
    initCollapsibleSections();
    cleanupPromoInfo();
    initServerModePresets();
    cleanupUI();
    setupPostSaveLinkFix(); // Set up the listener for save buttons

    // --- New Discord Integration ---
    addShareAllDiscordButton(); // Add the single button for all servers

    // --- End New Discord Integration ---

    console.log('Play-CS.com Server Manager script initialized!');
  };

  // --- Start the script ---
  // Wait for the DOM to be fully loaded before running the script.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScript);
  } else {
    initializeScript(); // DOM is already loaded
  }
})();

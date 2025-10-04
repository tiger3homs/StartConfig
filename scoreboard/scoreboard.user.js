// ==UserScript==
// @name         Scoreboard to Discord (Embed) - Player Tracking & UI
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Skicka scoreboard från Play-CS till Discord webhook med embed, bypass CORS, UI för webhook-hantering och bakgrunds-spelaretracking.
// @author       tiger3homs (obbe.00 on discord)
// @match        https://game.play-cs.com/*
// @icon         https://play-cs.com/img/favicon.png
// @connect      discord.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURATION ---
    const WEBHOOK_STORAGE_KEY = "discordWebhookUrl";
    let DISCORD_WEBHOOK_URL = ""; // Initialize as empty

    // Player tracking specific configurations
    const PLAYER_TRACKING_INTERVAL = 2000; // Check g_PlayerExtraInfo every 2 seconds
    const PLAYER_CLEANUP_INTERVAL = 60 * 60 * 1000; // Cleanup players not seen for 1 hour

    // --- GLOBAL PLAYER DATA STORE ---
    // Stores accumulated stats for players across reconnects
    const trackedPlayers = {}; // { playerId: { name, totalKills, totalDeaths, skill, countryCode, lastSeenKills, lastSeenDeaths, lastUpdateTime } }

    // --- SCRIPT INITIALIZATION ---
    async function loadWebhookUrl() {
        const storedUrl = await GM_getValue(WEBHOOK_STORAGE_KEY);
        if (storedUrl) {
            DISCORD_WEBHOOK_URL = storedUrl;
            console.log("Loaded Discord Webhook URL from storage.");
        } else {
            console.log("No webhook URL found in storage. User must set it.");
        }
        console.log("Active Discord Webhook URL:", DISCORD_WEBHOOK_URL ? "Set" : "Not Set");
    }

    // --- PLAYER TRACKING LOGIC ---

    function updatePlayerStats() {
        // Access g_PlayerExtraInfo directly from the window object
        const playerExtraInfo = window.g_PlayerExtraInfo;

        if (!playerExtraInfo || Object.keys(playerExtraInfo).length === 0) {
            // console.log("g_PlayerExtraInfo is empty or not available.");
            return;
        }

        const currentTime = Date.now();

        for (const id in playerExtraInfo) {
            const gamePlayer = playerExtraInfo[id];
            const name = gamePlayer.name.replace(/^(\[.*?\]|<.*?>|\(.*?\))\s*/, '').trim() || gamePlayer.name; // Clean name
            const currentKills = parseInt(gamePlayer.frags, 10) || 0;
            const currentDeaths = parseInt(gamePlayer.deaths, 10) || 0;
            const skill = parseFloat(gamePlayer.skill) || 0;

            if (!trackedPlayers[id]) {
                // New player observed
                trackedPlayers[id] = {
                    name: name,
                    totalKills: currentKills,
                    totalDeaths: currentDeaths,
                    skill: skill,
                    countryCode: "", // Will try to get this from scoreboard later or gamePlayer if available
                    lastSeenKills: currentKills,
                    lastSeenDeaths: currentDeaths,
                    lastUpdateTime: currentTime
                };
                console.log(`[Player Tracker] New player ${name} (ID: ${id}) added.`);
            } else {
                // Existing player
                const player = trackedPlayers[id];

                // Check for reset: If current game kills/deaths are less than last seen, player reconnected
                if (currentKills < player.lastSeenKills || currentDeaths < player.lastSeenDeaths) {
                    console.log(`[Player Tracker] ${player.name} (ID: ${id}) likely reconnected. Resetting game-internal counters.`);
                    // We don't reset totalKills/totalDeaths here, they continue to accumulate.
                    // Only the lastSeenKills/Deaths are reset to match the new game-internal counters.
                }

                // Accumulate kills/deaths
                player.totalKills += (currentKills - player.lastSeenKills);
                if (player.totalKills < 0) player.totalKills = 0; // Prevent negative if lastSeen was somehow higher due to reset logic edge case

                player.totalDeaths += (currentDeaths - player.lastSeenDeaths);
                if (player.totalDeaths < 0) player.totalDeaths = 0; // Prevent negative

                // Update last seen game-internal counts and other info
                player.lastSeenKills = currentKills;
                player.lastSeenDeaths = currentDeaths;
                player.skill = skill; // Skill always takes current value
                player.name = name; // Update name in case it changes (e.g., clan tag removal)
                player.lastUpdateTime = currentTime;
            }
        }
        // console.log("[Player Tracker] Current tracked players:", JSON.parse(JSON.stringify(trackedPlayers)));
    }

    // Periodically clean up old players
    function cleanupOldPlayers() {
        const currentTime = Date.now();
        for (const id in trackedPlayers) {
            if (currentTime - trackedPlayers[id].lastUpdateTime > PLAYER_CLEANUP_INTERVAL) {
                console.log(`[Player Tracker] Cleaning up old player: ${trackedPlayers[id].name} (ID: ${id})`);
                delete trackedPlayers[id];
            }
        }
    }


    // --- MODIFIED SCOREBOARD CAPTURE & SEND LOGIC ---

    function captureAndSendScoreboard(footerInfo = "Match Info") {
        console.log("--- Script running ---");
        if (!DISCORD_WEBHOOK_URL) {
            console.warn("Webhook URL is not set. Please set it using Alt+Shift+D.");
            showTemporaryMessage("Webhook URL not set! Press Alt+Shift+D to configure.", "orange", 5000);
            return;
        }

        try {
            const scoreboard = document.querySelector(".hud-scoreboard");
            if (!scoreboard) {
                console.error("Error: Scoreboard element '.hud-scoreboard' not found on the page.");
                showTemporaryMessage("Scoreboard not found!", "red");
                return;
            }
            showTemporaryMessage("Capturing scoreboard...", "lightblue");

            const mapName = scoreboard.querySelector(".map_name")?.innerText.trim() || "Unknown Map";
            const ctScore = parseInt(scoreboard.querySelector(".scoreboard-hud-ct-head span")?.innerText, 10) || 0;
            const trScore = parseInt(scoreboard.querySelector(".scoreboard-hud-tr-head span")?.innerText, 10) || 0;

            const getPlayersFromScoreboardUI = (selector) => {
                const playerRows = scoreboard.querySelectorAll(selector);
                const players = [];

                for (const row of playerRows) {
                    try {
                        const cols = row.querySelectorAll("td");
                        if (cols.length < 5) continue;

                        const nameElement = cols[1];
                        let rawName = nameElement?.innerText.trim() || "Unknown";
                        let cleanName = rawName.replace(/^(\[.*?\]|<.*?>|\(.*?\))\s*/, '').trim();
                        if (!cleanName) cleanName = rawName;

                        const flagSpan = nameElement?.querySelector(".flag-icon");
                        const countryCode = flagSpan ? (Array.from(flagSpan.classList).find(c => c.startsWith("flag-icon-")) || "").replace("flag-icon-", "") : "";

                        // Try to find this player in trackedPlayers by name
                        // This is the tricky part: g_PlayerExtraInfo has IDs, scoreboard has names.
                        // We need to match them as best as possible.
                        let matchedPlayer = Object.values(trackedPlayers).find(p => p.name.toLowerCase() === cleanName.toLowerCase());

                        // If matched, use accumulated stats. Otherwise, fall back to scoreboard stats.
                        let kills, deaths;
                        if (matchedPlayer) {
                            kills = matchedPlayer.totalKills;
                            deaths = matchedPlayer.totalDeaths;
                            // Update country code in trackedPlayers if we got it from scoreboard
                            if (countryCode && !matchedPlayer.countryCode) {
                                matchedPlayer.countryCode = countryCode;
                            }
                        } else {
                            // Fallback to scoreboard's current kills/deaths if player not tracked or 0/0
                            kills = parseInt(cols[3]?.innerText, 10) || 0;
                            deaths = parseInt(cols[4]?.innerText, 10) || 0;
                            // Only include if they have K/D, to avoid listing purely spectator names from scoreboard
                            if (kills === 0 && deaths === 0) continue;
                        }

                        // We only add if they have actual kills/deaths (accumulated or current)
                        if (kills > 0 || deaths > 0) {
                            players.push({
                                name: cleanName,
                                kills: kills,
                                deaths: deaths,
                                flag: countryCodeToEmoji(countryCode)
                            });
                        }

                    } catch (e) {
                        console.warn("Could not parse a player row from scoreboard UI. Skipping it.", e);
                    }
                }
                return players;
            };

            const ctPlayers = getPlayersFromScoreboardUI(".scoreboard-hud-ct-body tr");
            const trPlayers = getPlayersFromScoreboardUI(".scoreboard-hud-tr-body tr");

            const formatPlayers = (players) => {
                if (!players.length) return "No players found.";
                players.sort((a, b) => b.kills - a.kills);
                return players.map(p => `${p.flag} **${p.name}** — ${p.kills}/${p.deaths}`).join("\n");
            };

            let embedColor = 0x95a5a6;
            if (ctScore > trScore) embedColor = 0x3498db;
            else if (trScore > ctScore) embedColor = 0xe74c3c;

            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const year = today.getFullYear();
            const formattedDate = `${month}/${day}/${year}`;

            const embed = {
                title: `${mapName}`,
                description: `**Score:** 🔵 ${ctScore} — 🔴 ${trScore}`,
                color: embedColor,
                fields: [
                    { name: "CT", value: formatPlayers(ctPlayers) || "No players", inline: true },
                    { name: "TR", value: formatPlayers(trPlayers) || "No players", inline: true }
                ],
                footer: { text: `${footerInfo} | ${formattedDate}` },
            };
            console.log("Embed object created. Sending to Discord...");

            GM_xmlhttpRequest({
                method: "POST",
                url: DISCORD_WEBHOOK_URL,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({ embeds: [embed] }),
                onload: function(response) {
                    if (response.status >= 200 && response.status < 300) {
                        console.log("SUCCESS: Scoreboard sent to Discord!");
                        showTemporaryMessage("Scoreboard sent to Discord!", "green");
                    } else {
                        console.error("Discord API returned an error:", response.status, response.statusText);
                        try {
                            const errorData = JSON.parse(response.responseText);
                            console.error("Error details:", errorData);
                            showTemporaryMessage(`Discord error: ${response.status} - ${errorData.message || response.statusText}`, "red");
                        } catch (e) {
                            console.error("Could not parse Discord error response:", e);
                            showTemporaryMessage(`Discord error: ${response.status} - ${response.statusText}`, "red");
                        }
                    }
                },
                onerror: function(error) {
                    console.error("CRITICAL ERROR: Failed to send request to Discord. This could be a network problem.", error);
                    showTemporaryMessage("Failed to send scoreboard to Discord (network error)!", "red");
                }
            });

        } catch (error) {
            console.error("An unexpected error occurred in the main script logic:", error);
            showTemporaryMessage("An unexpected error occurred!", "red");
        }
    }

    // --- HELPER FUNCTIONS ---
    function countryCodeToEmoji(code) {
        if (!code) return "🏳️";
        if (!/^[a-zA-Z]{2}$/.test(code)) {
            return "🏳️";
        }
        return code.toUpperCase().replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
    }

    function showTemporaryMessage(message, color = "white", duration = 3000) {
        let msgDiv = document.getElementById("scoreboard-discord-message");
        if (!msgDiv) {
            msgDiv = document.createElement("div");
            msgDiv.id = "scoreboard-discord-message";
            Object.assign(msgDiv.style, {
                position: "fixed",
                top: "10px",
                right: "10px",
                padding: "8px 15px",
                background: "rgba(0, 0, 0, 0.7)",
                color: "white",
                borderRadius: "5px",
                zIndex: "10000",
                fontSize: "14px",
                fontFamily: "Arial, sans-serif",
                pointerEvents: "none",
                opacity: "0",
                transition: "opacity 0.3s ease-in-out"
            });
            document.body.appendChild(msgDiv);
        }
        msgDiv.innerText = message;
        msgDiv.style.color = color;
        msgDiv.style.opacity = "1";
        clearTimeout(msgDiv.hideTimer);
        msgDiv.hideTimer = setTimeout(() => { msgDiv.style.opacity = "0"; }, duration);
    }

    function createWebhookSettingsUI() {
        if (document.getElementById("webhook-settings-modal")) { return; }
        const modalOverlay = document.createElement("div");
        modalOverlay.id = "webhook-settings-modal";
        Object.assign(modalOverlay.style, {
            position: "fixed", top: "0", left: "0", width: "100%", height: "100%",
            background: "rgba(0, 0, 0, 0.7)", display: "flex", justifyContent: "center",
            alignItems: "center", zIndex: "10001"
        });
        const modalContent = document.createElement("div");
        Object.assign(modalContent.style, {
            background: "#2c2f33", padding: "25px", borderRadius: "8px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)", width: "450px", maxWidth: "90%",
            fontFamily: "Arial, sans-serif", color: "#dcddde"
        });
        modalContent.innerHTML = `
            <h3 style="margin-top: 0; color: #7289da;">Discord Webhook Settings</h3>
            <p style="font-size: 13px; margin-bottom: 15px;">Enter your Discord webhook URL below. This will be saved in your browser.</p>
            <input type="url" id="webhook-input" placeholder="https://discord.com/api/webhooks/..." style="
                width: calc(100% - 20px); padding: 10px; margin-bottom: 20px; border: 1px solid #4f545c;
                border-radius: 4px; background: #40444b; color: #dcddde; font-size: 14px; box-sizing: border-box;">
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="clear-webhook-btn" style="
                    padding: 10px 20px; border: none; border-radius: 4px; background: #e74c3c;
                    color: white; cursor: pointer; font-size: 14px; transition: background 0.2s;">Clear</button>
                <button id="cancel-webhook-btn" style="
                    padding: 10px 20px; border: none; border-radius: 4px; background: #747f8d;
                    color: white; cursor: pointer; font-size: 14px; transition: background 0.2s;">Cancel</button>
                <button id="save-webhook-btn" style="
                    padding: 10px 20px; border: none; border-radius: 4px; background: #7289da;
                    color: white; cursor: pointer; font-size: 14px; transition: background 0.2s;">Save</button>
            </div>
        `;
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
        const webhookInput = document.getElementById("webhook-input");
        webhookInput.value = DISCORD_WEBHOOK_URL;

        // Immediately focus the input field
        webhookInput.focus();

        // Prevent events from bubbling up from the input field
        webhookInput.addEventListener('keydown', e => e.stopPropagation());
        webhookInput.addEventListener('keyup', e => e.stopPropagation());
        webhookInput.addEventListener('keypress', e => e.stopPropagation());

        // Prevent general keyboard events on the modal content from propagating to the game
        modalContent.addEventListener('keydown', e => e.stopPropagation());
        modalContent.addEventListener('keyup', e => e.stopPropagation());
        modalContent.addEventListener('keypress', e => e.stopPropagation());
        modalContent.addEventListener('mousedown', e => e.stopPropagation()); // Also stop mouse events

        document.getElementById("clear-webhook-btn").addEventListener("click", async () => {
            webhookInput.value = "";
            DISCORD_WEBHOOK_URL = "";
            await GM_setValue(WEBHOOK_STORAGE_KEY, "");
            showTemporaryMessage("Webhook URL cleared!", "orange");
            console.log("Discord Webhook URL cleared.");
            modalOverlay.remove();
        });

        document.getElementById("save-webhook-btn").addEventListener("click", async () => {
            const newUrl = webhookInput.value.trim();
            if (newUrl && newUrl.startsWith("https://discord.com/api/webhooks/")) {
                DISCORD_WEBHOOK_URL = newUrl;
                await GM_setValue(WEBHOOK_STORAGE_KEY, newUrl);
                showTemporaryMessage("Webhook URL saved!", "green");
                console.log("New Discord Webhook URL saved:", DISCORD_WEBHOOK_URL);
                modalOverlay.remove();
            } else {
                showTemporaryMessage("Invalid Webhook URL! It must start with 'https://discord.com/api/webhooks/'", "red", 5000);
                webhookInput.style.borderColor = "red";
            }
        });
        document.getElementById("cancel-webhook-btn").addEventListener("click", () => {
            modalOverlay.remove();
            showTemporaryMessage("Webhook settings cancelled.", "lightgray");
        });
        modalOverlay.addEventListener("click", (e) => {
            // Only close if the click is directly on the overlay, not its children
            if (e.target === modalOverlay) {
                modalOverlay.remove();
                showTemporaryMessage("Webhook settings cancelled.", "lightgray");
            }
        });
        document.addEventListener('keydown', function escKeyListener(e) {
            if (e.key === 'Escape') {
                // Ensure escape only closes the modal and doesn't affect the game
                e.stopPropagation();
                e.preventDefault();
                modalOverlay.remove();
                showTemporaryMessage("Webhook settings cancelled.", "lightgray");
                document.removeEventListener('keydown', escKeyListener);
            }
        });
    }

    // --- SCRIPT INITIALIZATION ---
    async function init() {
        await loadWebhookUrl(); // Load URL before setting up listeners

        console.log("Scoreboard script loaded. Press 'p' for First Half, 'k' for Second Half. Alt+Shift+D for settings.");
        showTemporaryMessage("Scoreboard script loaded (P/K | Alt+Shift+D)", "lightgreen", 3000);

        if (!DISCORD_WEBHOOK_URL) {
            showTemporaryMessage("No Webhook URL set! Use Alt+Shift+D to configure.", "orange", 5000);
        }

        // Start background player tracking
        setInterval(updatePlayerStats, PLAYER_TRACKING_INTERVAL);
        setInterval(cleanupOldPlayers, PLAYER_CLEANUP_INTERVAL); // Clean up very old players

        document.addEventListener("keydown", (e) => {
            // This global listener should only trigger if the modal is NOT active
            if (document.getElementById("webhook-settings-modal")) {
                // If modal is active, let its internal listeners handle keydowns
                return;
            }

            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                // If a native input/textarea is focused (outside our modal), don't interfere
                return;
            }

            if (e.altKey && e.shiftKey && e.key.toLowerCase() === "d") {
                e.preventDefault();
                // Deactivate pointer lock if active
                if (document.pointerLockElement) {
                    document.exitPointerLock();
                    console.log("Pointer lock deactivated.");
                }
                createWebhookSettingsUI();
            } else if (e.key.toLowerCase() === "p") {
                e.preventDefault();
                captureAndSendScoreboard("First Half");
            } else if (e.key.toLowerCase() === "k") {
                e.preventDefault();
                captureAndSendScoreboard("Second Half");
            }
        });
    }

    init(); // Run the initialization
})();

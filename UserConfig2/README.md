# CS User Config (Advanced)

Automatically executes a set of commands when you join a server, providing a convenient in-game UI to add, edit, enable, or disable your custom commands.

<br>

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/2e28087e-ead0-472a-9d0e-4374d93baf92" />

## Features

*   **Automatic Execution**: Configured commands run automatically when you join a server.
*   **Interactive UI**: A sleek, in-game menu (toggle with `Alt + Shift + X`) allows for:
    *   Adding new commands
    *   Editing existing commands
    *   Enabling/disabling commands individually
    *   Saving your configuration
    *   Manually re-running all enabled commands
*   **Persistent Storage**: Your command list is saved using Tampermonkey's storage, so it persists across browser sessions.
*   **Default Commands**: Comes pre-loaded with useful binds (e.g., scroll wheel jump/duck, quick chat messages, weapon binds, display settings).
*   **Developer Friendly**: Designed for easy extension and modification by users.

## Installation

1.  **Install Tampermonkey**: If you don't have it already, install the Tampermonkey browser extension for your browser:
    *   [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
    *   [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
    *   [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpbldmmepgdkmfapfmccihdgpb)
    *   [Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)
2.  **Create a New User Script**:
    *   Click on the Tampermonkey icon in your browser toolbar.
    *   Select "Create a new script...".
3.  **Paste the Script**: Delete any existing code in the new script editor and paste the entire content of `CS_User_Config_Advanced.js` into it.
4.  **Save**: Save the script (usually by pressing `Ctrl + S` or `File > Save`).

## How to Use

1.  **Join a Play-CS.com Server**: Navigate to `https://game.play-cs.com/` and join any server.
2.  **Automatic Execution**: Once you're in the game and the chat input appears, the script will automatically execute all currently enabled commands.
3.  **Open the Menu**: Press `Alt + Shift + X` to toggle the visibility of the "CS User Config" menu.
    *   If you're in pointer-lock mode (first-person view), the script will automatically exit pointer-lock to allow interaction with the menu.
4.  **Manage Commands**:
    *   **Enable/Disable**: Use the checkboxes next to each command to enable or disable it.
    *   **Edit**: Click directly on a command's text field to modify it.
    *   **Add New**: Type a command into the "New command" input field and click "Add".
    *   **Remove**: Click the "X" button next to a command to delete it.
5.  **Save Configuration**: After making changes, click "Save Configuration" to save your current list of commands and their enabled states. These will be loaded automatically next time you play.
6.  **Rerun Commands**: Click "Rerun Commands" to immediately execute all currently enabled commands again (useful for applying changes without rejoining).

## Default Commands Included

*   `bind "MWHEELDOWN" "-duck"`
*   `bind "MWHEELUP" "+duck"`
*   `bind "f3" "say NOtt LIVE ⚪❌"`
*   `bind "f4" "say KNIVES 🔪🗡️"`
*   `bind "f8" "flash;flash;sgren;"`
*   `bind "f5" "deagle;secammo"`
*   `cl_lw 1`
*   `cl_lc 1`
*   `cl_bob 0`

## Troubleshooting

*   **Menu not appearing**: Ensure Tampermonkey is enabled for `play-cs.com`. Check your browser's console (`F12`) for any errors.
*   **Commands not executing**: Make sure you are in an actual server where the chat input box is visible. The script waits for the game UI to appear.
*   **Keybinds not working outside menu**: If you have the menu open, make sure you click outside of the menu or press `Alt + Shift + X` again to close it and re-enable pointer lock/game controls.
*   **Commands not saving**: Ensure you click "Save Configuration" after making changes. Check Tampermonkey's storage for `cs_user_config_commands`.

## Contribution

This script was initially created by `tiger3homs` (aka `obbe.00` on Discord) and improved by Gemini. Feel free to fork, modify, and suggest improvements!

<br>

***

`

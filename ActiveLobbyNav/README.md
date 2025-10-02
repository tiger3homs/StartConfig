# Highlight Active Lobby Nav Item

This Tampermonkey script enhances the `play-cs.com` website by dynamically highlighting the active page in the lobby's side navigation menu.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/54308c58-36da-41f7-add4-95158db337a7" />


## The Problem It Solves

On `play-cs.com`, when navigating through different sections of the lobby (e.g., "Servers," "Profile," "Shop"), the side navigation menu (`.lobby3-side-nav`) **does not always visually indicate which page you are currently on.** This can lead to a less intuitive user experience, as users might not easily see their current location within the site's structure.

## How It Works

This script addresses the issue by:

1.  **Identifying Navigation Items:** It targets the navigation links within the `.lobby3-side-nav__item` elements.
2.  **Normalizing URLs:** It intelligently compares the current page's URL with the `href` attributes of the navigation items. This comparison handles:
    *   Both relative (`/servers`) and absolute (`https://play-cs.com/servers`) URLs.
    *   Variations in URLs (e.g., `/en/servers` vs. `/servers`) by normalizing paths to ensure accurate matching.
    *   Ignoring query parameters and hash values that don't represent a different page.
3.  **Applying an Active Class:** When a match is found, the script adds the CSS class `lobby3-side-nav__item--active` to the corresponding navigation item. This class is typically styled by the website's own CSS to provide a visual highlight (e.g., a different background color, bolder text).
4.  **Dynamic Updates:** The script uses a `MutationObserver` to detect when new content is added to the page (which can happen with single-page applications or dynamic loading). It also listens for `popstate` and `hashchange` events to ensure the active item is updated correctly when users navigate using browser history (back/forward buttons) or internal page anchors.

## Benefits

*   **Improved User Experience:** Users can instantly see which section of the lobby they are currently browsing.
*   **Enhanced Navigation:** Makes it easier to understand the site's structure and where you are within it.
*   **Seamless Integration:** The script uses the website's existing CSS class for active states, ensuring it looks native to the site's design.

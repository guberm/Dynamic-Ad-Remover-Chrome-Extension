# Privacy Policy for Dynamic Ad Remover

**Last Updated: July 24, 2025**

## Overview

Dynamic Ad Remover ("the Extension") is committed to protecting your privacy. This Privacy Policy explains how our Chrome extension handles information when you use our service.

## Information We Do NOT Collect

Our extension is designed with privacy as a core principle. We do **NOT** collect, store, transmit, or share:

- Personal information or identifiers
- Browsing history or website visits
- Webpage content or URLs
- User behavior or analytics data
- Any data about the websites you visit
- Your IP address or location information
- Device information or browser fingerprints

## Information Stored Locally

The Extension stores the following information **locally on your device only**:

### User Configuration Data
- **CSS Selectors**: The selectors you configure to remove unwanted elements
- **Excluded Domains**: The list of websites you choose to exclude from ad removal
- **Extension Settings**: Your preferences for how the extension operates

This data is stored using Chrome's built-in storage API and remains on your device. It may be synced across your Chrome browsers if you have Chrome sync enabled in your Google account settings.

## How the Extension Works

1. **Local Processing**: All element removal happens locally in your browser
2. **No External Communication**: The extension does not communicate with any external servers
3. **User Control**: You have complete control over what elements are targeted and which sites are excluded
4. **No Tracking**: We do not track your usage or collect analytics

## Permissions Used

The extension requests the following permissions and here's why:

### Storage Permission
- **Purpose**: To save your CSS selectors and excluded domains
- **Scope**: Data is stored locally in your browser only
- **Access**: Only you can access and modify this data

### Scripting Permission
- **Purpose**: To inject content scripts that remove unwanted elements
- **Scope**: Only operates on the CSS selectors you configure
- **Process**: All processing happens locally on each webpage

### ActiveTab Permission
- **Purpose**: To allow the extension to work on the current tab when you click the extension icon
- **Scope**: Only provides access to the currently active tab after explicit user interaction
- **Control**: You decide when and where the extension runs by clicking the icon

## Data Security

- **Local Storage**: All data remains on your device
- **No Transmission**: No data is sent to external servers
- **Browser Security**: Protected by Chrome's built-in security features
- **User Control**: You can delete all extension data by removing the extension

## Third-Party Services

The Extension does not integrate with, communicate with, or share data with any third-party services, analytics platforms, or external APIs.

## Chrome Web Store Compliance

This extension complies with the Chrome Web Store Developer Program Policies:

- **Single Purpose**: Removes unwanted webpage elements via CSS selectors
- **Limited Use**: Only uses permissions necessary for core functionality
- **No Data Mining**: Does not collect or transmit user data
- **Transparent**: All functionality is clearly described

## Your Rights and Controls

You have complete control over the extension:

- **Configuration**: Add, modify, or remove CSS selectors and excluded domains
- **Data Deletion**: Uninstalling the extension removes all stored data
- **Selective Usage**: Use domain exclusions to control where the extension operates
- **No Account Required**: No sign-up, login, or personal information needed

## Children's Privacy

The Extension does not knowingly collect information from children under 13 years of age. Since we don't collect any personal information, the extension is safe for users of all ages.

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Any changes will be reflected in the "Last Updated" date at the top of this policy. Continued use of the extension after changes constitutes acceptance of the updated policy.

## Open Source

This extension is open source. You can review the complete source code at:
https://github.com/guberm/dynamic-ad-remover-extension

The source code transparency allows you to verify our privacy claims.

## Contact Information

If you have questions about this Privacy Policy or the extension's privacy practices:

- **GitHub Repository**: https://github.com/guberm/dynamic-ad-remover-extension
- **Issues**: Report concerns via GitHub Issues
- **Developer**: guberm

## Technical Implementation

For transparency, here's how privacy is technically implemented:

### Data Flow
1. User configures selectors and exclusions
2. Data is stored locally using `chrome.storage.sync`
3. Content script reads local data
4. Elements are removed based on local configuration
5. No data leaves the browser

### Code Verification
You can verify our privacy claims by examining:
- `manifest.json` - See all requested permissions
- `content.js` - See how element removal works
- `popup.js` - See how settings are stored and retrieved
- `background.js` - See background script functionality (minimal)

## Summary

Dynamic Ad Remover is designed to respect your privacy completely:
- ✅ No data collection
- ✅ No external communication
- ✅ Local processing only
- ✅ User-controlled configuration
- ✅ Open source code
- ✅ No tracking or analytics

Your browsing habits, personal information, and website visits remain completely private.

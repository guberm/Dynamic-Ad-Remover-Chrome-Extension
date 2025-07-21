# Dynamic Ad Remover

A lightweight Chrome extension that allows you to dynamically remove unwanted elements from web pages using customizable CSS selectors.

![Extension Icon](icon48.png)

## Features

- **Custom CSS Selectors**: Remove elements using any valid CSS selector
- **Domain Exclusion**: Exclude specific domains or URLs from ad removal
- **Real-time Monitoring**: Automatically removes dynamically loaded ads using MutationObserver
- **Simple Configuration**: Easy-to-use popup interface for managing settings
- **Persistent Settings**: Your configurations are saved and synced across devices

## Installation

### From Chrome Web Store
(Coming soon)

### Manual Installation
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The Dynamic Ad Remover extension should now appear in your extensions list

## Usage

### Adding Selectors
1. Click the extension icon in your browser toolbar
2. In the "Selectors" textarea, add CSS selectors (one per line) for elements you want to remove
3. Examples of common selectors:
   ```css
   div#ad
   .advert
   ins.adsbygoogle
   [data-testid*="ad"]
   .sponsored-content
   iframe[src*="googleads"]
   ```

### Excluding Domains
1. In the "Exclude Domains/Hosts" textarea, add domains or URLs you want to exclude from ad removal
2. Examples:
   ```
   dev.azure.com
   github.com
   stackoverflow.com/questions/specific-page
   ```

### Save Settings
1. Click the "Save" button to apply your changes
2. The extension will automatically start working on applicable websites

## How It Works

The extension uses three main components:

1. **Content Script** (`content.js`): Runs on every webpage and removes elements matching your selectors
2. **Popup Interface** (`popup.html` + `popup.js`): Provides the configuration interface
3. **Manifest** (`manifest.json`): Defines extension permissions and structure

### Technical Details

- Uses Manifest V3 for modern Chrome extension compatibility
- Employs MutationObserver to catch dynamically loaded content
- Stores settings using Chrome's sync storage API
- Supports complex CSS selectors and domain-based exclusions

## Configuration Examples

### Common Ad Selectors
```css
/* Google Ads */
ins.adsbygoogle
div[data-google-query-id]

/* Generic ad containers */
.ad-container
.advertisement
.sponsored
[class*="ad-"]
[id*="ad-"]

/* Social media promoted content */
[data-testid="placementTracking"]
[aria-label*="Sponsored"]
```

### Domain Exclusions
```
# Exclude entire domains
example.com
dev.azure.com

# Exclude specific paths
github.com/settings
stackoverflow.com/questions
```

## Permissions

The extension requires the following permissions:

- **storage**: To save your selector and exclusion settings
- **scripting**: To inject content scripts that remove unwanted elements
- **host_permissions**: `<all_urls>` to work on any website you visit

## Privacy

- All settings are stored locally in your browser
- No data is transmitted to external servers
- The extension only processes the CSS selectors and domains you configure

## Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### Version 1.0
- Initial release
- Basic CSS selector-based element removal
- Domain exclusion functionality
- Popup configuration interface
- Real-time content monitoring

## Support

If you encounter any issues or have suggestions for improvements, please [open an issue](https://github.com/yourusername/dynamic-ad-remover/issues) on GitHub.

## Disclaimer

This extension is designed for educational purposes and personal use. Please respect website terms of service and consider supporting content creators through legitimate means.

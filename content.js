// Clean up any existing observers when script is re-injected
if (window.adRemoverObserver) {
    window.adRemoverObserver.disconnect();
}

// Track removed elements count
let removedCount = 0;

function getDomain(hostname) {
    return hostname.replace(/^www\./, '').toLowerCase();
}

function removeAdElements(selectors) {
    let count = 0;
    selectors.forEach(sel => {
        try {
            document.querySelectorAll(sel).forEach(el => {
                el.remove();
                count++;
            });
        } catch (e) {}
    });
    
    if (count > 0) {
        removedCount += count;
        // Send the updated count to the background script
        chrome.runtime.sendMessage({
            type: 'updateBadge',
            count: removedCount
        }).catch(() => {
            // Ignore errors if background script is not ready
        });
    }
}

function shouldRun(excludes) {
    const domain = getDomain(location.hostname);
    
    // Exit immediately on dev.azure.com (safety check from original script)
    if (location.hostname === 'dev.azure.com') {
        return false;
    }
    
    return !excludes.some(ex => {
        if (!ex) return false;
        if (ex.includes('/')) {
            return location.href.startsWith('https://' + ex) ||
                   location.href.startsWith('http://' + ex);
        }
        return domain === getDomain(ex);
    });
}

function getConfigForCurrentSite(siteConfigs) {
    const currentDomain = getDomain(location.hostname);
    
    // Check if there's a specific config for this domain
    if (siteConfigs[currentDomain]) {
        console.log('Dynamic Ad Remover: Using site-specific config for', currentDomain);
        return siteConfigs[currentDomain];
    }
    
    // Otherwise, use global config
    if (siteConfigs['*']) {
        console.log('Dynamic Ad Remover: Using global config (*)');
        return siteConfigs['*'];
    }
    
    // Fallback to empty config
    return { selectors: [], excludes: [] };
}

chrome.storage.sync.get(['siteConfigs', 'selectors', 'excludes'], data => {
    let siteConfigs;
    
    // Migration: support old format
    if (!data.siteConfigs && (data.selectors || data.excludes)) {
        siteConfigs = {
            '*': {
                selectors: data.selectors || [],
                excludes: data.excludes || []
            }
        };
    } else {
        siteConfigs = data.siteConfigs || { '*': { selectors: [], excludes: [] } };
    }
    
    // Get the appropriate config for this site
    const config = getConfigForCurrentSite(siteConfigs);
    const selectors = Array.isArray(config.selectors) ? config.selectors : [];
    const excludes = Array.isArray(config.excludes) ? config.excludes : [];
    
    console.log('Dynamic Ad Remover: Loaded selectors:', selectors.length);
    
    if (!selectors.length) {
        console.log('Dynamic Ad Remover: No selectors configured. Please open the extension popup to configure.');
        return;
    }
    
    if (!shouldRun(excludes)) {
        console.log('Dynamic Ad Remover: Domain excluded');
        return;
    }

    // Initial cleanup
    removeAdElements(selectors);

    // Create new observer and store reference globally
    window.adRemoverObserver = new MutationObserver(() => removeAdElements(selectors));
    window.adRemoverObserver.observe(document.body, { childList: true, subtree: true });
    
    console.log('Dynamic Ad Remover: Started monitoring with', selectors.length, 'selectors');
});

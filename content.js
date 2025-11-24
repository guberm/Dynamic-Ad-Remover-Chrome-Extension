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

chrome.storage.sync.get(['selectors', 'excludes'], data => {
    const selectors = Array.isArray(data.selectors) && data.selectors.length > 0 ? data.selectors : [];
    const excludes = Array.isArray(data.excludes) && data.excludes.length > 0 ? data.excludes : [];
    
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

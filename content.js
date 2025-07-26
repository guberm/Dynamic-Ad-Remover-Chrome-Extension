// Clean up any existing observers when script is re-injected
if (window.adRemoverObserver) {
    window.adRemoverObserver.disconnect();
}

function getDomain(hostname) {
    return hostname.replace(/^www\./, '').toLowerCase();
}

function removeAdElements(selectors) {
    selectors.forEach(sel => {
        try {
            document.querySelectorAll(sel).forEach(el => el.remove());
        } catch (e) {}
    });
}

function shouldRun(excludes) {
    const domain = getDomain(location.hostname);
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
    const selectors = Array.isArray(data.selectors) ? data.selectors : [];
    const excludes = Array.isArray(data.excludes) ? data.excludes : [];
    
    console.log('Dynamic Ad Remover: Loaded selectors:', selectors);
    
    if (!selectors.length) {
        console.log('Dynamic Ad Remover: No selectors configured');
        return;
    }
    
    if (!shouldRun(excludes)) {
        console.log('Dynamic Ad Remover: Domain excluded');
        return;
    }

    removeAdElements(selectors);

    // Create new observer and store reference globally
    window.adRemoverObserver = new MutationObserver(() => removeAdElements(selectors));
    window.adRemoverObserver.observe(document.body, { childList: true, subtree: true });
    
    console.log('Dynamic Ad Remover: Started monitoring with', selectors.length, 'selectors');
});

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
    if (!selectors.length) return; // Do nothing if empty
    if (!shouldRun(excludes)) return;

    removeAdElements(selectors);

    const observer = new MutationObserver(() => removeAdElements(selectors));
    observer.observe(document.body, { childList: true, subtree: true });
});

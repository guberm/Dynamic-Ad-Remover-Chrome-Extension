const selBox = document.getElementById('selectors');
const excBox = document.getElementById('excludes');
const status = document.getElementById('status');

// Load settings
chrome.storage.sync.get(['selectors', 'excludes'], data => {
    selBox.value = Array.isArray(data.selectors) ? data.selectors.join('\n') : '';
    excBox.value = Array.isArray(data.excludes) ? data.excludes.join('\n') : '';
});

document.getElementById('save').onclick = () => {
    const selectors = selBox.value.split('\n').map(s => s.trim()).filter(Boolean);
    const excludes = excBox.value.split('\n').map(s => s.trim()).filter(Boolean);

    chrome.storage.sync.set({ selectors, excludes }, () => {
        status.textContent = 'Saved!';
        setTimeout(() => { status.textContent = ''; }, 1200);
    });
};

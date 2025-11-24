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
        status.textContent = 'Saved! Settings updated on all active tabs.';
        status.style.color = '#4caf50';
        setTimeout(() => { 
            status.textContent = ''; 
            status.style.color = '';
        }, 2500);
    });
};

// Export configuration
document.getElementById('export').onclick = () => {
    chrome.storage.sync.get(['selectors', 'excludes'], data => {
        const config = {
            selectors: data.selectors || [],
            excludes: data.excludes || [],
            exportDate: new Date().toISOString(),
            version: chrome.runtime.getManifest().version
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dynamic-ad-remover-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        status.textContent = 'Configuration exported!';
        status.style.color = '#2196f3';
        setTimeout(() => { 
            status.textContent = ''; 
            status.style.color = '';
        }, 2500);
    });
};

// Import configuration
const fileInput = document.getElementById('fileInput');

document.getElementById('import').onclick = () => {
    fileInput.click();
};

fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const config = JSON.parse(event.target.result);
            
            // Validate the config structure
            if (!config || typeof config !== 'object') {
                throw new Error('Invalid configuration format');
            }
            
            const selectors = Array.isArray(config.selectors) ? config.selectors : [];
            const excludes = Array.isArray(config.excludes) ? config.excludes : [];
            
            // Update UI
            selBox.value = selectors.join('\n');
            excBox.value = excludes.join('\n');
            
            // Save to storage
            chrome.storage.sync.set({ selectors, excludes }, () => {
                status.textContent = 'Configuration imported and saved!';
                status.style.color = '#4caf50';
                setTimeout(() => { 
                    status.textContent = ''; 
                    status.style.color = '';
                }, 2500);
            });
        } catch (error) {
            status.textContent = 'Error: Invalid JSON file';
            status.style.color = '#f44336';
            setTimeout(() => { 
                status.textContent = ''; 
                status.style.color = '';
            }, 3000);
        }
    };
    reader.readAsText(file);
    
    // Reset file input so the same file can be selected again
    fileInput.value = '';
};

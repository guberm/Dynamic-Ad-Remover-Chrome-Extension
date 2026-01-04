const selBox = document.getElementById('selectors');
const excBox = document.getElementById('excludes');
const status = document.getElementById('status');
const siteDropdown = document.getElementById('siteDropdown');
const currentSiteInfo = document.getElementById('currentSiteInfo');
const siteListContainer = document.getElementById('siteList');
const selectorCount = document.getElementById('selectorCount');
const excludeCount = document.getElementById('excludeCount');

let currentSite = '*';
let siteConfigs = {};

// Helper function to normalize domain
function normalizeDomain(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, '').toLowerCase();
    } catch (e) {
        return url.replace(/^www\./, '').toLowerCase();
    }
}

// Get current tab's domain
async function getCurrentTabDomain() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) {
            return normalizeDomain(tab.url);
        }
    } catch (e) {
        console.error('Error getting current tab:', e);
    }
    return null;
}

// Update stats
function updateStats() {
    const selectors = selBox.value.split('\n').filter(s => s.trim()).length;
    const excludes = excBox.value.split('\n').filter(s => s.trim()).length;
    
    selectorCount.textContent = selectors;
    excludeCount.textContent = excludes;
}

// Load all site configurations
async function loadConfigs() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['siteConfigs', 'selectors', 'excludes'], (data) => {
            // Migration: convert old format to new format
            if (!data.siteConfigs && (data.selectors || data.excludes)) {
                siteConfigs = {
                    '*': {
                        selectors: data.selectors || [],
                        excludes: data.excludes || []
                    }
                };
                // Save migrated data
                chrome.storage.sync.set({ siteConfigs }, () => {
                    chrome.storage.sync.remove(['selectors', 'excludes']);
                });
            } else {
                siteConfigs = data.siteConfigs || { '*': { selectors: [], excludes: [] } };
            }
            resolve();
        });
    });
}

// Update the dropdown with all configured sites
function updateSiteDropdown() {
    const currentValue = siteDropdown.value;
    siteDropdown.innerHTML = '';
    
    // Add global option
    const globalOption = document.createElement('option');
    globalOption.value = '*';
    globalOption.textContent = '⭐ All Sites (Global)';
    siteDropdown.appendChild(globalOption);
    
    // Add all configured sites
    Object.keys(siteConfigs).sort().forEach(site => {
        if (site !== '*') {
            const option = document.createElement('option');
            option.value = site;
            option.textContent = site;
            siteDropdown.appendChild(option);
        }
    });
    
    // Restore selection
    if (siteConfigs[currentValue]) {
        siteDropdown.value = currentValue;
    } else {
        siteDropdown.value = '*';
    }
}

// Update site list display
function updateSiteList() {
    siteListContainer.innerHTML = '';
    
    const sites = Object.keys(siteConfigs).sort((a, b) => {
        if (a === '*') return -1;
        if (b === '*') return 1;
        return a.localeCompare(b);
    });
    
    if (sites.length === 0) {
        siteListContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No sites configured</div>';
        return;
    }
    
    sites.forEach(site => {
        const item = document.createElement('div');
        item.className = 'site-item';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = site === '*' ? 'site-name global' : 'site-name';
        nameDiv.textContent = site === '*' ? '⭐ Global (*)' : site;
        
        const actions = document.createElement('div');
        actions.className = 'site-actions';
        
        const selectBtn = document.createElement('button');
        selectBtn.className = 'btn-icon';
        selectBtn.textContent = '✏️';
        selectBtn.title = 'Edit';
        selectBtn.onclick = () => {
            siteDropdown.value = site;
            loadSiteConfig(site);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        
        actions.appendChild(selectBtn);
        
        if (site !== '*') {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon delete-site';
            deleteBtn.textContent = '🗑️';
            deleteBtn.title = 'Delete';
            deleteBtn.onclick = async () => {
                if (confirm(`Delete configuration for ${site}?`)) {
                    delete siteConfigs[site];
                    await saveConfigs();
                    updateSiteDropdown();
                    updateSiteList();
                    if (currentSite === site) {
                        currentSite = '*';
                        siteDropdown.value = '*';
                        loadSiteConfig('*');
                    }
                    showStatus(`Deleted ${site}`, 'success');
                }
            };
            actions.appendChild(deleteBtn);
        }
        
        item.appendChild(nameDiv);
        item.appendChild(actions);
        siteListContainer.appendChild(item);
    });
}

// Load configuration for selected site
function loadSiteConfig(site) {
    currentSite = site;
    const config = siteConfigs[site] || { selectors: [], excludes: [] };
    
    selBox.value = config.selectors.join('\n');
    excBox.value = config.excludes.join('\n');
    
    if (site === '*') {
        currentSiteInfo.textContent = 'Global configuration - applies to all sites';
    } else {
        currentSiteInfo.textContent = `${site} - overrides global settings`;
    }
    
    updateStats();
}

// Initialize
(async function init() {
    await loadConfigs();
    updateSiteDropdown();
    updateSiteList();
    
    // Try to auto-select current tab's domain
    const tabDomain = await getCurrentTabDomain();
    if (tabDomain && siteConfigs[tabDomain]) {
        currentSite = tabDomain;
        siteDropdown.value = tabDomain;
    }
    
    loadSiteConfig(currentSite);
})();

// Site dropdown change
siteDropdown.onchange = () => {
    loadSiteConfig(siteDropdown.value);
};

// Add new site
document.getElementById('addSite').onclick = async () => {
    const tabDomain = await getCurrentTabDomain();
    let siteName = prompt('Enter site domain (e.g., youtube.com):', tabDomain || '');
    
    if (!siteName) return;
    
    siteName = normalizeDomain('https://' + siteName.replace(/^https?:\/\//, ''));
    
    if (siteName === '*') {
        showStatus('Cannot use "*" as a site name', 'error');
        return;
    }
    
    if (!siteConfigs[siteName]) {
        // Copy from global config as starting point
        siteConfigs[siteName] = {
            selectors: [...(siteConfigs['*']?.selectors || [])],
            excludes: [...(siteConfigs['*']?.excludes || [])]
        };
        
        await saveConfigs();
        updateSiteDropdown();
        updateSiteList();
        siteDropdown.value = siteName;
        loadSiteConfig(siteName);
        showStatus(`Created configuration for ${siteName}`, 'success');
    } else {
        siteDropdown.value = siteName;
        loadSiteConfig(siteName);
        showStatus(`Switched to ${siteName}`, 'info');
    }
};

// Save current site configuration
document.getElementById('save').onclick = async () => {
    const selectors = selBox.value.split('\n').map(s => s.trim()).filter(Boolean);
    const excludes = excBox.value.split('\n').map(s => s.trim()).filter(Boolean);

    siteConfigs[currentSite] = { selectors, excludes };
    
    await saveConfigs();
    updateSiteList();
    showStatus(`✓ Saved configuration for ${currentSite === '*' ? 'all sites' : currentSite}`, 'success');
};

// Helper to save configs
async function saveConfigs() {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ siteConfigs }, resolve);
    });
}

// Helper to show status messages
function showStatus(message, type = 'success') {
    status.textContent = message;
    status.className = `show ${type}`;
    setTimeout(() => { 
        status.className = '';
    }, 3000);
}

// Export configuration
document.getElementById('export').onclick = () => {
    const config = {
        siteConfigs: siteConfigs,
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
    
    showStatus('✓ Configuration exported!', 'info');
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
    reader.onload = async (event) => {
        try {
            const config = JSON.parse(event.target.result);
            
            // Validate the config structure
            if (!config || typeof config !== 'object') {
                throw new Error('Invalid configuration format');
            }
            
            // Support both old and new format
            if (config.siteConfigs) {
                siteConfigs = config.siteConfigs;
            } else if (config.selectors || config.excludes) {
                // Old format - convert to new
                siteConfigs = {
                    '*': {
                        selectors: config.selectors || [],
                        excludes: config.excludes || []
                    }
                };
            } else {
                throw new Error('Invalid configuration format');
            }
            
            await saveConfigs();
            updateSiteDropdown();
            updateSiteList();
            loadSiteConfig(currentSite);
            showStatus('✓ Configuration imported successfully!', 'success');
        } catch (error) {
            showStatus('✗ Error: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    fileInput.value = '';
};

// Update stats on input
selBox.addEventListener('input', updateStats);
excBox.addEventListener('input', updateStats);

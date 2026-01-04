// Background script for Dynamic Ad Remover
// Handles extension icon clicks and content script injection

// Track active tabs with injected scripts
const activeTabs = new Set();

// Default selectors from the Tampermonkey script
const DEFAULT_SELECTORS = [];
const DEFAULT_EXCLUDES = [];

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['siteConfigs', 'selectors', 'excludes'], (data) => {
    // Migration: convert old format to new format
    if (!data.siteConfigs && (data.selectors || data.excludes)) {
      chrome.storage.sync.set({ 
        siteConfigs: {
          '*': {
            selectors: data.selectors || [],
            excludes: data.excludes || []
          }
        }
      }, () => {
        // Remove old keys
        chrome.storage.sync.remove(['selectors', 'excludes']);
        console.log('Dynamic Ad Remover: Migrated old config to new format');
      });
    } else if (!data.siteConfigs) {
      // Initialize with empty global config
      chrome.storage.sync.set({ 
        siteConfigs: {
          '*': { selectors: [], excludes: [] }
        }
      }, () => {
        console.log('Dynamic Ad Remover: Initialized with empty global config');
      });
    }
  });
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Open the side panel
    await chrome.sidePanel.open({ windowId: tab.windowId });
    console.log('Side panel opened');
  } catch (error) {
    console.error('Failed to open side panel:', error);
  }
});

// Listen for storage changes to update active tabs
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'sync' && changes.siteConfigs) {
    console.log('Settings changed, updating active tabs');
    
    // Re-inject content script to all active tabs with new settings
    for (const tabId of activeTabs) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        });
        console.log(`Updated tab ${tabId} with new settings`);
      } catch (error) {
        // Tab might be closed or inaccessible, remove from active set
        activeTabs.delete(tabId);
        console.log(`Removed inactive tab ${tabId}`);
      }
    }
  }
});

// Clean up closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId);
});

// Track removed elements count per tab
const tabCounts = new Map();

// Listen for badge update messages from content script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'updateBadge' && sender.tab) {
    const tabId = sender.tab.id;
    const count = message.count || 0;
    
    // Store the count for this tab
    tabCounts.set(tabId, count);
    
    // Update the badge for this tab
    const badgeText = count > 0 ? count.toString() : '';
    chrome.action.setBadgeText({ 
      text: badgeText, 
      tabId: tabId 
    });
    
    // Set badge color (red background)
    if (count > 0) {
      chrome.action.setBadgeBackgroundColor({ 
        color: '#FF0000', 
        tabId: tabId 
      });
    }
  }
});

// Clear badge when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabCounts.delete(tabId);
});

// Reset badge when tab is activated (optional - shows current tab's count)
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const count = tabCounts.get(activeInfo.tabId) || 0;
  const badgeText = count > 0 ? count.toString() : '';
  await chrome.action.setBadgeText({ 
    text: badgeText, 
    tabId: activeInfo.tabId 
  });
});
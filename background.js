// Background script for Dynamic Ad Remover
// Handles extension icon clicks and content script injection

// Track active tabs with injected scripts
const activeTabs = new Set();

// Default selectors from the Tampermonkey script
const DEFAULT_SELECTORS = [];
const DEFAULT_EXCLUDES = [];

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['selectors', 'excludes'], (data) => {
    // Only set empty defaults if nothing is configured
    if (!data.selectors || data.selectors.length === 0) {
      chrome.storage.sync.set({ 
        selectors: [],
        excludes: []
      }, () => {
        console.log('Dynamic Ad Remover: Initialized with empty defaults');
      });
    }
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Check if we can access this tab
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
      console.log('Cannot run on browser internal pages');
      return;
    }

    // Always re-inject to get latest settings
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    activeTabs.add(tab.id);
    console.log('Content script injected successfully');
  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
});

// Listen for storage changes to update active tabs
chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace === 'sync' && (changes.selectors || changes.excludes)) {
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
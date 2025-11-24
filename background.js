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
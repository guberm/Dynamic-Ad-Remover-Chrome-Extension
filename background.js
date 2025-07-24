// Background script for Dynamic Ad Remover
// Handles extension icon clicks and content script injection

chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Check if we can access this tab
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
      console.log('Cannot run on browser internal pages');
      return;
    }

    // Inject the content script into the active tab
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    console.log('Content script injected successfully');
  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Dynamic Ad Remover installed');
});
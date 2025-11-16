// Background service worker for WingFi extension

console.log('WingFi Insurance Extension: Background service worker loaded');

/**
 * ========================================
 * MESSAGE RELAY - Connect popup to content script
 * ========================================
 */

/**
 * Inject content script if not already loaded
 */
async function ensureContentScriptLoaded(tabId) {
  try {
    // Try to ping the content script
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    console.log('Background: Content script already loaded');
    return true;
  } catch (error) {
    // Content script not loaded, inject it
    console.log('Background: Content script not loaded, injecting...');
    
    try {
      // Inject MAIN world script first (accesses window.ethereum)
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content-main.js'],
        world: 'MAIN'
      });
      
      console.log('Background: MAIN world script injected');
      
      // Then inject ISOLATED world script (uses chrome APIs)
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      
      console.log('Background: ISOLATED world script injected');
      
      // Wait longer for MetaMask detection (MetaMask can take 2-3 seconds to inject)
      console.log('Background: Waiting for MetaMask detection...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('Background: Both content scripts injected successfully');
      return true;
    } catch (injectError) {
      console.error('Background: Failed to inject content scripts', injectError);
      return false;
    }
  }
}

/**
 * Relay MetaMask requests from popup to content script
 */
async function relayToContentScript(request) {
  try {
    // Get active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tabs || tabs.length === 0) {
      return { 
        error: 'No active tab found. Please open a web page first.' 
      };
    }
    
    const activeTab = tabs[0];
    
    // Check if it's a chrome:// page (can't inject into these)
    if (activeTab.url && (
      activeTab.url.startsWith('chrome://') || 
      activeTab.url.startsWith('chrome-extension://') ||
      activeTab.url.startsWith('edge://') ||
      activeTab.url.startsWith('about:')
    )) {
      return { 
        error: 'Cannot access MetaMask on browser system pages. Please open a regular website like google.com' 
      };
    }
    
    // Check if URL is accessible
    if (!activeTab.url || activeTab.url === '') {
      return {
        error: 'Cannot access this page. Please open a regular website.'
      };
    }
    
    console.log('Background: Relaying to tab', activeTab.id, request);
    
    // Ensure content script is loaded
    const scriptLoaded = await ensureContentScriptLoaded(activeTab.id);
    
    if (!scriptLoaded) {
      return {
        error: 'Cannot inject into this page. Please try a different website or refresh the page.'
      };
    }
    
    // Send message to content script in active tab
    const response = await chrome.tabs.sendMessage(activeTab.id, request);
    
    return response;
  } catch (error) {
    console.error('Background: Relay error', error);
    
    // Better error messages
    if (error.message && error.message.includes('Receiving end does not exist')) {
      return { 
        error: 'Content script not loaded. Please refresh the page (F5) and try again.',
        details: error.message 
      };
    }
    
    return { 
      error: 'Failed to communicate with page. Please refresh and try again.',
      details: error.message 
    };
  }
}

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background: Received message', request.type);
  
  // Relay MetaMask requests
  if (request.type === 'CHECK_METAMASK' || request.type === 'METAMASK_REQUEST') {
    relayToContentScript(request)
      .then(response => {
        console.log('Background: Relay response', response);
        sendResponse(response);
      })
      .catch(error => {
        console.error('Background: Relay failed', error);
        sendResponse({ error: error.message });
      });
    return true; // Keep channel open for async response
  }
  
  // Handle flight detection badge
  if (request.action === 'flightDetected') {
    // Update badge to show flight was detected
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
    
    // Clear badge after 5 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 5000);
  }
  
  return true;
});

/**
 * Handle extension icon click
 */
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked on tab:', tab.id);
});

/**
 * Clear old cached flight details on browser startup
 */
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['lastDetectedFlight'], (result) => {
    if (result.lastDetectedFlight) {
      const age = Date.now() - result.lastDetectedFlight.timestamp;
      // Clear if older than 24 hours
      if (age > 24 * 60 * 60 * 1000) {
        chrome.storage.local.remove('lastDetectedFlight');
      }
    }
  });
});


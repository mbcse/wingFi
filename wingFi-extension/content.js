// Content script: ISOLATED World - Can use chrome.* APIs but not window.ethereum
// Communicates with content-main.js (MAIN world) via window.postMessage

console.log('AeroFi: Isolated world script loaded');

/**
 * ========================================
 * METAMASK BRIDGE - Relay between extension and MAIN world
 * ========================================
 */

let requestIdCounter = 0;
const pendingRequests = new Map();

/**
 * Send request to MAIN world script and wait for response
 */
function sendToMainWorld(type, data = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++requestIdCounter;
    
    // Store resolver
    pendingRequests.set(requestId, { resolve, reject });
    
    // Send message to MAIN world
    window.postMessage({
      type: type,
      requestId: requestId,
      ...data
    }, '*');
    
    // Timeout after 15 seconds (increased for slow MetaMask injection)
    setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error('Request timeout - MetaMask took too long to respond'));
      }
    }, 15000);
  });
}

/**
 * Listen for responses from MAIN world
 */
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  const message = event.data;
  
  // Handle provider responses
  if (message.type === 'WINGFI_PROVIDER_RESPONSE' || message.type === 'WINGFI_ETH_RESPONSE') {
    const pending = pendingRequests.get(message.requestId);
    if (pending) {
      pendingRequests.delete(message.requestId);
      
      if (message.error) {
        pending.reject(new Error(message.error));
      } else {
        pending.resolve(message);
      }
    }
  }
});

// Listen for MetaMask ready notification
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data.type === 'WINGFI_METAMASK_READY') {
    console.log('AeroFi Isolated: MetaMask is ready!');
  }
});

/**
 * Handle MetaMask requests from extension popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('AeroFi Content: Received message', request.type);
  
  // Handle PING (to check if content script is loaded)
  if (request.type === 'PING') {
    sendResponse({ pong: true });
    return true;
  }
  
  // Handle MetaMask provider check
  if (request.type === 'CHECK_METAMASK') {
    console.log('AeroFi Isolated: Checking for MetaMask via MAIN world...');
    
    sendToMainWorld('WINGFI_CHECK_PROVIDER')
      .then(response => {
        console.log('AeroFi Isolated: Provider check result:', response);
        sendResponse({
          available: response.available,
          isMetaMask: response.isMetaMask
        });
      })
      .catch(error => {
        console.error('AeroFi Isolated: Provider check failed:', error);
        sendResponse({
          available: false,
          isMetaMask: false,
          error: error.message
        });
      });
    
    return true; // Keep channel open for async response
  }
  
  // Handle MetaMask method calls
  if (request.type === 'METAMASK_REQUEST') {
    console.log('AeroFi Isolated: Relaying eth request to MAIN world:', request.method);
    
    sendToMainWorld('WINGFI_ETH_REQUEST', {
      method: request.method,
      params: request.params || []
    })
      .then(response => {
        console.log('AeroFi Isolated: Got response from MAIN world:', response.success);
        sendResponse(response);
      })
      .catch(error => {
        console.error('AeroFi Isolated: Request failed:', error);
        sendResponse({
          success: false,
          error: error.message
        });
      });
    
    return true; // Keep channel open for async response
  }
  
  // Handle flight details extraction (original functionality)
  if (request.action === 'extractFlightDetails') {
    const details = extractFlightDetails();
    sendResponse(details);
    return true;
  }
});

/**
 * ========================================
 * FLIGHT DETAILS EXTRACTION (Original functionality)
 * ========================================
 */

/**
 * Extract PNR and flight details from the page
 */
function extractFlightDetails() {
  const details = {
    pnr: null,
    flightNumber: null,
    airline: null,
    source: 'auto'
  };

  // Common PNR patterns and selectors
  const pnrPatterns = [
    // Look for 6-character alphanumeric codes
    /\b([A-Z0-9]{6})\b/g,
    // Booking reference patterns
    /booking\s*(?:reference|code|number)[\s:]*([A-Z0-9]{6})/gi,
    /PNR[\s:]*([A-Z0-9]{6})/gi,
    /confirmation[\s:]*([A-Z0-9]{6})/gi
  ];

  // Common flight number patterns
  const flightPatterns = [
    // Standard format: AA1234, EK524, etc.
    /\b([A-Z]{2}\d{1,4})\b/g,
    /flight[\s:]*([A-Z]{2}\s?\d{1,4})/gi,
    /flight\s*number[\s:]*([A-Z]{2}\s?\d{1,4})/gi
  ];

  // Airline code mappings
  const airlineCodes = {
    'EK': 'Emirates',
    'AI': 'Air India',
    'QR': 'Qatar Airways',
    'DL': 'Delta',
    'LH': 'Lufthansa',
    'LX': 'Swiss',
    'TK': 'Turkish Airlines',
    '6E': 'IndiGo',
    'AA': 'American Airlines',
    'BA': 'British Airways'
  };

  // Get page text content
  const pageText = document.body.innerText;

  // Try to extract PNR
  for (const pattern of pnrPatterns) {
    const matches = pageText.match(pattern);
    if (matches && matches.length > 0) {
      // Find the most likely PNR (usually appears near "booking" or "PNR" keywords)
      for (const match of matches) {
        const cleanMatch = match.replace(/booking\s*(?:reference|code|number)[\s:]*/gi, '')
                                 .replace(/PNR[\s:]*/gi, '')
                                 .replace(/confirmation[\s:]*/gi, '')
                                 .trim();
        
        if (cleanMatch.length === 6 && /^[A-Z0-9]{6}$/.test(cleanMatch)) {
          details.pnr = cleanMatch.toUpperCase();
          break;
        }
      }
      if (details.pnr) break;
    }
  }

  // Try to extract flight number
  for (const pattern of flightPatterns) {
    const matches = pageText.match(pattern);
    if (matches && matches.length > 0) {
      for (const match of matches) {
        const cleanMatch = match.replace(/flight[\s:]*/gi, '')
                                 .replace(/flight\s*number[\s:]*/gi, '')
                                 .replace(/\s/g, '')
                                 .trim()
                                 .toUpperCase();
        
        if (/^[A-Z]{2}\d{1,4}$/.test(cleanMatch)) {
          details.flightNumber = cleanMatch;
          
          // Extract airline from flight number
          const airlineCode = cleanMatch.substring(0, 2);
          if (airlineCodes[airlineCode]) {
            details.airline = airlineCodes[airlineCode];
          }
          break;
        }
      }
      if (details.flightNumber) break;
    }
  }

  // Try specific selectors for known booking sites
  if (!details.pnr || !details.flightNumber) {
    const selectors = [
      // Generic selectors
      '[data-pnr]',
      '[data-booking-reference]',
      '[data-confirmation-code]',
      '.pnr',
      '.booking-reference',
      '.confirmation-code',
      '#pnr',
      '#booking-reference',
      '#confirmation-code',
      // Flight number selectors
      '[data-flight-number]',
      '.flight-number',
      '#flight-number'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent || element.getAttribute('data-pnr') || 
                     element.getAttribute('data-booking-reference') ||
                     element.getAttribute('data-confirmation-code') ||
                     element.getAttribute('data-flight-number');
        
        if (text) {
          const cleanText = text.trim().toUpperCase();
          
          // Check if it's a PNR
          if (!details.pnr && cleanText.length === 6 && /^[A-Z0-9]{6}$/.test(cleanText)) {
            details.pnr = cleanText;
          }
          
          // Check if it's a flight number
          if (!details.flightNumber && /^[A-Z]{2}\d{1,4}$/.test(cleanText)) {
            details.flightNumber = cleanText;
            const airlineCode = cleanText.substring(0, 2);
            if (airlineCodes[airlineCode]) {
              details.airline = airlineCodes[airlineCode];
            }
          }
        }
      }
    }
  }

  return details;
}

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractFlightDetails') {
    const details = extractFlightDetails();
    sendResponse(details);
  }
  return true;
});

/**
 * Auto-detect and store flight details when page loads
 */
window.addEventListener('load', () => {
  setTimeout(() => {
    const details = extractFlightDetails();
    
    if (details.pnr || details.flightNumber) {
      console.log('AeroFi: Flight details detected', details);
      
      // Store in chrome storage for popup to access
      chrome.storage.local.set({
        lastDetectedFlight: {
          ...details,
          timestamp: Date.now(),
          url: window.location.href
        }
      });
      
      // Show badge to indicate detection
      chrome.runtime.sendMessage({
        action: 'flightDetected',
        details: details
      });
    }
  }, 2000); // Wait 2 seconds for dynamic content to load
});


/**
 * Content Script - MAIN World
 * Runs in the same context as the page, has access to window.ethereum
 */

console.log('WingFi: Main world script loaded');

// Check for ethereum provider
let ethereumProvider = null;

function checkForProvider() {
  if (typeof window.ethereum !== 'undefined') {
    ethereumProvider = window.ethereum;
    console.log('WingFi: Found ethereum provider', window.ethereum.isMetaMask ? '(MetaMask)' : '(Other)');
    return true;
  }
  return false;
}

// Initial check
checkForProvider();

// Listen for MetaMask injection
window.addEventListener('ethereum#initialized', () => {
  console.log('WingFi: ethereum#initialized event');
  checkForProvider();
});

// Keep checking for MetaMask (it might inject slowly)
let checkAttempts = 0;
const maxCheckAttempts = 20; // Increased from 10 to 20 (check for 10 seconds)

const checkInterval = setInterval(() => {
  if (ethereumProvider || checkAttempts >= maxCheckAttempts) {
    clearInterval(checkInterval);
    if (ethereumProvider) {
      console.log('WingFi: ✅ MetaMask detected after', checkAttempts, 'attempts');
      // Notify isolated world
      window.postMessage({ type: 'WINGFI_METAMASK_READY', isMetaMask: ethereumProvider.isMetaMask }, '*');
    } else {
      console.warn('WingFi: ⚠️ MetaMask NOT detected after', maxCheckAttempts, 'attempts');
      console.warn('WingFi: This may mean MetaMask is not installed or is disabled');
    }
    return;
  }
  
  checkAttempts++;
  if (checkForProvider()) {
    clearInterval(checkInterval);
    window.postMessage({ type: 'WINGFI_METAMASK_READY', isMetaMask: ethereumProvider.isMetaMask }, '*');
  }
}, 500);

/**
 * Listen for requests from isolated world (via window.postMessage)
 */
window.addEventListener('message', async (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return;
  
  const message = event.data;
  
  // Check if it's a WingFi message
  if (!message.type || !message.type.startsWith('WINGFI_')) return;
  
  console.log('WingFi Main: Received message', message.type);
  
  // Handle ethereum provider check
  if (message.type === 'WINGFI_CHECK_PROVIDER') {
    // Check one more time
    const available = checkForProvider();
    
    console.log('WingFi Main: Provider check requested, available:', available);
    
    // If not available, wait a bit and try again
    if (!available) {
      console.log('WingFi Main: Provider not available, waiting 2s and rechecking...');
      setTimeout(() => {
        const retryAvailable = checkForProvider();
        console.log('WingFi Main: Retry check, available:', retryAvailable);
        window.postMessage({
          type: 'WINGFI_PROVIDER_RESPONSE',
          requestId: message.requestId,
          available: retryAvailable,
          isMetaMask: ethereumProvider?.isMetaMask || false
        }, '*');
      }, 2000);
    } else {
      window.postMessage({
        type: 'WINGFI_PROVIDER_RESPONSE',
        requestId: message.requestId,
        available: available,
        isMetaMask: ethereumProvider?.isMetaMask || false
      }, '*');
    }
    return;
  }
  
  // Handle ethereum method calls
  if (message.type === 'WINGFI_ETH_REQUEST') {
    // Try one more time to find provider
    checkForProvider();
    
    if (!ethereumProvider) {
      console.error('WingFi Main: MetaMask not available for request:', message.method);
      console.error('WingFi Main: window.ethereum exists?', typeof window.ethereum !== 'undefined');
      window.postMessage({
        type: 'WINGFI_ETH_RESPONSE',
        requestId: message.requestId,
        success: false,
        error: 'MetaMask not available. Please ensure MetaMask is installed and enabled.'
      }, '*');
      return;
    }
    
    try {
      console.log('WingFi Main: Calling ethereum', message.method);
      const result = await ethereumProvider.request({
        method: message.method,
        params: message.params || []
      });
      
      console.log('WingFi Main: Result', result);
      window.postMessage({
        type: 'WINGFI_ETH_RESPONSE',
        requestId: message.requestId,
        success: true,
        result: result
      }, '*');
    } catch (error) {
      console.error('WingFi Main: Error', error);
      window.postMessage({
        type: 'WINGFI_ETH_RESPONSE',
        requestId: message.requestId,
        success: false,
        error: error.message,
        code: error.code
      }, '*');
    }
  }
});

console.log('WingFi: Main world script ready');


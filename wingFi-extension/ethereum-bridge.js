/**
 * Ethereum Bridge - Communicate with MetaMask via content script
 * This module provides a clean API for the popup to interact with MetaMask
 */

/**
 * Check if MetaMask is available on the current page
 */
async function checkMetaMaskAvailable() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CHECK_METAMASK'
    });
    
    console.log('Bridge: MetaMask check response', response);
    
    if (response.error) {
      return { available: false, error: response.error };
    }
    
    return { 
      available: response.available,
      isMetaMask: response.isMetaMask 
    };
  } catch (error) {
    console.error('Bridge: Check failed', error);
    return { available: false, error: error.message };
  }
}

/**
 * Call a MetaMask method
 */
async function callMetaMask(method, params = []) {
  try {
    console.log('Bridge: Calling MetaMask', method, params);
    
    const response = await chrome.runtime.sendMessage({
      type: 'METAMASK_REQUEST',
      method: method,
      params: params
    });
    
    console.log('Bridge: MetaMask response', response);
    
    if (response.error) {
      const error = new Error(response.error);
      error.code = response.code;
      throw error;
    }
    
    if (!response.success) {
      throw new Error('MetaMask request failed');
    }
    
    return response.result;
  } catch (error) {
    console.error('Bridge: Call failed', error);
    throw error;
  }
}

/**
 * Request accounts from MetaMask
 */
async function requestAccounts() {
  return await callMetaMask('eth_requestAccounts');
}

/**
 * Get accounts (without prompting user)
 */
async function getAccounts() {
  return await callMetaMask('eth_accounts');
}

/**
 * Get current chain ID
 */
async function getChainId() {
  return await callMetaMask('eth_chainId');
}

/**
 * Switch Ethereum chain
 */
async function switchChain(chainId) {
  try {
    await callMetaMask('wallet_switchEthereumChain', [{ chainId }]);
  } catch (error) {
    // If chain not added, error code 4902
    if (error.code === 4902) {
      throw new Error('CHAIN_NOT_ADDED');
    }
    throw error;
  }
}

/**
 * Add Ethereum chain
 */
async function addChain(chainParams) {
  return await callMetaMask('wallet_addEthereumChain', [chainParams]);
}

/**
 * Send transaction
 */
async function sendTransaction(txParams) {
  return await callMetaMask('eth_sendTransaction', [txParams]);
}

/**
 * Get transaction receipt
 */
async function getTransactionReceipt(txHash) {
  return await callMetaMask('eth_getTransactionReceipt', [txHash]);
}

/**
 * Call contract (read-only)
 */
async function ethCall(callParams, blockTag = 'latest') {
  return await callMetaMask('eth_call', [callParams, blockTag]);
}

// Export all functions
window.EthereumBridge = {
  checkMetaMaskAvailable,
  callMetaMask,
  requestAccounts,
  getAccounts,
  getChainId,
  switchChain,
  addChain,
  sendTransaction,
  getTransactionReceipt,
  ethCall
};

console.log('✅ Ethereum Bridge loaded');


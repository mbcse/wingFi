// Popup script for WingFi Insurance Extension

// Note: This extension uses MetaMask's injected ethereum provider
// For production, consider bundling ethers.js or web3.js

let userAddress = null;
let selectedPool = null;
let signer = null;
let flightDetails = {
  pnr: '',
  flightNumber: '',
  coverageAmount: 500,
  airline: null
};
let premiumData = {
  global: 0,
  airline: 0,
  crowdfill: 0
};

/**
 * Initialize popup
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 WingFi Popup loaded');
  console.log('📝 Config loaded:', CONFIG.CONTRACTS.STABLECOIN ? 'YES' : 'NO');
  
  // Setup event listeners first
  setupEventListeners();
  
  // Check if bridge is loaded
  if (!window.EthereumBridge) {
    console.error('❌ Ethereum Bridge not loaded!');
    showMetaMaskError('Extension error: Bridge not loaded. Please reload the extension.');
    return;
  }
  
  console.log('✅ Ethereum Bridge loaded');
  
  // Check for MetaMask via bridge
  console.log('🔍 Checking for MetaMask on current page...');
  const metaMaskCheck = await EthereumBridge.checkMetaMaskAvailable();
  
  if (!metaMaskCheck.available) {
    console.warn('⚠️ MetaMask not detected on current page');
    
    showMetaMaskError(
      metaMaskCheck.error || 
      'Please open a regular website (like google.com) and then click the extension icon to connect MetaMask.'
    );
    
    // Still load other features
    try {
      await loadAutoDetectedFlight();
    } catch (error) {
      console.error('Error loading flight details:', error);
    }
    
    return;
  }
  
  console.log('✅ MetaMask detected:', metaMaskCheck.isMetaMask ? 'Yes' : 'Maybe');
  
  // Check for existing wallet connection
  try {
    const accounts = await EthereumBridge.getAccounts();
    console.log('📊 Existing accounts:', accounts);
    
    if (accounts && accounts.length > 0) {
      userAddress = accounts[0];
      console.log('✅ Already connected:', userAddress);
      updateWalletUI();
    }
  } catch (error) {
    console.error('❌ Error checking accounts:', error);
  }
  
  // Load flight details
  try {
    await loadAutoDetectedFlight();
  } catch (error) {
    console.error('Error loading flight details:', error);
  }
  
  console.log('✅ WingFi ready!');
});

/**
 * Show MetaMask error helper
 */
function showMetaMaskError(message) {
  const errorHTML = 
    '<div style="padding: 15px; background: #fff3cd; border-radius: 8px; color: #856404; text-align: center; font-size: 13px;">' +
    '<strong>⚠️ MetaMask Connection Required</strong><br><br>' +
    '<div style="text-align: left; margin: 10px 0;">' + message + '</div>' +
    '<hr style="margin: 15px 0; border: none; border-top: 1px solid #856404; opacity: 0.3;">' +
    '<small style="display: block; margin-top: 10px;"><strong>Troubleshooting:</strong></small>' +
    '<small style="display: block;">• Is MetaMask installed and enabled?</small>' +
    '<small style="display: block;">• Try unlocking MetaMask first</small>' +
    '<small style="display: block;">• Refresh this page (F5)</small>' +
    '<button id="retryDetection" style="margin-top: 15px; width: 100%; padding: 10px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🔄 Retry Detection</button>' +
    '</div>';
  
  document.getElementById('walletSection').innerHTML = errorHTML;
  
  // Add retry button handler
  const retryBtn = document.getElementById('retryDetection');
  if (retryBtn) {
    retryBtn.addEventListener('click', async () => {
      retryBtn.textContent = '⏳ Checking...';
      retryBtn.disabled = true;
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check again
      const metaMaskCheck = await EthereumBridge.checkMetaMaskAvailable();
      
      if (metaMaskCheck.available) {
        location.reload(); // Reload popup to reinitialize
      } else {
        retryBtn.textContent = '❌ Still Not Found - Check MetaMask';
        setTimeout(() => {
          retryBtn.textContent = '🔄 Retry Detection';
          retryBtn.disabled = false;
        }, 2000);
      }
    });
  }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Wallet connection
  document.getElementById('connectWallet').addEventListener('click', connectWallet);
  document.getElementById('disconnectWallet').addEventListener('click', disconnectWallet);
  document.getElementById('viewPoliciesBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/my-policies' });
  });
  
  // Flight details
  document.getElementById('calculatePremium').addEventListener('click', calculatePremium);
  document.getElementById('refetchBtn').addEventListener('click', refetchFlightDetails);
  
  // Pool selection - Open full page for purchase
  document.querySelectorAll('.select-pool').forEach(button => {
    button.addEventListener('click', (e) => {
      const poolType = e.target.dataset.pool;
      openBuyPolicyPage(poolType);
    });
  });
  
  // Purchase flow
  document.getElementById('backButton').addEventListener('click', () => {
    document.getElementById('purchaseSection').classList.add('hidden');
    document.getElementById('premiumSection').classList.remove('hidden');
  });
  
  document.getElementById('confirmPurchase').addEventListener('click', purchaseInsurance);
}

/**
 * Load auto-detected flight details from content script
 */
async function loadAutoDetectedFlight() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Try to get from storage first
    const result = await chrome.storage.local.get(['lastDetectedFlight']);
    
    if (result.lastDetectedFlight) {
      const detected = result.lastDetectedFlight;
      const age = Date.now() - detected.timestamp;
      
      // Only use if less than 1 hour old
      if (age < 60 * 60 * 1000) {
        applyDetectedFlight(detected);
        return;
      }
    }
    
    // If not in storage or too old, extract from current page
    if (tab && tab.id) {
      chrome.tabs.sendMessage(
        tab.id,
        { action: 'extractFlightDetails' },
        (response) => {
          if (response && (response.pnr || response.flightNumber)) {
            applyDetectedFlight(response);
          }
        }
      );
    }
  } catch (error) {
    console.error('Failed to load auto-detected flight:', error);
  }
}

/**
 * Apply detected flight details to form
 */
function applyDetectedFlight(detected) {
  if (detected.pnr) {
    document.getElementById('pnr').value = detected.pnr;
    flightDetails.pnr = detected.pnr;
  }
  
  if (detected.flightNumber) {
    document.getElementById('flightNumber').value = detected.flightNumber;
    flightDetails.flightNumber = detected.flightNumber;
  }
  
  if (detected.airline) {
    flightDetails.airline = detected.airline;
  }
  
  if (detected.pnr || detected.flightNumber) {
    document.getElementById('autoExtracted').classList.remove('hidden');
  }
}

/**
 * Refetch flight details from current page
 */
async function refetchFlightDetails() {
  console.log('🔄 Refetching flight details from page...');
  
  const refetchBtn = document.getElementById('refetchBtn');
  const originalText = refetchBtn.textContent;
  
  try {
    // Show loading state
    refetchBtn.textContent = '⏳ Fetching...';
    refetchBtn.disabled = true;
    
    // Hide auto-extracted message
    document.getElementById('autoExtracted').classList.add('hidden');
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      throw new Error('No active tab found');
    }
    
    // Send message to content script to extract details
    chrome.tabs.sendMessage(
      tab.id,
      { action: 'extractFlightDetails' },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError);
          refetchBtn.textContent = '❌ Failed';
          setTimeout(() => {
            refetchBtn.textContent = originalText;
            refetchBtn.disabled = false;
          }, 2000);
          return;
        }
        
        if (response && (response.pnr || response.flightNumber)) {
          console.log('✅ Refetched:', response);
          applyDetectedFlight(response);
          refetchBtn.textContent = '✅ Updated!';
          
          // Reset button after 2 seconds
          setTimeout(() => {
            refetchBtn.textContent = originalText;
            refetchBtn.disabled = false;
          }, 2000);
        } else {
          console.log('⚠️ No flight details found on page');
          refetchBtn.textContent = '❌ Not found';
          
          setTimeout(() => {
            refetchBtn.textContent = originalText;
            refetchBtn.disabled = false;
          }, 2000);
        }
      }
    );
  } catch (error) {
    console.error('❌ Refetch error:', error);
    refetchBtn.textContent = '❌ Error';
    
    setTimeout(() => {
      refetchBtn.textContent = originalText;
      refetchBtn.disabled = false;
    }, 2000);
  }
}

/**
 * Connect wallet
 */
async function connectWallet() {
  console.log('🔗 Connecting wallet via bridge...');
  
  try {
    // Request accounts via bridge
    const accounts = await EthereumBridge.requestAccounts();
    console.log('📊 Connected accounts:', accounts);
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from MetaMask');
    }
    
    userAddress = accounts[0];
    console.log('✅ User address:', userAddress);
    
    // Check network
    const chainId = await EthereumBridge.getChainId();
    const expectedChainId = '0x' + CONFIG.CHAIN_ID.toString(16);
    console.log('🌐 Current chain:', chainId, '| Expected:', expectedChainId);
    
    if (parseInt(chainId, 16) !== CONFIG.CHAIN_ID) {
      console.log('⚠️ Wrong network, switching to BSC Testnet...');
      await switchNetwork();
    }
    
    updateWalletUI();
    console.log('✅ Wallet connected successfully!');
  } catch (error) {
    console.error('❌ Wallet connection error:', error);
    
    // Show user-friendly error
    let errorMsg = 'Failed to connect wallet';
    if (error.code === 4001) {
      errorMsg = 'You rejected the connection request';
    } else if (error.code === -32002) {
      errorMsg = 'Connection request already pending.\nPlease check MetaMask popup.';
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    alert('❌ Wallet Connection Failed\n\n' + errorMsg + '\n\nPlease try again.');
  }
}

/**
 * Disconnect wallet
 */
function disconnectWallet() {
  userAddress = null;
  document.getElementById('walletConnected').classList.add('hidden');
  document.getElementById('connectWallet').classList.remove('hidden');
}

/**
 * Update wallet UI
 */
function updateWalletUI() {
  if (userAddress) {
    document.getElementById('walletAddress').textContent = 
      `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
    document.getElementById('walletConnected').classList.remove('hidden');
    document.getElementById('connectWallet').classList.add('hidden');
  }
}

/**
 * Switch to BSC Testnet
 */
async function switchNetwork() {
  try {
    const chainIdHex = '0x' + CONFIG.CHAIN_ID.toString(16);
    
    await EthereumBridge.switchChain(chainIdHex);
    console.log('✅ Switched to BSC Testnet');
  } catch (error) {
    if (error.message === 'CHAIN_NOT_ADDED' || error.code === 4902) {
      // Network not added, add it
      console.log('📝 BSC Testnet not in MetaMask, adding...');
      
      await EthereumBridge.addChain({
        chainId: '0x' + CONFIG.CHAIN_ID.toString(16),
        chainName: CONFIG.CHAIN_NAME,
        rpcUrls: [CONFIG.RPC_URL],
        blockExplorerUrls: [CONFIG.EXPLORER_URL],
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        }
      });
      
      console.log('✅ Added and switched to BSC Testnet');
    } else {
      throw error;
    }
  }
}

/**
 * Calculate premium for all pool types
 */
async function calculatePremium() {
  if (!userAddress) {
    showError('Please connect your wallet first');
    return;
  }
  
  // Get form values
  const pnr = document.getElementById('pnr').value.trim().toUpperCase();
  const flightNumber = document.getElementById('flightNumber').value.trim().toUpperCase();
  const coverageAmount = parseFloat(document.getElementById('coverageAmount').value);
  
  // Validate inputs
  if (!pnr || pnr.length !== 6) {
    showError('Please enter a valid 6-character PNR');
    return;
  }
  
  if (!flightNumber || !/^[A-Z]{2}\d{1,4}$/.test(flightNumber)) {
    showError('Please enter a valid flight number (e.g., EK524)');
    return;
  }
  
  if (!coverageAmount || coverageAmount < 100 || coverageAmount > 10000) {
    showError('Coverage amount must be between $100 and $10,000');
    return;
  }
  
  // Store flight details
  flightDetails.pnr = pnr;
  flightDetails.flightNumber = flightNumber;
  flightDetails.coverageAmount = coverageAmount;
  
  // Extract airline code
  const airlineCode = flightNumber.substring(0, 2);
  flightDetails.airline = CONFIG.AIRLINES[airlineCode];
  
  if (!flightDetails.airline) {
    showError('Airline not supported. Supported airlines: ' + Object.keys(CONFIG.AIRLINES).join(', '));
    return;
  }
  
  // Calculate premiums
  premiumData.global = (coverageAmount * CONFIG.PREMIUM_RATES.GLOBAL).toFixed(2);
  premiumData.airline = (coverageAmount * CONFIG.PREMIUM_RATES.AIRLINE).toFixed(2);
  premiumData.crowdfill = (coverageAmount * CONFIG.PREMIUM_RATES.CROWDFILL).toFixed(2);
  
  // Update UI
  document.getElementById('globalPremium').textContent = premiumData.global;
  document.getElementById('globalCoverage').textContent = coverageAmount;
  
  document.getElementById('airlinePremium').textContent = premiumData.airline;
  document.getElementById('airlineCoverage').textContent = coverageAmount;
  document.getElementById('airlineName').textContent = flightDetails.airline.name;
  
  document.getElementById('crowdfillPremium').textContent = premiumData.crowdfill;
  document.getElementById('crowdfillCoverage').textContent = coverageAmount;
  
  // Show premium section
  document.getElementById('premiumSection').classList.remove('hidden');
}

/**
 * Select pool type
 */
// Open full-page buy policy flow - Redirect to Next.js page
async function openBuyPolicyPage(poolType) {
  console.log('🚀 Opening buy policy page for pool:', poolType);
  
  // Get policy data
  const pnr = document.getElementById('pnr').value;
  const flightId = document.getElementById('flightNumber').value;
  const coverage = document.getElementById('coverageAmount').value;
  const premium = getPremiumForPool(poolType);
  
  // Validate data
  if (!pnr || !flightId) {
    alert('Please enter PNR and Flight Number');
    return;
  }
  
  console.log('📋 Policy data:', { pnr, flightId, coverage, premium, poolType });
  
  // Build URL with query params for Next.js page
  const baseUrl = 'http://localhost:3000/buy-policy';
  const url = new URL(baseUrl);
  url.searchParams.set('pnr', pnr);
  url.searchParams.set('flight', flightId);
  url.searchParams.set('coverage', coverage);
  url.searchParams.set('premium', premium);
  url.searchParams.set('poolType', poolType);
  
  console.log('🔗 Opening URL:', url.toString());
  
  // Open in new tab
  chrome.tabs.create({
    url: url.toString(),
    active: true
  });
  
  // Close the extension popup
  setTimeout(() => {
    window.close();
  }, 500);
}

// Get premium for selected pool
function getPremiumForPool(poolType) {
  const premiumElement = document.getElementById(`${poolType}Premium`);
  return premiumElement ? premiumElement.textContent : '25';
}

// Get premium in wei (6 decimals for USDC)
function getPremiumWeiForPool(poolType) {
  const premium = getPremiumForPool(poolType);
  const premiumNumber = parseFloat(premium);
  return (premiumNumber * 1e6).toString();
}

function selectPool(poolType) {
  selectedPool = poolType;
  
  // Update UI - highlight selected card
  document.querySelectorAll('.premium-card').forEach(card => {
    card.classList.remove('selected');
  });
  document.querySelector(`.premium-card[data-pool="${poolType}"]`).classList.add('selected');
  
  // Update summary
  document.getElementById('summaryPNR').textContent = flightDetails.pnr;
  document.getElementById('summaryFlight').textContent = flightDetails.flightNumber;
  document.getElementById('summaryCoverage').textContent = flightDetails.coverageAmount;
  
  let poolName = '';
  let premium = 0;
  
  if (poolType === 'global') {
    poolName = 'Global Pool';
    premium = premiumData.global;
  } else if (poolType === 'airline') {
    poolName = `${flightDetails.airline.name} Pool`;
    premium = premiumData.airline;
  } else if (poolType === 'crowdfill') {
    poolName = 'Crowd-Fill Pool';
    premium = premiumData.crowdfill;
  }
  
  document.getElementById('summaryPool').textContent = poolName;
  document.getElementById('summaryPremium').textContent = premium;
  
  // Show purchase section
  document.getElementById('premiumSection').classList.add('hidden');
  document.getElementById('purchaseSection').classList.remove('hidden');
}

/**
 * Purchase insurance
 */
async function purchaseInsurance() {
  if (!userAddress || !selectedPool) {
    showError('Please connect wallet and select a pool');
    return;
  }
  
  try {
    // Disable button
    document.getElementById('confirmPurchase').disabled = true;
    document.getElementById('txStatus').classList.remove('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
    
    const premium = selectedPool === 'global' ? premiumData.global :
                    selectedPool === 'airline' ? premiumData.airline :
                    premiumData.crowdfill;
    
    const premiumWei = BigInt(Math.floor(parseFloat(premium) * 1e18));
    const coverageWei = BigInt(Math.floor(flightDetails.coverageAmount * 1e18));
    
    // Step 1: Approve USDC
    document.getElementById('approvalStep').classList.add('active');
    
    const stablecoinContract = CONFIG.CONTRACTS.STABLECOIN;
    const spender = selectedPool === 'global' ? CONFIG.CONTRACTS.GLOBAL_POOL :
                    selectedPool === 'airline' ? CONFIG.CONTRACTS.AIRLINE_POOLS[flightDetails.airline.code] :
                    null; // For crowdfill, we'll get the address after creation
    
    if (!spender) {
      showError('Pool address not found. Please check configuration.');
      document.getElementById('confirmPurchase').disabled = false;
      return;
    }
    
    try {
      // Approve USDC spending
      const approveTx = await callContractMethod(
        stablecoinContract,
        CONFIG.ABIS.ERC20,
        'approve',
        [spender, premiumWei]
      );
      
      // Wait for approval
      await waitForTransaction(approveTx);
      
      document.getElementById('approvalStep').classList.remove('active');
      document.getElementById('approvalStep').classList.add('complete');
    } catch (error) {
      throw new Error('Approval failed: ' + error.message);
    }
    
    // Step 2: Purchase policy
    document.getElementById('purchaseStep').classList.add('active');
    
    let purchaseTx;
    
    try {
      if (selectedPool === 'global') {
        // Call GlobalPool.collectPremium
        purchaseTx = await callContractMethod(
          CONFIG.CONTRACTS.GLOBAL_POOL,
          CONFIG.ABIS.GLOBAL_POOL,
          'collectPremium',
          [userAddress, premiumWei]
        );
      } else if (selectedPool === 'airline') {
        // Call AirlinePool.collectPremium
        const airlinePoolAddress = CONFIG.CONTRACTS.AIRLINE_POOLS[flightDetails.airline.code];
        purchaseTx = await callContractMethod(
          airlinePoolAddress,
          CONFIG.ABIS.AIRLINE_POOL,
          'collectPremium',
          [userAddress, premiumWei]
        );
      } else if (selectedPool === 'crowdfill') {
        // Create CrowdFillPool via PoolManager
        showError('Crowd-Fill pool not yet supported in extension. Use web app for crowd-fill policies.');
        document.getElementById('confirmPurchase').disabled = false;
        return;
      }
      
      await waitForTransaction(purchaseTx);
    } catch (error) {
      throw new Error('Policy purchase failed: ' + error.message);
    }
    
    document.getElementById('purchaseStep').classList.remove('active');
    document.getElementById('purchaseStep').classList.add('complete');
    
    // Step 3: Mint NFT (handled by pool contract, but we show the step)
    document.getElementById('mintStep').classList.add('active');
    
    // In reality, the minting is done by PoolManager, but we'll simulate a short wait
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    document.getElementById('mintStep').classList.remove('active');
    document.getElementById('mintStep').classList.add('complete');
    
    // Show success
    document.getElementById('successMessage').classList.remove('hidden');
    document.getElementById('confirmPurchase').textContent = 'Policy Purchased!';
    
  } catch (error) {
    console.error('Purchase failed:', error);
    showError('Purchase failed: ' + error.message);
    document.getElementById('confirmPurchase').disabled = false;
  }
}

/**
 * Helper functions for encoding contract calls
 * Using simple ABI encoding (for production, use ethers.js or web3.js)
 */
function encodeFunctionCall(functionSignature, params) {
  // Simple function selector calculation
  const encoder = new TextEncoder();
  const data = encoder.encode(functionSignature);
  
  // This is a simplified version - in production use proper ABI encoding
  // For now, we'll use MetaMask's eth_sendTransaction with contract method calls
  return { functionSignature, params };
}

/**
 * Call contract method using MetaMask
 */
async function callContractMethod(contractAddress, abi, methodName, params, value = '0x0') {
  // Find the method in ABI
  const method = abi.find(item => item.name === methodName && item.type === 'function');
  
  if (!method) {
    throw new Error(`Method ${methodName} not found in ABI`);
  }
  
  // Create function signature
  const types = method.inputs.map(input => input.type).join(',');
  const signature = `${methodName}(${types})`;
  
  // Simple encoding (for production, use ethers.js)
  // For now, we'll use a workaround with MetaMask's contract interaction
  
  // Calculate function selector (first 4 bytes of keccak256 of signature)
  const textEncoder = new TextEncoder();
  const sigBytes = textEncoder.encode(signature);
  const hashBuffer = await crypto.subtle.digest('SHA-256', sigBytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const selector = '0x' + hashArray.slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Encode parameters (simplified - real implementation would use proper ABI encoding)
  let data = selector;
  
  for (let i = 0; i < params.length; i++) {
    const param = params[i];
    const type = method.inputs[i].type;
    
    if (type === 'address') {
      data += param.substring(2).padStart(64, '0');
    } else if (type === 'uint256' || type.startsWith('uint')) {
      const hex = typeof param === 'bigint' ? param.toString(16) : BigInt(param).toString(16);
      data += hex.padStart(64, '0');
    } else if (type === 'string') {
      // String encoding is complex, skip for now
      throw new Error('String encoding not implemented in simple version');
    }
  }
  
  return await EthereumBridge.sendTransaction({
    from: userAddress,
    to: contractAddress,
    data: data,
    value: value
  });
}

/**
 * Wait for transaction confirmation
 */
async function waitForTransaction(txHash) {
  let receipt = null;
  let attempts = 0;
  const maxAttempts = 60; // 2 minutes max wait
  
  console.log('⏳ Waiting for transaction:', txHash);
  
  while (!receipt && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      receipt = await EthereumBridge.getTransactionReceipt(txHash);
      if (receipt) {
        console.log('✅ Transaction confirmed:', receipt);
      }
    } catch (error) {
      console.log('Still pending... attempt', attempts + 1);
    }
    
    attempts++;
  }
  
  if (!receipt) {
    throw new Error('Transaction timeout - please check BSCScan manually: ' + CONFIG.EXPLORER_URL + '/tx/' + txHash);
  }
  
  return receipt;
}

/**
 * Show error message
 */
function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  
  setTimeout(() => {
    errorDiv.classList.add('hidden');
  }, 5000);
}


// Buy Policy Page - Transaction Flow Logic
console.log('🚀 Buy Policy Page loaded');

// State
let policyData = null;
let walletAddress = null;
let selectedPool = 'global';
let isApproved = false;

// DOM Elements
const elements = {
  connectBtn: document.getElementById('connectBtn'),
  approveBtn: document.getElementById('approveBtn'),
  buyBtn: document.getElementById('buyBtn'),
  closeBtn: document.getElementById('closeBtn'),
  retryBtn: document.getElementById('retryBtn'),
  walletInfo: document.getElementById('walletInfo'),
  
  // Policy details
  pnrValue: document.getElementById('pnrValue'),
  flightValue: document.getElementById('flightValue'),
  coverageValue: document.getElementById('coverageValue'),
  premiumValue: document.getElementById('premiumValue'),
  airlinePoolName: document.getElementById('airlinePoolName'),
  
  // Steps
  step1: document.getElementById('step1'),
  step2: document.getElementById('step2'),
  step3: document.getElementById('step3'),
  step1Status: document.getElementById('step1Status'),
  step2Status: document.getElementById('step2Status'),
  step3Status: document.getElementById('step3Status'),
  
  // Messages
  successMessage: document.getElementById('successMessage'),
  errorMessage: document.getElementById('errorMessage'),
  errorText: document.getElementById('errorText'),
  policyIdValue: document.getElementById('policyIdValue'),
};

// Initialize
async function init() {
  console.log('Initializing buy policy page...');
  
  // Load policy data from storage
  try {
    const result = await chrome.storage.local.get('pendingPolicy');
    if (result.pendingPolicy) {
      policyData = result.pendingPolicy;
      console.log('📋 Policy data loaded:', policyData);
      displayPolicyDetails();
    } else {
      showError('No policy data found. Please try again from the extension.');
      return;
    }
  } catch (error) {
    console.error('Failed to load policy data:', error);
    showError('Failed to load policy data');
    return;
  }
  
  // Check if wallet already connected
  checkWalletConnection();
  
  // Setup event listeners
  setupEventListeners();
}

// Display policy details
function displayPolicyDetails() {
  if (!policyData) return;
  
  elements.pnrValue.textContent = policyData.pnr || '-';
  elements.flightValue.textContent = policyData.flightId || '-';
  elements.coverageValue.textContent = policyData.coverage || '$500';
  elements.premiumValue.textContent = policyData.premium || '$25';
  
  // Extract airline code from flight ID (e.g., "EK524" -> "EK")
  const airlineCode = policyData.flightId ? policyData.flightId.match(/^[A-Z]{2}/)?.[0] : null;
  if (airlineCode) {
    const airlineName = getAirlineName(airlineCode);
    elements.airlinePoolName.textContent = `${airlineName} Pool`;
  }
}

// Get airline name from code
function getAirlineName(code) {
  const airlines = {
    'EK': 'Emirates',
    'AI': 'Air India',
    'QR': 'Qatar',
    'DL': 'Delta',
    'LH': 'Lufthansa',
    'LX': 'Swiss',
    'TK': 'Turkish',
    '6E': 'Indigo',
    'AA': 'American',
    'BA': 'British Airways',
  };
  return airlines[code] || code;
}

// Check wallet connection
async function checkWalletConnection() {
  try {
    const isConnected = await EthereumBridge.isMetaMaskAvailable();
    if (isConnected) {
      const accounts = await EthereumBridge.requestAccounts();
      if (accounts && accounts.length > 0) {
        onWalletConnected(accounts[0]);
      }
    }
  } catch (error) {
    console.log('Wallet not connected yet');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Connect wallet
  elements.connectBtn.addEventListener('click', connectWallet);
  
  // Pool selection
  document.querySelectorAll('input[name="pool"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      selectedPool = e.target.value;
      console.log('Selected pool:', selectedPool);
      updatePoolInfo();
    });
  });
  
  // Approve button
  elements.approveBtn.addEventListener('click', approveToken);
  
  // Buy button
  elements.buyBtn.addEventListener('click', buyPolicy);
  
  // Close button
  elements.closeBtn.addEventListener('click', () => {
    window.close();
  });
  
  // Retry button
  elements.retryBtn.addEventListener('click', () => {
    hideError();
    resetSteps();
  });
}

// Connect wallet
async function connectWallet() {
  console.log('🔌 Connecting wallet...');
  setButtonLoading(elements.connectBtn, true);
  updateStep(1, 'active', 'Connecting...');
  
  try {
    const accounts = await EthereumBridge.requestAccounts();
    if (accounts && accounts.length > 0) {
      onWalletConnected(accounts[0]);
    } else {
      throw new Error('No accounts returned');
    }
  } catch (error) {
    console.error('❌ Wallet connection failed:', error);
    updateStep(1, 'error', 'Connection failed');
    showError(`Wallet connection failed: ${error.message}`);
  } finally {
    setButtonLoading(elements.connectBtn, false);
  }
}

// Wallet connected
function onWalletConnected(address) {
  console.log('✅ Wallet connected:', address);
  walletAddress = address;
  
  // Update UI
  elements.walletInfo.innerHTML = `
    <div class="wallet-address">${address.slice(0, 6)}...${address.slice(-4)}</div>
  `;
  
  updateStep(1, 'completed', 'Connected!');
  updateStep(2, 'active', 'Ready to approve');
  
  // Enable approve button
  elements.approveBtn.disabled = false;
}

// Approve token
async function approveToken() {
  console.log('💰 Approving USDC...');
  setButtonLoading(elements.approveBtn, true);
  updateStep(2, 'active', 'Waiting for approval...');
  
  try {
    // Get token contract address
    const usdcAddress = CONFIG.USDC_ADDRESS;
    const poolAddress = getPoolAddress();
    
    // Amount to approve (premium in wei - assuming 6 decimals for USDC)
    const premiumAmount = policyData.premiumWei || '25000000'; // 25 USDC
    
    console.log('Approving:', {
      token: usdcAddress,
      spender: poolAddress,
      amount: premiumAmount
    });
    
    // Call approve
    const txHash = await EthereumBridge.callContract(
      usdcAddress,
      CONFIG.ERC20_ABI,
      'approve',
      [poolAddress, premiumAmount]
    );
    
    console.log('✅ Approval transaction:', txHash);
    updateStep(2, 'completed', 'Approved!');
    updateStep(3, 'active', 'Ready to buy');
    
    isApproved = true;
    elements.approveBtn.disabled = true;
    elements.buyBtn.disabled = false;
    
  } catch (error) {
    console.error('❌ Approval failed:', error);
    updateStep(2, 'error', 'Approval failed');
    showError(`Token approval failed: ${error.message}`);
  } finally {
    setButtonLoading(elements.approveBtn, false);
  }
}

// Buy policy
async function buyPolicy() {
  console.log('🛡️ Buying policy...');
  setButtonLoading(elements.buyBtn, true);
  updateStep(3, 'active', 'Waiting for transaction...');
  
  try {
    if (!isApproved) {
      throw new Error('Token not approved. Please approve first.');
    }
    
    const poolAddress = getPoolAddress();
    const poolABI = getPoolABI();
    
    // Prepare buy policy parameters
    const params = prepareBuyPolicyParams();
    
    console.log('Buying policy with params:', params);
    
    // Call buyPolicy function
    const txHash = await EthereumBridge.callContract(
      poolAddress,
      poolABI,
      'buyInsurance',
      params
    );
    
    console.log('✅ Policy purchase transaction:', txHash);
    updateStep(3, 'completed', 'Policy purchased!');
    
    // Show success
    showSuccess(txHash);
    
  } catch (error) {
    console.error('❌ Policy purchase failed:', error);
    updateStep(3, 'error', 'Purchase failed');
    showError(`Policy purchase failed: ${error.message}`);
  } finally {
    setButtonLoading(elements.buyBtn, false);
  }
}

// Get pool address based on selection
function getPoolAddress() {
  switch (selectedPool) {
    case 'global':
      return CONFIG.GLOBAL_POOL_ADDRESS;
    case 'airline':
      // Extract airline code and get pool address
      const airlineCode = policyData.flightId ? policyData.flightId.match(/^[A-Z]{2}/)?.[0] : null;
      const airlinePool = CONFIG.AIRLINE_POOLS.find(p => p.code === airlineCode);
      return airlinePool ? airlinePool.address : CONFIG.GLOBAL_POOL_ADDRESS;
    case 'crowdfill':
      // For crowd-fill, we'd need to create a new pool first
      // For now, fallback to global
      return CONFIG.GLOBAL_POOL_ADDRESS;
    default:
      return CONFIG.GLOBAL_POOL_ADDRESS;
  }
}

// Get pool ABI based on selection
function getPoolABI() {
  switch (selectedPool) {
    case 'global':
      return CONFIG.GLOBAL_POOL_ABI;
    case 'airline':
      return CONFIG.AIRLINE_POOL_ABI;
    case 'crowdfill':
      return CONFIG.CROWDFILL_POOL_ABI;
    default:
      return CONFIG.GLOBAL_POOL_ABI;
  }
}

// Prepare buy policy parameters
function prepareBuyPolicyParams() {
  // Parameters expected by the contract's buyInsurance function
  // Adjust based on your actual contract interface
  return [
    policyData.flightId || 'EK524',
    policyData.pnr || 'ABC123',
    policyData.coverageWei || '500000000', // 500 USDC in wei (6 decimals)
    policyData.premiumWei || '25000000', // 25 USDC in wei
    Math.floor(Date.now() / 1000) + 86400 * 7 // 7 days expiry
  ];
}

// Update step UI
function updateStep(stepNum, status, message) {
  const step = elements[`step${stepNum}`];
  const statusEl = elements[`step${stepNum}Status`];
  
  if (!step || !statusEl) return;
  
  // Remove old status classes
  step.classList.remove('active', 'completed', 'error');
  
  // Add new status
  if (status) {
    step.classList.add(status);
  }
  
  // Update message
  if (message) {
    statusEl.textContent = message;
  }
}

// Reset steps
function resetSteps() {
  updateStep(1, walletAddress ? 'completed' : '', walletAddress ? 'Connected' : 'Waiting...');
  updateStep(2, '', isApproved ? 'Approved' : 'Pending wallet connection');
  updateStep(3, '', 'Pending approval');
  
  if (walletAddress) {
    elements.approveBtn.disabled = false;
  }
}

// Show success
function showSuccess(txHash) {
  elements.successMessage.style.display = 'block';
  elements.policyIdValue.textContent = txHash ? `${txHash.slice(0, 10)}...${txHash.slice(-8)}` : 'Pending...';
  
  // Hide other sections
  document.querySelector('.policy-details').style.opacity = '0.3';
  document.querySelector('.pool-selection').style.opacity = '0.3';
  document.querySelector('.transaction-steps').style.opacity = '0.3';
  document.querySelector('.actions').style.display = 'none';
}

// Show error
function showError(message) {
  elements.errorMessage.style.display = 'block';
  elements.errorText.textContent = message;
}

// Hide error
function hideError() {
  elements.errorMessage.style.display = 'none';
}

// Set button loading state
function setButtonLoading(button, isLoading) {
  const text = button.querySelector('.btn-text');
  const loader = button.querySelector('.btn-loader');
  
  if (isLoading) {
    button.disabled = true;
    if (text) text.style.display = 'none';
    if (loader) loader.style.display = 'inline';
  } else {
    button.disabled = false;
    if (text) text.style.display = 'inline';
    if (loader) loader.style.display = 'none';
  }
}

// Update pool info (TVL, etc.)
async function updatePoolInfo() {
  // TODO: Fetch real TVL from contracts
  // For now using mock data
  console.log('Updating pool info for:', selectedPool);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);


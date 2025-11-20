/**
 * Quick MetaMask Connection Test
 * Run this in browser console to verify MetaMask is working
 */

// Test 1: Check if MetaMask is installed
const WEB3_DISABLED = typeof process !== 'undefined' && (process.env.WEB3_DISABLED === 'true' || process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true')
console.log('=== MetaMask Connection Test ===');
console.log('WEB3_DISABLED:', WEB3_DISABLED);
if (!WEB3_DISABLED) {
  console.log('1. Window object exists:', typeof window !== 'undefined');
  console.log('2. Ethereum object exists:', typeof window?.ethereum !== 'undefined');
  console.log('3. Is MetaMask:', window?.ethereum?.isMetaMask);
  console.log('4. Request method exists:', typeof window?.ethereum?.request === 'function');
} else {
  console.warn('WEB3_DISABLED is enabled; skipping MetaMask checks.');
}

// Test 2: Try to connect
async function testMetaMaskConnection() {
  try {
    const WEB3_DISABLED = typeof process !== 'undefined' && (process.env.WEB3_DISABLED === 'true' || process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true')
    if (WEB3_DISABLED) {
      console.warn('WEB3_DISABLED: testMetaMaskConnection is disabled')
      return
    }
    if (typeof window === 'undefined') {
      console.error('❌ Window not available');
      return;
    }

    if (!window.ethereum) {
      console.error('❌ MetaMask not found');
      return;
    }

    if (typeof window.ethereum.request !== 'function') {
      console.error('❌ Invalid MetaMask provider');
      return;
    }

    console.log('✅ MetaMask detected! Requesting connection...');

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });

    if (!accounts || accounts.length === 0) {
      console.error('❌ No accounts found');
      return;
    }

    console.log('✅ Connected successfully!');
    console.log('Account:', accounts[0]);

    // Check network
    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    });

    console.log('Network Chain ID:', chainId);
    console.log('Network:', chainId === '0x38' ? 'BSC' : chainId === '0x1' ? 'Ethereum' : 'Other');

    return accounts[0];

  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

// Run the test
testMetaMaskConnection();

/**
 * Blockchain Transaction Scanner
 * Fetches real transaction data from BSC and TRON blockchains using txHash
 */

// BSC (BEP20) - Using BSCScan API
export const fetchBSCTransaction = async (txHash: string) => {
  try {
    const BSCSCAN_API_KEY = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || ''
    const url = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${BSCSCAN_API_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.result) {
      const tx = data.result
      
      // Convert Wei to USDT (assuming 18 decimals for BEP20 USDT)
      const value = parseInt(tx.value, 16) / Math.pow(10, 18)
      
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: value,
        blockNumber: parseInt(tx.blockNumber, 16),
        timestamp: null, // Need to fetch block details for timestamp
        status: 'confirmed',
        network: 'BEP20',
        explorerUrl: `https://bscscan.com/tx/${txHash}`
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching BSC transaction:', error)
    return null
  }
}

// TRON (TRC20) - Using TronGrid API
export const fetchTRONTransaction = async (txHash: string) => {
  try {
    const url = `https://api.trongrid.io/v1/transactions/${txHash}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data && data.txID) {
      // Parse TRON transaction data
      const value = data.raw_data?.contract?.[0]?.parameter?.value?.amount || 0
      const timestamp = data.block_timestamp || Date.now()
      
      return {
        hash: data.txID,
        from: data.raw_data?.contract?.[0]?.parameter?.value?.owner_address || '',
        to: data.raw_data?.contract?.[0]?.parameter?.value?.to_address || '',
        value: value / Math.pow(10, 6), // TRC20 USDT has 6 decimals
        blockNumber: data.blockNumber || 0,
        timestamp: new Date(timestamp),
        status: data.ret?.[0]?.contractRet === 'SUCCESS' ? 'confirmed' : 'pending',
        network: 'TRC20',
        explorerUrl: `https://tronscan.org/#/transaction/${txHash}`
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching TRON transaction:', error)
    return null
  }
}

// Universal transaction fetcher
export const fetchBlockchainTransaction = async (
  txHash: string, 
  network: 'BEP20' | 'TRC20'
) => {
  if (!txHash || txHash === 'N/A' || txHash.startsWith('ADMIN_') || txHash.startsWith('BOT-')) {
    return null
  }
  
  if (network === 'BEP20') {
    return await fetchBSCTransaction(txHash)
  } else if (network === 'TRC20') {
    return await fetchTRONTransaction(txHash)
  }
  
  return null
}

// Fetch transaction receipt (confirmation status)
export const fetchBSCTransactionReceipt = async (txHash: string) => {
  try {
    const BSCSCAN_API_KEY = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || ''
    const url = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${BSCSCAN_API_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.result) {
      const receipt = data.result
      return {
        status: receipt.status === '0x1' ? 'confirmed' : 'failed',
        blockNumber: parseInt(receipt.blockNumber, 16),
        gasUsed: parseInt(receipt.gasUsed, 16),
        confirmations: 0 // Calculate based on current block
      }
    }
    
    return null
  } catch (error) {
    console.error('Error fetching BSC receipt:', error)
    return null
  }
}

// Get block timestamp
export const fetchBSCBlockTimestamp = async (blockNumber: number) => {
  try {
    const BSCSCAN_API_KEY = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || ''
    const blockHex = '0x' + blockNumber.toString(16)
    const url = `https://api.bscscan.com/api?module=proxy&action=eth_getBlockByNumber&tag=${blockHex}&boolean=true&apikey=${BSCSCAN_API_KEY}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.result) {
      const timestamp = parseInt(data.result.timestamp, 16)
      return new Date(timestamp * 1000)
    }
    
    return null
  } catch (error) {
    console.error('Error fetching block timestamp:', error)
    return null
  }
}

// Complete transaction data with all details
export const fetchCompleteTransactionData = async (
  txHash: string,
  network: 'BEP20' | 'TRC20'
) => {
  const txData = await fetchBlockchainTransaction(txHash, network)
  
  if (!txData) return null
  
  // Fetch additional data for BSC
  if (network === 'BEP20') {
    const receipt = await fetchBSCTransactionReceipt(txHash)
    if (receipt) {
  txData.status = receipt.status
  ;(txData as any).confirmations = (receipt as any).confirmations
  ;(txData as any).gasUsed = (receipt as any).gasUsed
    }
    
    // Fetch timestamp from block
    if (txData.blockNumber) {
      const timestamp = await fetchBSCBlockTimestamp(txData.blockNumber)
      if (timestamp) {
        txData.timestamp = timestamp
      }
    }
  }
  
  return txData
}

// Convert address to readable format (TRON addresses need conversion)
export const formatAddress = (address: string, network: 'BEP20' | 'TRC20') => {
  if (!address) return ''
  
  if (network === 'TRC20' && address.startsWith('41')) {
    // Convert hex address to base58 for TRON
    // This is a simplified version - use tronweb for full implementation
    return address
  }
  
  return address
}

// Truncate address for display
export const truncateAddress = (address: string) => {
  if (!address) return ''
  if (address.length < 12) return address
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

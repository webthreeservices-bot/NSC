'use client'

const WEB3_DISABLED = process.env.NEXT_PUBLIC_WEB3_DISABLED === 'true' || process.env.WEB3_DISABLED === 'true'

let wagmiConfig: any = null

if (!WEB3_DISABLED) {
  // Require wagmi packages only when web3 is enabled
  const { createConfig } = require('wagmi')
  const { bsc } = require('wagmi/chains')
  const { injected, walletConnect } = require('wagmi/connectors')

  wagmiConfig = createConfig({
    chains: [bsc],
    connectors: [
      walletConnect({
        projectId: '5205185a02961ead5f11a0af7b1489bd', // WalletConnect project ID
        showQrModal: true,
      }),
      injected(),
    ],
  })
}

export { wagmiConfig }
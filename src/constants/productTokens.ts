import * as tokenAddresses from 'constants/ethContractAddresses'

export interface ProductToken {
  name: string
  symbol: string
  address: string | undefined
  image: string
  coingeckoId: string
  tokensetsId: string
  fees: any | undefined
}

export const DefiPulseIndex: ProductToken = {
  name: 'DeFi Pulse Index',
  symbol: 'DPI',
  address: tokenAddresses.dpiTokenAddress,
  image: 'https://index-dao.s3.amazonaws.com/defi_pulse_index_set.svg',
  coingeckoId: 'defipulse-index',
  tokensetsId: 'dpi',
  fees: {
    streamingFee: '0.95%',
  },
}

export const CoinsharesCryptoGoldIndex: ProductToken = {
  name: 'Coinshares Crypto Gold Index',
  symbol: 'CGI',
  address: tokenAddresses.cgiTokenAddress,
  image: 'https://set-core.s3.amazonaws.com/img/portfolios/coinshares_gold.png',
  coingeckoId: 'coinshares-gold-and-cryptoassets-index-lite',
  tokensetsId: 'cgi',
  fees: {
    streamingFee: '0.95%',
  },
}

export const IndexToken: ProductToken = {
  name: 'Index Token',
  symbol: 'INDEX',
  address: tokenAddresses.indexTokenAddress,
  image: 'https://index-dao.s3.amazonaws.com/owl.png',
  coingeckoId: 'index-cooperative',
  tokensetsId: 'index',
  fees: null,
}

export const Ethereum2xFlexibleLeverageIndex: ProductToken = {
  name: 'Ethereum 2x Flexible Leverage Index',
  symbol: 'ETH2x-FLI',
  address: tokenAddresses.eth2xfliTokenAddress,
  image: 'https://set-core.s3.amazonaws.com/img/portfolios/eth2x_fli.svg',
  coingeckoId: 'eth-2x-flexible-leverage-index',
  tokensetsId: 'ethfli',
  fees: {
    streamingFee: '1.95%',
  },
}

export const MetaverseIndex: ProductToken = {
  name: 'Metaverse Index',
  symbol: 'MVI',
  address: tokenAddresses.mviTokenAddress,
  image: 'https://set-core.s3.amazonaws.com/img/portfolios/mvi.svg',
  coingeckoId: 'metaverse-index',
  tokensetsId: 'mvi',
  fees: {
    streamingFee: '0.95%',
  },
}

export const Bitcoin2xFlexibleLeverageIndex: ProductToken = {
  name: 'Bitcoin 2x Flexible Leverage Index',
  symbol: 'BTC2x-FLI',
  address: tokenAddresses.btc2xfliTokenAddress,
  image: 'https://set-core.s3.amazonaws.com/img/portfolios/fli_btc.svg',
  coingeckoId: 'btc-2x-flexible-leverage-index',
  tokensetsId: 'btcfli',
  fees: {
    streamingFee: '1.95%',
  },
}

export const productTokensBySymbol = {
  'DPI': DefiPulseIndex,
  'MVI': MetaverseIndex,
  'CGI': CoinsharesCryptoGoldIndex,
  'ETH2x-FLI': Ethereum2xFlexibleLeverageIndex,
  'INDEX': IndexToken,
  'BTC2x-FLI': Bitcoin2xFlexibleLeverageIndex,
}

export default [
  DefiPulseIndex,
  MetaverseIndex,
  CoinsharesCryptoGoldIndex,
  Ethereum2xFlexibleLeverageIndex,
  IndexToken,
  Bitcoin2xFlexibleLeverageIndex,
]

import { ethers } from 'ethers'
import { Web3Wrapper, SupportedProvider } from '@0x/web3-wrapper'
import { SupplyCapIssuanceHookContract } from 'index-sdk/abi/generated/supply_cap_issuance_hook'
import { ERC20Contract } from 'index-sdk/abi/generated/erc20'
import { BigNumber } from '@0x/utils'

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const waitTransaction = async (
  provider: SupportedProvider,
  txHash: string
) => {
  const web3 = new Web3Wrapper(provider)
  let txReceipt
  while (txReceipt == null) {
    const r = await web3.getTransactionReceiptIfExistsAsync(txHash)
    txReceipt = r
    await sleep(2000)
  }
  return txReceipt.status
}

export const approve = async (
  userAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  provider: SupportedProvider,
  onTxHash?: (txHash: string) => void
): Promise<boolean> => {
  const tokenContract = getERC20Contract(provider, tokenAddress)
  try {
    const approval = await tokenContract
      .approve(
        spenderAddress,
        new BigNumber(ethers.constants.MaxUint256.toNumber())
      )
      .awaitTransactionSuccessAsync({
        from: userAddress,
        gas: 80000,
      })
    return true
  } catch (e) {
    return false
  }
}

export const getAllowance = async (
  userAddress: string,
  spenderAddress: string,
  tokenAddress: string,
  provider: SupportedProvider
): Promise<string> => {
  try {
    const tokenContract = getERC20Contract(provider, tokenAddress)
    const allowance = await tokenContract
      .allowance(userAddress, spenderAddress)
      .callAsync()
    return allowance.toString()
  } catch (e) {
    return '0'
  }
}

export const getEthBalance = async (
  provider: SupportedProvider,
  userAddress: string
): Promise<string> => {
  const web3 = new Web3Wrapper(provider)
  try {
    const balance = await web3.getBalanceInWeiAsync(userAddress)
    return balance.toString()
  } catch (e) {
    return '0'
  }
}

export const getBalance = async (
  provider: SupportedProvider,
  tokenAddress: string,
  userAddress: string
): Promise<string> => {
  const tokenContract = getERC20Contract(provider, tokenAddress)
  try {
    const balance = await tokenContract.balanceOf(userAddress).callAsync()
    return balance.toString()
  } catch (e) {
    console.log(e)
    return '0'
  }
}

export const getERC20Contract = (
  provider: SupportedProvider,
  address: string
) => {
  const web3 = new Web3Wrapper(provider)
  return new ERC20Contract(address, provider)
}

export const bnToDec = (bn: BigNumber, decimals = 18) => {
  return bn.dividedBy(new BigNumber(10).pow(decimals)).toNumber()
}

export const decToBn = (dec: number, decimals = 18) => {
  return new BigNumber(dec).multipliedBy(new BigNumber(10).pow(decimals))
}

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18) => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed()
}

export const makeEtherscanLink = (transactionHash: string) => {
  return `https://etherscan.io/tx/${transactionHash}`
}

export const makeEtherscanAddressLink = (transactionHash: string) => {
  return `https://etherscan.io/address/${transactionHash}`
}

export const getTotalSupply = async (
  provider: SupportedProvider,
  tokenAddress: string
): Promise<string> => {
  const tokenContract = getERC20Contract(provider, tokenAddress)
  try {
    const balance = await tokenContract.totalSupply().callAsync()
    return balance.toString()
  } catch (e) {
    return '0'
  }
}

export const getSupplyCap = async (
  tokenAddress: string,
  provider: SupportedProvider
): Promise<string> => {
  const web3 = new Web3Wrapper(provider)
  const contract = new SupplyCapIssuanceHookContract(tokenAddress, provider)
  try {
    const cap = await contract.supplyCap().callAsync()
    return cap.toString()
  } catch (e) {
    return '1'
  }
}

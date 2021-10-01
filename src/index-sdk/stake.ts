import { provider } from 'web3-core'
import { AbiItem } from 'web3-utils'

import StakeABI from 'index-sdk/abi/Stake.json'
import { stakingRewardsAddress } from 'constants/ethContractAddresses'
import BigNumber from 'utils/bignumber'
import { AbiDefinition, SupportedProvider } from 'ethereum-types'
import { Web3Wrapper } from '@0x/web3-wrapper'

export const getStakingRewardsContract = (provider: SupportedProvider) => {
  const web3 = new Web3Wrapper(provider)
  const contract = web3.abiDecoder.addABI(
    [StakeABI as unknown as AbiDefinition],
    stakingRewardsAddress
  )
  return contract
}

export const stakeUniswapEthDpiLpTokens = (
  provider: SupportedProvider,
  account: string,
  stakeQuantity: BigNumber
): Promise<string | null> => {
  const stakingContract = getStakingRewardsContract(provider)

  return new Promise((resolve) => {
    stakingContract.methods
      .stake(stakeQuantity.toString())
      .send({ from: account, gas: 200000 })
      .on('transactionHash', (txId: string) => {
        if (!txId) resolve(null)

        resolve(txId)
      })
      .on('error', (error: any) => {
        console.log(error)
        resolve(null)
      })
  })
}

export const unstakeUniswapEthDpiLpTokens = (
  provider: SupportedProvider,
  account: string,
  unstakeQuantity: BigNumber
): Promise<string | null> => {
  const stakingContract = getStakingRewardsContract(provider)

  return new Promise((resolve) => {
    stakingContract.methods
      .withdraw(unstakeQuantity.toString())
      .send({ from: account, gas: 200000 })
      .on('transactionHash', (txId: string) => {
        if (!txId) resolve(null)

        resolve(txId)
      })
      .on('error', (error: any) => {
        console.log(error)
        resolve(null)
      })
  })
}

export const getEarnedIndexTokenQuantity = async (
  provider: SupportedProvider,
  account: string
): Promise<string> => {
  const stakingContract = getStakingRewardsContract(provider)

  try {
    const earnedTokenQuantity: string = stakingContract.methods
      .earned(account)
      .call()

    return earnedTokenQuantity
  } catch (e) {
    console.log(e)

    return '0'
  }
}

export const claimEarnedIndexLpReward = (
  provider: SupportedProvider,
  account: string
): Promise<string | null> => {
  const stakingContract = getStakingRewardsContract(provider)

  return new Promise((resolve) => {
    stakingContract.methods
      .getReward()
      .send({ from: account, gas: 200000 })
      .on('transactionHash', (txId: string) => {
        if (!txId) resolve(null)

        resolve(txId)
      })
      .on('error', (error: any) => {
        console.log(error)
        resolve(null)
      })
  })
}

export const unstakeAndClaimEarnedIndexLpReward = (
  provider: SupportedProvider,
  account: string
): Promise<string | null> => {
  const stakingContract = getStakingRewardsContract(provider)

  return new Promise((resolve) => {
    stakingContract.methods
      .exit()
      .send({ from: account, gas: 250000 })
      .on('transactionHash', (txId: string) => {
        if (!txId) resolve(null)

        resolve(txId)
      })
      .on('error', (error: any) => {
        console.log(error)
        resolve(null)
      })
  })
}

export const getAmountOfStakedTokens = async (
  provider: SupportedProvider,
  contractAddress: string
) => {
  const web3 = new Web3Wrapper(provider)
  const contract = new web3.eth.Contract(
    StakeABI as unknown as AbiItem,
    contractAddress
  )
  return await contract.methods.totalSupply().call()
}

// Currently set for 12pm PST Dec. 6th
export const farmEndTime = '1607284800000'

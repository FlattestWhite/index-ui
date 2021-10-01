import Web3 from 'web3'
import { provider } from 'web3-core'
import { AbiItem } from 'web3-utils'

import StakeABI from 'index-sdk/abi/Stake.json'
import { mviStakingRewardsAddress } from 'constants/ethContractAddresses'
import BigNumber from 'utils/bignumber'
import { SupportedProvider } from 'ethereum-types'
import { StakeContract } from './abi/generated/stake'

export const getStakingRewardsContract = (provider: SupportedProvider) => {
  if (!mviStakingRewardsAddress) {
    throw new Error('No mvi staking rewards address')
  }
  return new StakeContract(mviStakingRewardsAddress, provider)
}

export const stakeUniswapEthMviLpTokens = async (
  provider: SupportedProvider,
  account: string,
  stakeQuantity: BigNumber
): Promise<string | null> => {
  const stakingContract = getStakingRewardsContract(provider)
  const response = await stakingContract
    .stake(stakeQuantity)
    .awaitTransactionSuccessAsync({
      from: account,
      gas: 200000,
    })
  return response.transactionHash
}

export const unstakeUniswapEthMviLpTokens = async (
  provider: SupportedProvider,
  account: string,
  unstakeQuantity: BigNumber
): Promise<string | null> => {
  const stakingContract = getStakingRewardsContract(provider)
  const response = await stakingContract
    .withdraw(unstakeQuantity)
    .awaitTransactionSuccessAsync({
      from: account,
      gas: 200000,
    })
  return response.transactionHash
}

export const getEarnedIndexTokenQuantity = async (
  provider: SupportedProvider,
  account: string
): Promise<string> => {
  const stakingContract = getStakingRewardsContract(provider)

  try {
    const response = await stakingContract.earned(account).callAsync()
    return response.toString()
  } catch (e) {
    console.log(e)

    return '0'
  }
}

export const claimEarnedIndexLpReward = async (
  provider: SupportedProvider,
  account: string
): Promise<string | null> => {
  const stakingContract = getStakingRewardsContract(provider)
  const response = await stakingContract
    .getReward()
    .awaitTransactionSuccessAsync({
      from: account,
      gas: 200000,
    })
  return response.transactionHash
}

export const unstakeAndClaimEarnedIndexLpReward = async (
  provider: SupportedProvider,
  account: string
): Promise<string | null> => {
  const stakingContract = getStakingRewardsContract(provider)
  const response = await stakingContract.exit().awaitTransactionSuccessAsync({
    from: account,
    gas: 250000,
  })
  return response.transactionHash
}

// Currently set for 12pm PST Apr. 8th 2021
export const mviStakingRewardsStartTime = '1617908400000'

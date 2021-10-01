import { SupportedProvider } from 'ethereum-types'
import BigNumber from 'utils/bignumber'
import Web3 from 'web3'
import { provider } from 'web3-core'
import { AbiItem } from 'web3-utils'
import { MerkleDistributorContract } from './abi/generated/merkle_distributor'

import MerkleABI from './abi/MerkleDistributor.json'

export const getMerkleContract = (
  provider: SupportedProvider,
  rewardsAddress: string
) => {
  return new MerkleDistributorContract(rewardsAddress, provider)
}

const getMerkleAccount = (account: string, merkleData: any) => {
  let key = Object.keys(merkleData).find(
    (key) => account?.toLowerCase() === key.toLowerCase()
  )
  if (key === undefined) return undefined
  return (merkleData as any)[key]
}

export const getRewardsDataForAddress = (
  address: string,
  merkleData: any
): { index: number; amount: string; proof: string[] } | undefined => {
  const rewardBranch = getMerkleAccount(address, merkleData)

  if (!rewardBranch) return
  return rewardBranch
}

export const checkIsRewardsClaimed = async (
  provider: SupportedProvider,
  rewardIndex: number,
  rewardsAddress: any
): Promise<boolean> => {
  const rewardsContract = getMerkleContract(provider, rewardsAddress)

  try {
    return rewardsContract.isClaimed(new BigNumber(rewardIndex)).callAsync()
  } catch (e) {
    console.log(e)
    return true
  }
}

export const claimRewards = async (
  provider: SupportedProvider,
  accountAddress: string,
  rewardIndex: number,
  claimRecipientAddress: string,
  amount: string,
  proof: string[],
  rewardsAddress: string
): Promise<string | null> => {
  const rewardsContract = getMerkleContract(provider, rewardsAddress)
  const response = await rewardsContract
    .claim(
      new BigNumber(rewardIndex),
      claimRecipientAddress,
      new BigNumber(amount),
      proof
    )
    .awaitTransactionSuccessAsync({
      from: accountAddress,
      gas: 120000,
    })
  return response.transactionHash
}

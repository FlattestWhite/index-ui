import { airdropAddress } from 'constants/ethContractAddresses'
import rewardsMerkleRoot from './rewardsMerkleRoot.json'
import { SupportedProvider } from 'ethereum-types'
import { AirdropContract } from './abi/generated/airdrop'
import BigNumber from 'utils/bignumber'

export const getAirdropContract = (
  provider: SupportedProvider,
  address: string
) => {
  return new AirdropContract(address, provider)
}

export const getAirdropDataForAddress = (
  address: string
): { index: number; amount: string; proof: string[] } | undefined => {
  const rewardBranch = (rewardsMerkleRoot as any)[address?.toLowerCase()]

  if (!rewardBranch) return

  return rewardBranch
}

export const checkIsAirdropClaimed = async (
  provider: SupportedProvider,
  rewardIndex: number
): Promise<boolean> => {
  const airdropContract = getAirdropContract(provider, airdropAddress as string)

  try {
    return await airdropContract
      .isClaimed(new BigNumber(rewardIndex))
      .callAsync()
  } catch (e) {
    console.log(e)
    return true
  }
}

export const claimAirdrop = async (
  provider: SupportedProvider,
  accountAddress: string,
  rewardIndex: number,
  claimRecipientAddress: string,
  amount: string,
  proof: string[]
): Promise<string | null> => {
  const airdropContract = getAirdropContract(provider, airdropAddress as string)
  const contract = await airdropContract
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
  return contract.transactionHash
}

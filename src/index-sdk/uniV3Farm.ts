import Web3 from 'web3'
import BigNumber from 'utils/bignumber'
import { SupportedProvider } from 'ethereum-types'

import {
  nftPositionManagerAddress,
  uniswapV3FactoryAddress,
  uniswapV3StakerAddress,
} from 'constants/ethContractAddresses'
import { FarmData, V3Farm } from 'constants/v3Farms'
import { DpiEthRewards } from 'constants/v3Farms'
import { uniswapV3FactoryContract } from './abi/generated/uniswap_v3_factory'
import { uniswapV3StakerContract } from './abi/generated/uniswap_v3_staker'
import { NftPositionManagerContract } from './abi/generated/nft_position_manager'

/**
 * Returns all NFTs eligible for the target farm for the target user account.
 * These are effectively all unstaked NFT IDs.
 * @param farm - Target farm to check NFTs against
 * @param user - User's ethereum account
 * @param provider - Ethereum network provider
 * @returns - A list of NFT IDs
 */
export async function getValidIds(
  farm: V3Farm,
  user: string,
  provider: SupportedProvider
): Promise<number[]> {
  const nftPositionManager = getNftPositionManager(provider)
  const factory = getFactory(provider)

  const totalNfts = await nftPositionManager.balanceOf(user).callAsync()

  const validIds: number[] = []
  for (let i = 0; i < totalNfts.toNumber(); i++) {
    const tokenId = await nftPositionManager
      .tokenOfOwnerByIndex(user, new BigNumber(i))
      .callAsync()
    // check if this NFT is an LP for a currently active farm
    if (
      await isTokenFromValidPool(tokenId, farm, nftPositionManager, factory)
    ) {
      validIds.push(tokenId.toNumber())
    }
  }

  return validIds
}

export async function depositAndStake(
  nftId: number,
  farm: V3Farm,
  user: string,
  provider: SupportedProvider
): Promise<string | null> {
  const nftPositionManager = getNftPositionManager(provider)

  const stakeTokenType = {
    IncentiveKey: {
      rewardToken: 'address',
      pool: 'address',
      startTime: 'uint256',
      endTime: 'uint256',
      refundee: 'address',
    },
  }

  const currentFarmNumber = getMostRecentFarmNumber(farm)

  const data = new Web3(provider).eth.abi.encodeParameters(
    [stakeTokenType],
    [farm.farms[currentFarmNumber]]
  )

  if (!uniswapV3StakerAddress) {
    throw new Error('Missing uniswap v3 staker address')
  }
  // add initially staked farms in transfer data
  const response = await nftPositionManager
    .safeTransferFrom2(user, uniswapV3StakerAddress, new BigNumber(nftId), data)
    .awaitTransactionSuccessAsync({
      from: user,
    })
  return response.transactionHash
}

export async function withdraw(
  nftId: number,
  user: string,
  farm: V3Farm,
  provider: SupportedProvider
): Promise<string | null> {
  const stakingContract = getStakingContract(provider)

  const stakedFarmIds = await getCurrentStakes(farm, nftId, provider)

  const data: string[] = await Promise.all(
    stakedFarmIds.map(async (farmId) => {
      return stakingContract
        .unstakeToken(farm.farms[farmId], new BigNumber(nftId))
        .getABIEncodedTransactionData()
    })
  )

  data.push(
    stakingContract
      .withdrawToken(new BigNumber(nftId), user, '0x')
      .getABIEncodedTransactionData()
  )

  const response = await stakingContract
    .multicall(data)
    .sendTransactionAsync({ from: user })
  return response
}

export async function getAccruedRewardsAmount(
  user: string,
  rewardToken: string,
  provider: SupportedProvider
): Promise<BigNumber> {
  const stakingContract = getStakingContract(provider)
  return await stakingContract.rewards(rewardToken, user).callAsync()
}

export async function getAllPendingRewardsAmount(
  user: string,
  farm: V3Farm,
  provider: SupportedProvider
): Promise<BigNumber> {
  const stakingContract = getStakingContract(provider)
  const deposits = await getAllDepositedTokens(user, farm, provider)

  const amounts = await Promise.all(
    deposits.map(async (id) => {
      const stakes = await getCurrentStakes(farm, id, provider)

      const amounts = await Promise.all(
        stakes.map(async (farmNumber) => {
          const rewardInfo = await stakingContract
            .getRewardInfo(farm.farms[farmNumber], id)
            .callAsync()

          return new BigNumber(rewardInfo[0])
        })
      )

      return amounts.reduce((a, b) => {
        return a.plus(b)
      }, new BigNumber(0))
    })
  )

  return amounts.reduce((a, b) => {
    return a.plus(b)
  }, new BigNumber(0))
}

export type FarmReward = {
  farm: number
  rewards: BigNumber
}

export async function getIndividualPendingRewardsAmount(
  user: string,
  farm: V3Farm,
  nftId: number,
  provider: SupportedProvider
): Promise<BigNumber> {
  const stakingContract = getStakingContract(provider)

  const stakes = await getCurrentStakes(farm, nftId, provider)

  const pendingRewards = await Promise.all(
    stakes.map(async (farmNumber) => {
      const rewardInfo = await stakingContract
        .getRewardInfo(farm.farms[farmNumber], new BigNumber(nftId))
        .callAsync()

      return new BigNumber(rewardInfo[0])
    })
  )

  return pendingRewards.reduce((a, b) => {
    return a.plus(b)
  }, new BigNumber(0))
}

export async function claimAccruedRewards(
  user: string,
  rewardToken: string,
  provider: SupportedProvider
): Promise<string | null> {
  const stakingContract = getStakingContract(provider)
  const response = await stakingContract
    .claimReward(rewardToken, user, new BigNumber(0))
    .awaitTransactionSuccessAsync({ from: user })
  return response.transactionHash
}

export async function getAllDepositedTokens(
  user: string,
  farm: V3Farm,
  provider: SupportedProvider
): Promise<number[]> {
  const options = {
    fromBlock: 0,
    toBlock: 'latest',
    filter: {
      from: user,
      to: uniswapV3StakerAddress || '',
    },
  }

  const nftPositionManager = getNftPositionManager(provider)
  const stakingContract = getStakingContract(provider)
  const factory = getFactory(provider)

  const tokenIdsPotentialDuplicates = (
    await nftPositionManager.getPastEvents('Transfer', options)
  ).map((event) => event.returnValues['tokenId'])
  const tokenIds = Array.from(new Set(tokenIdsPotentialDuplicates))

  const currentlyDeposited: number[] = []
  for (let i = 0; i < tokenIds.length; i++) {
    const depositInfo = await stakingContract.deposits(tokenIds[i]).call()
    const isValidPoolToken = await isTokenFromValidPool(
      tokenIds[i],
      farm,
      nftPositionManager,
      factory
    )

    if (
      isValidPoolToken &&
      (depositInfo.tickLower !== '0' || depositInfo.tickUpper !== '0')
    ) {
      currentlyDeposited.push(parseInt(tokenIds[i]))
    }
  }

  return currentlyDeposited
}

// Helper functions

export function getMostRecentFarmNumber(farm: V3Farm): number {
  return farm.farms.length - 1
}

async function getCurrentStakes(
  farm: V3Farm,
  nftId: number,
  provider: SupportedProvider
): Promise<number[]> {
  const stakingContract = getStakingContract(provider)
  const currentStakes = []

  for (let i = 0; i < farm.farms.length; i++) {
    const incentiveId = deriveIncentiveId(provider, farm.farms[i])
    const stakeInfo = await stakingContract
      .stakes(new BigNumber(nftId), incentiveId)
      .callAsync()

    // Compare liquidity stakeInfo[1] is liquidity
    if (stakeInfo[1] !== new BigNumber(0)) {
      currentStakes.push(i)
    }
  }

  return currentStakes
}

function getNftPositionManager(provider: SupportedProvider) {
  if (!nftPositionManagerAddress) {
    throw new Error('Missing nft positiong manager address')
  }
  return new NftPositionManagerContract(nftPositionManagerAddress, provider)
}

function getFactory(provider: SupportedProvider) {
  if (!uniswapV3FactoryAddress) {
    throw new Error('Missing uniswapv3factory address')
  }
  return new uniswapV3FactoryContract(uniswapV3FactoryAddress, provider)
}

function getStakingContract(provider: SupportedProvider) {
  if (!uniswapV3StakerAddress) {
    throw new Error('Missing uniswapv3staking address')
  }
  return new uniswapV3StakerContract(uniswapV3StakerAddress, provider)
}

function deriveIncentiveId(provider: SupportedProvider, farmPlot: FarmData) {
  const stakeTokenType = {
    IncentiveKey: {
      rewardToken: 'address',
      pool: 'address',
      startTime: 'uint256',
      endTime: 'uint256',
      refundee: 'address',
    },
  }

  const data = new Web3(provider).eth.abi.encodeParameters(
    [stakeTokenType],
    [farmPlot]
  )

  return Web3.utils.keccak256(data)
}

async function isTokenFromValidPool(
  tokenId: BigNumber,
  farm: V3Farm,
  nftPositionManager: NftPositionManagerContract,
  factory: any
): Promise<boolean> {
  const position = await nftPositionManager.positions(tokenId).callAsync()
  const nftPoolAddress = await factory
    .getPool(position[0], position[1], position[2])
    .call()

  return farm.pool?.toLowerCase() === nftPoolAddress?.toLowerCase()
}

export const getUpcomingFarms = () => {
  return DpiEthRewards.farms.filter((farm: FarmData) => {
    const now = Date.now()
    const formattedStartTime = farm.startTime.multipliedBy(1000)

    return formattedStartTime.isGreaterThanOrEqualTo(now)
  })
}

export const getActiveFarms = () => {
  return DpiEthRewards.farms.filter((farm: FarmData) => {
    const now = Date.now()
    const formattedStartTime = farm.startTime.multipliedBy(1000)
    const formattedEndTime = farm.endTime.multipliedBy(1000)

    return (
      formattedStartTime.isGreaterThanOrEqualTo(now) &&
      formattedEndTime.isLessThanOrEqualTo(now)
    )
  })
}

export const getExpiredFarms = () => {
  return DpiEthRewards.farms.filter((farm: FarmData) => {
    const now = Date.now()
    const formattedEndTime = farm.endTime.multipliedBy(1000)

    return formattedEndTime.isGreaterThanOrEqualTo(now)
  })
}

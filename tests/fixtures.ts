import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { newMockEvent } from 'matchstick-as/assembly/index'
export const INDEXER = Address.fromString('0x1111111111111111111111111111111111111111')
export const SERVICE = Address.fromString('0x2222222222222222222222222222222222222222')
export const DELEGATOR = Address.fromString('0x3333333333333333333333333333333333333333')
export const OPERATOR = Address.fromString('0x4444444444444444444444444444444444444444')
export const PAYER = Address.fromString('0x5555555555555555555555555555555555555555')
export const ALLOCATION = Address.fromString('0x6666666666666666666666666666666666666666')
export const STAKING = Address.fromString('0x8888888888888888888888888888888888888888')
export const HASH = Bytes.fromHexString(
  '0x9999999999999999999999999999999999999999999999999999999999999999',
)
export const DEPLOYMENT = Bytes.fromHexString(
  '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
)

export function eventWith<T>(
  params: ethereum.EventParam[],
  logIndex: i32 = 1,
  address: Address = STAKING,
): T {
  let event = newMockEvent()
  event.parameters = params
  event.address = address
  event.logIndex = BigInt.fromI32(logIndex)
  event.transaction.hash = HASH
  event.receipt!.logs = []
  return changetype<T>(event)
}

import {
  ProvisionCreated as HProvisionCreatedLog,
  ProvisionIncreased as HProvisionIncreasedLog,
  ProvisionThawed as HProvisionThawedLog,
  TokensDeprovisioned as HTokensDeprovisionedLog,
  ProvisionSlashed as HProvisionSlashedLog,
  DelegationSlashed as HDelegationSlashedLog,
  ProvisionParametersSet as HProvisionParametersSetLog,
  ProvisionParametersStaged as HProvisionParametersStagedLog,
  DelegationFeeCutSet as HDelegationFeeCutSetLog,
  OperatorSet as HOperatorSetLog,
  TokensToDelegationPoolAdded as HTokensToDelegationPoolAddedLog,
  TokensDelegated as HTokensDelegatedLog,
  TokensUndelegated as HTokensUndelegatedLog,
  DelegatedTokensWithdrawn as HDelegatedTokensWithdrawnLog,
  HorizonStakeDeposited as HHorizonStakeDepositedLog,
  HorizonStakeLocked as HHorizonStakeLockedLog,
  HorizonStakeWithdrawn as HHorizonStakeWithdrawnLog,
  ThawRequestCreated as HThawRequestCreatedLog,
  ThawRequestFulfilled as HThawRequestFulfilledLog,
} from '../src/types/HorizonStaking/HorizonStaking'

export function HProvisionCreated(logIndex: i32 = 1): HProvisionCreatedLog {
  return eventWith<HProvisionCreatedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam(
        'maxVerifierCut',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(50000)),
      ),
      new ethereum.EventParam(
        'thawingPeriod',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(600)),
      ),
    ],
    logIndex,
    STAKING,
  )
}

export function HProvisionIncreased(logIndex: i32 = 1): HProvisionIncreasedLog {
  return eventWith<HProvisionIncreasedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    STAKING,
  )
}

export function HProvisionThawed(logIndex: i32 = 1): HProvisionThawedLog {
  return eventWith<HProvisionThawedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    STAKING,
  )
}

export function HTokensDeprovisioned(logIndex: i32 = 1): HTokensDeprovisionedLog {
  return eventWith<HTokensDeprovisionedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    STAKING,
  )
}

export function HProvisionSlashed(logIndex: i32 = 1): HProvisionSlashedLog {
  return eventWith<HProvisionSlashedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    STAKING,
  )
}

export function HDelegationSlashed(logIndex: i32 = 1): HDelegationSlashedLog {
  return eventWith<HDelegationSlashedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    STAKING,
  )
}

export function HProvisionParametersSet(logIndex: i32 = 1): HProvisionParametersSetLog {
  return eventWith<HProvisionParametersSetLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam(
        'maxVerifierCut',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(50000)),
      ),
      new ethereum.EventParam(
        'thawingPeriod',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(600)),
      ),
    ],
    logIndex,
    STAKING,
  )
}

export function HProvisionParametersStaged(logIndex: i32 = 1): HProvisionParametersStagedLog {
  return eventWith<HProvisionParametersStagedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam(
        'maxVerifierCut',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(50000)),
      ),
      new ethereum.EventParam(
        'thawingPeriod',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(600)),
      ),
    ],
    logIndex,
    STAKING,
  )
}

export function HDelegationFeeCutSet(logIndex: i32 = 1): HDelegationFeeCutSetLog {
  return eventWith<HDelegationFeeCutSetLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('paymentType', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2))),
      new ethereum.EventParam('feeCut', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(250000))),
    ],
    logIndex,
    STAKING,
  )
}

export function HOperatorSet(logIndex: i32 = 1): HOperatorSetLog {
  return eventWith<HOperatorSetLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('operator', ethereum.Value.fromAddress(OPERATOR)),
      new ethereum.EventParam('allowed', ethereum.Value.fromBoolean(true)),
    ],
    logIndex,
    STAKING,
  )
}

export function HTokensToDelegationPoolAdded(logIndex: i32 = 1): HTokensToDelegationPoolAddedLog {
  return eventWith<HTokensToDelegationPoolAddedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    STAKING,
  )
}

export function HTokensDelegated(logIndex: i32 = 1): HTokensDelegatedLog {
  return eventWith<HTokensDelegatedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('delegator', ethereum.Value.fromAddress(DELEGATOR)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam('shares', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(5))),
    ],
    logIndex,
    STAKING,
  )
}

export function HTokensUndelegated(logIndex: i32 = 1): HTokensUndelegatedLog {
  return eventWith<HTokensUndelegatedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('delegator', ethereum.Value.fromAddress(DELEGATOR)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam('shares', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(5))),
    ],
    logIndex,
    STAKING,
  )
}

export function HDelegatedTokensWithdrawn(logIndex: i32 = 1): HDelegatedTokensWithdrawnLog {
  return eventWith<HDelegatedTokensWithdrawnLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('delegator', ethereum.Value.fromAddress(DELEGATOR)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    STAKING,
  )
}

export function HHorizonStakeDeposited(logIndex: i32 = 1): HHorizonStakeDepositedLog {
  return eventWith<HHorizonStakeDepositedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    STAKING,
  )
}

export function HHorizonStakeLocked(logIndex: i32 = 1): HHorizonStakeLockedLog {
  return eventWith<HHorizonStakeLockedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam('until', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(999))),
    ],
    logIndex,
    STAKING,
  )
}

export function HHorizonStakeWithdrawn(logIndex: i32 = 1): HHorizonStakeWithdrawnLog {
  return eventWith<HHorizonStakeWithdrawnLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    STAKING,
  )
}

export function HThawRequestCreated(logIndex: i32 = 1): HThawRequestCreatedLog {
  return eventWith<HThawRequestCreatedLog>(
    [
      new ethereum.EventParam('requestType', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))),
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('verifier', ethereum.Value.fromAddress(SERVICE)),
      new ethereum.EventParam('owner', ethereum.Value.fromAddress(DELEGATOR)),
      new ethereum.EventParam('shares', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(5))),
      new ethereum.EventParam(
        'thawingUntil',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1600)),
      ),
      new ethereum.EventParam('thawRequestId', ethereum.Value.fromFixedBytes(HASH)),
      new ethereum.EventParam('nonce', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))),
    ],
    logIndex,
    STAKING,
  )
}

export function HThawRequestFulfilled(logIndex: i32 = 1): HThawRequestFulfilledLog {
  return eventWith<HThawRequestFulfilledLog>(
    [
      new ethereum.EventParam('requestType', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))),
      new ethereum.EventParam('thawRequestId', ethereum.Value.fromFixedBytes(HASH)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam('shares', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(5))),
      new ethereum.EventParam(
        'thawingUntil',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1600)),
      ),
      new ethereum.EventParam('valid', ethereum.Value.fromBoolean(true)),
    ],
    logIndex,
    STAKING,
  )
}
import {
  ServiceProviderRegistered as SServiceProviderRegisteredLog,
  RewardsDestinationSet as SRewardsDestinationSetLog,
  AllocationCreated as SAllocationCreatedLog,
  AllocationResized as SAllocationResizedLog,
  AllocationClosed as SAllocationClosedLog,
  IndexingRewardsCollected as SIndexingRewardsCollectedLog,
  POIPresented as SPOIPresentedLog,
  QueryFeesCollected as SQueryFeesCollectedLog,
} from '../src/types/SubgraphService/SubgraphService'

export function SServiceProviderRegistered(logIndex: i32 = 1): SServiceProviderRegisteredLog {
  return eventWith<SServiceProviderRegisteredLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('data', ethereum.Value.fromBytes(Bytes.fromHexString('0x1234'))),
    ],
    logIndex,
    SERVICE,
  )
}

export function SRewardsDestinationSet(logIndex: i32 = 1): SRewardsDestinationSetLog {
  return eventWith<SRewardsDestinationSetLog>(
    [
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('rewardsDestination', ethereum.Value.fromAddress(OPERATOR)),
    ],
    logIndex,
    SERVICE,
  )
}

export function SAllocationCreated(logIndex: i32 = 1): SAllocationCreatedLog {
  return eventWith<SAllocationCreatedLog>(
    [
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('allocationId', ethereum.Value.fromAddress(ALLOCATION)),
      new ethereum.EventParam('subgraphDeploymentId', ethereum.Value.fromFixedBytes(DEPLOYMENT)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam(
        'currentEpoch',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(99)),
      ),
    ],
    logIndex,
    SERVICE,
  )
}

export function SAllocationResized(logIndex: i32 = 1): SAllocationResizedLog {
  return eventWith<SAllocationResizedLog>(
    [
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('allocationId', ethereum.Value.fromAddress(ALLOCATION)),
      new ethereum.EventParam('subgraphDeploymentId', ethereum.Value.fromFixedBytes(DEPLOYMENT)),
      new ethereum.EventParam('newTokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(200))),
      new ethereum.EventParam('oldTokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    SERVICE,
  )
}

export function SAllocationClosed(logIndex: i32 = 1): SAllocationClosedLog {
  return eventWith<SAllocationClosedLog>(
    [
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('allocationId', ethereum.Value.fromAddress(ALLOCATION)),
      new ethereum.EventParam('subgraphDeploymentId', ethereum.Value.fromFixedBytes(DEPLOYMENT)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam('forceClosed', ethereum.Value.fromBoolean(true)),
    ],
    logIndex,
    SERVICE,
  )
}

export function SIndexingRewardsCollected(logIndex: i32 = 1): SIndexingRewardsCollectedLog {
  return eventWith<SIndexingRewardsCollectedLog>(
    [
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('allocationId', ethereum.Value.fromAddress(ALLOCATION)),
      new ethereum.EventParam('subgraphDeploymentId', ethereum.Value.fromFixedBytes(DEPLOYMENT)),
      new ethereum.EventParam(
        'tokensRewards',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100)),
      ),
      new ethereum.EventParam(
        'tokensIndexerRewards',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(75)),
      ),
      new ethereum.EventParam(
        'tokensDelegationRewards',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(25)),
      ),
      new ethereum.EventParam('poi', ethereum.Value.fromFixedBytes(HASH)),
      new ethereum.EventParam(
        'poiMetadata',
        ethereum.Value.fromBytes(Bytes.fromHexString('0x1234')),
      ),
      new ethereum.EventParam(
        'currentEpoch',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(99)),
      ),
    ],
    logIndex,
    SERVICE,
  )
}

export function SPOIPresented(logIndex: i32 = 1): SPOIPresentedLog {
  return eventWith<SPOIPresentedLog>(
    [
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('allocationId', ethereum.Value.fromAddress(ALLOCATION)),
      new ethereum.EventParam('subgraphDeploymentId', ethereum.Value.fromFixedBytes(DEPLOYMENT)),
      new ethereum.EventParam('poi', ethereum.Value.fromFixedBytes(HASH)),
      new ethereum.EventParam(
        'poiMetadata',
        ethereum.Value.fromBytes(Bytes.fromHexString('0x1234')),
      ),
      new ethereum.EventParam('condition', ethereum.Value.fromFixedBytes(HASH)),
    ],
    logIndex,
    SERVICE,
  )
}

export function SQueryFeesCollected(logIndex: i32 = 1): SQueryFeesCollectedLog {
  return eventWith<SQueryFeesCollectedLog>(
    [
      new ethereum.EventParam('serviceProvider', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('payer', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('allocationId', ethereum.Value.fromAddress(ALLOCATION)),
      new ethereum.EventParam('subgraphDeploymentId', ethereum.Value.fromFixedBytes(DEPLOYMENT)),
      new ethereum.EventParam(
        'tokensCollected',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100)),
      ),
      new ethereum.EventParam(
        'tokensCurators',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(10)),
      ),
    ],
    logIndex,
    SERVICE,
  )
}
import {
  RewardsAssigned as RRewardsAssignedLog,
  HorizonRewardsAssigned as RHorizonRewardsAssignedLog,
} from '../src/types/RewardsManager/RewardsManager'

export function RRewardsAssigned(logIndex: i32 = 1): RRewardsAssignedLog {
  return eventWith<RRewardsAssignedLog>(
    [
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('allocationID', ethereum.Value.fromAddress(ALLOCATION)),
      new ethereum.EventParam('epoch', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))),
      new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    STAKING,
  )
}

export function RHorizonRewardsAssigned(logIndex: i32 = 1): RHorizonRewardsAssignedLog {
  return eventWith<RHorizonRewardsAssignedLog>(
    [
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('allocationID', ethereum.Value.fromAddress(ALLOCATION)),
      new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    logIndex,
    STAKING,
  )
}

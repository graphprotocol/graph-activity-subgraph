import { saveActivity, rememberAllocation } from './activity'
import { BigInt, Address, BigDecimal, Bytes, ipfs, log } from '@graphprotocol/graph-ts'
import {
  StakeDeposited,
  StakeWithdrawn,
  StakeLocked,
  StakeSlashed,
  AllocationCreated,
  AllocationClosed,
  AllocationClosed1,
  RebateClaimed,
  RebateCollected,
  SetOperator,
  StakeDelegated,
  StakeDelegatedLocked,
  StakeDelegatedWithdrawn,
  AllocationCollected,
  DelegationParametersUpdated,
} from '../types/Staking/Staking'
import { ParameterUpdated } from '../types/StakingExtension/StakingExtension'
import {
  Indexer,
  Allocation,
  SubgraphDeployment,
  GraphAccount,
  Delegator,
  DelegatedStake,
  DelegationParametersUpdatedEvent,
  IndexerStakeDepositedEvent,
  IndexerStakeLockedEvent,
  IndexerStakeWithdrawnEvent,
  IndexerStakeSlashedEvent,
  DelegatorStakeDepositedEvent,
  DelegatorStakeLockedEvent,
  DelegatorStakeWithdrawnEvent,
  AllocationCreatedEvent,
  AllocationCollectedEvent,
  RebateCollectedEvent,
  AllocationClosedEvent,
  RebateClaimedEvent,
  SetOperatorEvent,
  ParameterUpdatedEvent,
} from '../types/schema'

import {
  createOrLoadSubgraphDeployment,
  createOrLoadIndexer,
  createOrLoadDelegator,
  createOrLoadGraphAccount,
  BIGINT_ONE,
} from './helpers'

export function handleDelegationParametersUpdated(event: DelegationParametersUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new DelegationParametersUpdatedEvent(eventId)

  eventEntity.typename = 'DelegationParametersUpdatedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.indexingRewardCut = event.params.indexingRewardCut.toI32()
  eventEntity.queryFeeCut = event.params.queryFeeCut.toI32()
  eventEntity.cooldownBlocks = event.params.cooldownBlocks.toI32()
  saveActivity(eventEntity, event)
}

/**
 * @dev handleStakeDeposited
 * - creates an Indexer if it is the first time they have staked
 * - updated the Indexers stake
 * - updates the GraphNetwork total stake
 */
export function handleStakeDeposited(event: StakeDeposited): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new IndexerStakeDepositedEvent(eventId)

  eventEntity.typename = 'IndexerStakeDepositedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amount = event.params.tokens
  saveActivity(eventEntity, event)
}

/**
 * @dev handleStakeLocked
 * - updated the Indexers stake
 * - note - the contracts work by not changing the tokensStaked amount, so here, capacity does not
 *          get changed
 */
export function handleStakeLocked(event: StakeLocked): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  let eventEntity = new IndexerStakeLockedEvent(eventId)

  eventEntity.typename = 'IndexerStakeLockedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amount = event.params.tokens
  eventEntity.lockedUntil = event.params.until
  saveActivity(eventEntity, event)
}

/**
 * @dev handleStakeWithdrawn
 * - updated the Indexers stake
 * - updates the GraphNetwork total stake
 */
export function handleStakeWithdrawn(event: StakeWithdrawn): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  let eventEntity = new IndexerStakeWithdrawnEvent(eventId)

  eventEntity.typename = 'IndexerStakeWithdrawnEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amount = event.params.tokens
  saveActivity(eventEntity, event)
}

/**
 * @dev handleStakeSlashed
 * - update the Indexers stake
 */
export function handleStakeSlashed(event: StakeSlashed): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  let eventEntity = new IndexerStakeSlashedEvent(eventId)

  eventEntity.typename = 'IndexerStakeSlashedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amountSlashed = event.params.tokens
  saveActivity(eventEntity, event)
}

export function handleStakeDelegated(event: StakeDelegated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let delegatorAddress = event.params.delegator.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)
  accounts.push(delegatorAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(delegatorAddress)
  createOrLoadDelegator(delegatorAddress)

  let eventEntity = new DelegatorStakeDepositedEvent(eventId)

  eventEntity.typename = 'DelegatorStakeDepositedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.delegator = delegatorAddress
  eventEntity.accounts = accounts
  eventEntity.tokenAmount = event.params.tokens
  eventEntity.shareAmount = event.params.shares
  saveActivity(eventEntity, event)
}

export function handleStakeDelegatedLocked(event: StakeDelegatedLocked): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let delegatorAddress = event.params.delegator.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)
  accounts.push(delegatorAddress)

  let eventEntity = new DelegatorStakeLockedEvent(eventId)

  eventEntity.typename = 'DelegatorStakeLockedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.delegator = delegatorAddress
  eventEntity.accounts = accounts
  eventEntity.tokenAmount = event.params.tokens
  eventEntity.shareAmount = event.params.shares
  eventEntity.lockedUntil = event.params.until
  saveActivity(eventEntity, event)
}

export function handleStakeDelegatedWithdrawn(event: StakeDelegatedWithdrawn): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let delegatorAddress = event.params.delegator.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)
  accounts.push(delegatorAddress)

  let eventEntity = new DelegatorStakeWithdrawnEvent(eventId)

  eventEntity.typename = 'DelegatorStakeWithdrawnEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.delegator = delegatorAddress
  eventEntity.accounts = accounts
  eventEntity.tokenAmount = event.params.tokens
  saveActivity(eventEntity, event)
}

/**
 * @dev handleAllocationUpdated
 * - update the indexers stake
 * - update the subgraph total stake
 * - update the named subgraph aggregate stake
 * - update the specific allocation
 * - create a new channel
 */
export function handleAllocationCreated(event: AllocationCreated): void {
  rememberAllocation(
    event.params.allocationID,
    event.params.indexer,
    event.params.subgraphDeploymentID.toHexString(),
  )
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  createOrLoadSubgraphDeployment(event.params.subgraphDeploymentID.toHexString())

  let eventEntity = new AllocationCreatedEvent(eventId)

  eventEntity.typename = 'AllocationCreatedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.allocatedAmount = event.params.tokens
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  saveActivity(eventEntity, event)
}

// Transfers tokens from a state channel to the staking contract
// Burns fees if protocolPercentage > 0
// Collects curationFees to go to curator rewards
// calls collect() on curation, which is handled in curation.ts
// adds to the allocations collected fees
// if closed, it will add fees to the rebate pool
// Note - the name event.param.rebateFees is confusing. Rebate fees are better described
// as query Fees. rebate is from cobbs douglas, which we get from claim()
export function handleAllocationCollected(event: AllocationCollected): void {
  rememberAllocation(
    event.params.allocationID,
    event.params.indexer,
    event.params.subgraphDeploymentID.toHexString(),
  )
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  let eventEntity = new AllocationCollectedEvent(eventId)

  eventEntity.typename = 'AllocationCollectedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.collectedQueryFees = event.params.rebateFees
  eventEntity.curatorQueryFees = event.params.curationFees
  saveActivity(eventEntity, event)
}

/**
 * @dev handleAllocationClosed
 * - update the indexers stake
 * - update the subgraph total stake
 * - update the named subgraph aggregate stake
 * - update the specific allocation
 * - update and close the channel
 */
export function handleAllocationClosed(event: AllocationClosed): void {
  rememberAllocation(
    event.params.allocationID,
    event.params.indexer,
    event.params.subgraphDeploymentID.toHexString(),
  )
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  let eventEntity = new AllocationClosedEvent(eventId)

  eventEntity.typename = 'AllocationClosedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  saveActivity(eventEntity, event)
}

/**
 * @dev handleAllocationClosedCobbDouglas
 * - update the indexers stake
 * - update the subgraph total stake
 * - update the named subgraph aggregate stake
 * - update the specific allocation
 * - update and close the channel
 */
export function handleAllocationClosedCobbDouglas(event: AllocationClosed1): void {
  rememberAllocation(
    event.params.allocationID,
    event.params.indexer,
    event.params.subgraphDeploymentID.toHexString(),
  )
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  let eventEntity = new AllocationClosedEvent(eventId)

  eventEntity.typename = 'AllocationClosedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  saveActivity(eventEntity, event)
}

/**
 * @dev handleRebateClaimed
 * - update pool
 * - update closure of channel in pool
 * - update pool
 * - note - if rebate is transferred to indexer, that will be handled in graphToken.ts, and in
 *          the other case, if it is restaked, it will be handled by handleStakeDeposited
 */
export function handleRebateClaimed(event: RebateClaimed): void {
  rememberAllocation(
    event.params.allocationID,
    event.params.indexer,
    event.params.subgraphDeploymentID.toHexString(),
  )
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  let eventEntity = new RebateClaimedEvent(eventId)

  eventEntity.typename = 'RebateClaimedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.indexerQueryFeeRebates = event.params.tokens
  eventEntity.delegatorQueryFeeRebates = event.params.delegationFees
  saveActivity(eventEntity, event)
}

export function handleRebateCollected(event: RebateCollected): void {
  rememberAllocation(
    event.params.allocationID,
    event.params.indexer,
    event.params.subgraphDeploymentID.toHexString(),
  )
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  let eventEntity = new RebateCollectedEvent(eventId)

  eventEntity.typename = 'RebateCollectedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.collectedQueryFees = event.params.queryFees
  eventEntity.queryFeeRebates = event.params.queryRebates
  eventEntity.curatorQueryFees = event.params.curationFees
  saveActivity(eventEntity, event)
}

/**
 * @dev handleParameterUpdated
 * - updates all parameters of staking, depending on string passed. We then can
 *   call the contract directly to get the updated value
 */
export function handleParameterUpdated(event: ParameterUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let eventEntity = new ParameterUpdatedEvent(eventId)

  eventEntity.typename = 'ParameterUpdatedEvent'
  eventEntity.parameter = event.params.param
  saveActivity(eventEntity, event)
}

export function handleSetOperator(event: SetOperator): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new SetOperatorEvent(eventId)

  eventEntity.typename = 'SetOperatorEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.operator = event.params.operator
  eventEntity.allowed = event.params.allowed
  saveActivity(eventEntity, event)
}

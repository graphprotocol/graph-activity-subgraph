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
  SetOperator,
  StakeDelegated,
  StakeDelegatedLocked,
  StakeDelegatedWithdrawn,
  AllocationCollected,
  DelegationParametersUpdated,
} from '../types/Staking/Staking'
import {
  ParameterUpdated
} from '../types/StakingExtension/StakingExtension'
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
  getCounter,
  BIGINT_ONE,
} from './helpers'
import { RebateCollected } from '../types/L1Staking/L1Staking'

export function handleDelegationParametersUpdated(event: DelegationParametersUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new DelegationParametersUpdatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'DelegationParametersUpdatedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.indexingRewardCut = event.params.indexingRewardCut.toI32()
  eventEntity.queryFeeCut = event.params.queryFeeCut.toI32()
  eventEntity.cooldownBlocks = event.params.cooldownBlocks.toI32()
  eventEntity.save()

  let counter = getCounter()
  counter.delegationParametersUpdatedEventCount =
    counter.delegationParametersUpdatedEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
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
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new IndexerStakeDepositedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'IndexerStakeDepositedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amount = event.params.tokens
  eventEntity.save()

  let counter = getCounter()
  counter.indexerStakeDepositedEventCount = counter.indexerStakeDepositedEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
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
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  let eventEntity = new IndexerStakeLockedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'IndexerStakeLockedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amount = event.params.tokens
  eventEntity.lockedUntil = event.params.until
  eventEntity.save()

  let counter = getCounter()
  counter.indexerStakeLockedEventCount = counter.indexerStakeLockedEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

/**
 * @dev handleStakeWithdrawn
 * - updated the Indexers stake
 * - updates the GraphNetwork total stake
 */
export function handleStakeWithdrawn(event: StakeWithdrawn): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  let eventEntity = new IndexerStakeWithdrawnEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'IndexerStakeWithdrawnEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amount = event.params.tokens
  eventEntity.save()

  let counter = getCounter()
  counter.indexerStakeWithdrawnEventCount = counter.indexerStakeWithdrawnEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

/**
 * @dev handleStakeSlashed
 * - update the Indexers stake
 */
export function handleStakeSlashed(event: StakeSlashed): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  let eventEntity = new IndexerStakeSlashedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'IndexerStakeSlashedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amountSlashed = event.params.tokens
  eventEntity.save()

  let counter = getCounter()
  counter.indexerStakeSlashedEventCount = counter.indexerStakeSlashedEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

export function handleStakeDelegated(event: StakeDelegated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let delegatorAddress = event.params.delegator.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)
  accounts.push(delegatorAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(delegatorAddress)
  createOrLoadDelegator(delegatorAddress)

  let eventEntity = new DelegatorStakeDepositedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'DelegatorStakeDepositedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.delegator = delegatorAddress
  eventEntity.accounts = accounts
  eventEntity.tokenAmount = event.params.tokens
  eventEntity.shareAmount = event.params.shares
  eventEntity.save()

  let counter = getCounter()
  counter.delegatorStakeDepositedEventCount =
    counter.delegatorStakeDepositedEventCount.plus(BIGINT_ONE)
  counter.delegatorEventCount = counter.delegatorEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

export function handleStakeDelegatedLocked(event: StakeDelegatedLocked): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let delegatorAddress = event.params.delegator.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)
  accounts.push(delegatorAddress)

  let eventEntity = new DelegatorStakeLockedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'DelegatorStakeLockedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.delegator = delegatorAddress
  eventEntity.accounts = accounts
  eventEntity.tokenAmount = event.params.tokens
  eventEntity.shareAmount = event.params.shares
  eventEntity.lockedUntil = event.params.until
  eventEntity.save()

  let counter = getCounter()
  counter.delegatorStakeLockedEventCount = counter.delegatorStakeLockedEventCount.plus(BIGINT_ONE)
  counter.delegatorEventCount = counter.delegatorEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

export function handleStakeDelegatedWithdrawn(event: StakeDelegatedWithdrawn): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let delegatorAddress = event.params.delegator.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)
  accounts.push(delegatorAddress)

  let eventEntity = new DelegatorStakeWithdrawnEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'DelegatorStakeWithdrawnEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.delegator = delegatorAddress
  eventEntity.accounts = accounts
  eventEntity.tokenAmount = event.params.tokens
  eventEntity.save()

  let counter = getCounter()
  counter.delegatorStakeWithdrawnEventCount =
    counter.delegatorStakeWithdrawnEventCount.plus(BIGINT_ONE)
  counter.delegatorEventCount = counter.delegatorEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
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
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  createOrLoadSubgraphDeployment(event.params.subgraphDeploymentID.toHexString())

  let eventEntity = new AllocationCreatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'AllocationCreatedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.allocatedAmount = event.params.tokens
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.save()

  let counter = getCounter()
  counter.allocationCreatedEventCount = counter.allocationCreatedEventCount.plus(BIGINT_ONE)
  counter.subgraphDeploymentEventCount = counter.subgraphDeploymentEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
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
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  let eventEntity = new AllocationCollectedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'AllocationCollectedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.collectedQueryFees = event.params.rebateFees
  eventEntity.curatorQueryFees = event.params.curationFees
  eventEntity.save()

  let counter = getCounter()
  counter.allocationCollectedEventCount = counter.allocationCollectedEventCount.plus(BIGINT_ONE)
  counter.subgraphDeploymentEventCount = counter.subgraphDeploymentEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
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
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  let eventEntity = new AllocationClosedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'AllocationClosedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.save()

  let counter = getCounter()
  counter.allocationClosedEventCount = counter.allocationClosedEventCount.plus(BIGINT_ONE)
  counter.subgraphDeploymentEventCount = counter.subgraphDeploymentEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
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
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  let eventEntity = new AllocationClosedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'AllocationClosedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.save()

  let counter = getCounter()
  counter.allocationClosedEventCount = counter.allocationClosedEventCount.plus(BIGINT_ONE)
  counter.subgraphDeploymentEventCount = counter.subgraphDeploymentEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
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
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  let eventEntity = new RebateClaimedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'RebateClaimedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.indexerQueryFeeRebates = event.params.tokens
  eventEntity.delegatorQueryFeeRebates = event.params.delegationFees
  eventEntity.save()

  let counter = getCounter()
  counter.rebateClaimedEventCount = counter.rebateClaimedEventCount.plus(BIGINT_ONE)
  counter.subgraphDeploymentEventCount = counter.subgraphDeploymentEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

export function handleRebateCollected(event: RebateCollected): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  let eventEntity = new RebateCollectedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'RebateCollectedEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.collectedQueryFees = event.params.queryFees
  eventEntity.queryFeeRebates = event.params.queryRebates
  eventEntity.curatorQueryFees = event.params.curationFees
  eventEntity.save()

  let counter = getCounter()
  counter.rebateCollectedEventCount = counter.rebateCollectedEventCount.plus(BIGINT_ONE)
  counter.subgraphDeploymentEventCount = counter.subgraphDeploymentEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

/**
 * @dev handleParameterUpdated
 * - updates all parameters of staking, depending on string passed. We then can
 *   call the contract directly to get the updated value
 */
export function handleParameterUpdated(event: ParameterUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let eventEntity = new ParameterUpdatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'ParameterUpdatedEvent'
  eventEntity.parameter = event.params.param
  eventEntity.save()

  let counter = getCounter()
  counter.parameterUpdatedEventCount = counter.parameterUpdatedEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

export function handleSetOperator(event: SetOperator): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new SetOperatorEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'SetOperatorEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.operator = event.params.operator
  eventEntity.allowed = event.params.allowed
  eventEntity.save()

  let counter = getCounter()
  counter.setOperatorEventCount = counter.setOperatorEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

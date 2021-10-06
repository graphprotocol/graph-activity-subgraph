import { BigInt, Address, BigDecimal, Bytes, ipfs, log } from '@graphprotocol/graph-ts'
import {
  StakeDeposited,
  StakeWithdrawn,
  StakeLocked,
  StakeSlashed,
  AllocationCreated,
  AllocationClosed,
  RebateClaimed,
  ParameterUpdated,
  Staking,
  SetOperator,
  StakeDelegated,
  StakeDelegatedLocked,
  StakeDelegatedWithdrawn,
  AllocationCollected,
  DelegationParametersUpdated,
  SlasherUpdate,
  AssetHolderUpdate,
} from '../types/Staking/Staking'
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
  AllocationClosedEvent,
  RebateClaimedEvent,
  SetOperatorEvent,
} from '../types/schema'

import {
  createOrLoadSubgraphDeployment,
  createOrLoadIndexer,
  joinID,
  createOrLoadDelegator,
  createOrLoadDelegatedStake,
  createOrLoadGraphAccount,
} from './helpers'

export function handleDelegationParametersUpdated(event: DelegationParametersUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new DelegationParametersUpdatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.indexingRewardCut = event.params.indexingRewardCut.toI32()
  eventEntity.queryFeeCut = event.params.queryFeeCut.toI32()
  eventEntity.cooldownBlocks = event.params.cooldownBlocks.toI32()
  eventEntity.save()
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
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new IndexerStakeDepositedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amount = event.params.tokens
  eventEntity.save()
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
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  let eventEntity = new IndexerStakeLockedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amount = event.params.tokens
  eventEntity.lockedUntil = event.params.until
  eventEntity.save()
}

/**
 * @dev handleStakeWithdrawn
 * - updated the Indexers stake
 * - updates the GraphNetwork total stake
 */
export function handleStakeWithdrawn(event: StakeWithdrawn): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  let eventEntity = new IndexerStakeWithdrawnEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amount = event.params.tokens
  eventEntity.save()
}

/**
 * @dev handleStakeSlashed
 * - update the Indexers stake
 */
export function handleStakeSlashed(event: StakeSlashed): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  let eventEntity = new IndexerStakeSlashedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amountSlashed = event.params.tokens
  eventEntity.save()
}

export function handleStakeDelegated(event: StakeDelegated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let delegatorAddress = event.params.delegator.toHexString()
  let accounts = new Array<String>();
  accounts.push(indexerAddress)
  accounts.push(delegatorAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(delegatorAddress)
  createOrLoadDelegator(delegatorAddress)

  let eventEntity = new DelegatorStakeDepositedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.delegator = delegatorAddress
  eventEntity.accounts = accounts
  eventEntity.tokenAmount = event.params.tokens
  eventEntity.shareAmount = event.params.shares
  eventEntity.save()
}

export function handleStakeDelegatedLocked(event: StakeDelegatedLocked): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let delegatorAddress = event.params.delegator.toHexString()
  let accounts = new Array<String>();
  accounts.push(indexerAddress)
  accounts.push(delegatorAddress)

  let eventEntity = new DelegatorStakeLockedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.delegator = delegatorAddress
  eventEntity.accounts = accounts
  eventEntity.tokenAmount = event.params.tokens
  eventEntity.shareAmount = event.params.shares
  eventEntity.lockedUntil = event.params.until
  eventEntity.save()
}

export function handleStakeDelegatedWithdrawn(event: StakeDelegatedWithdrawn): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let delegatorAddress = event.params.delegator.toHexString()
  let accounts = new Array<String>();
  accounts.push(indexerAddress)
  accounts.push(delegatorAddress)

  let eventEntity = new DelegatorStakeWithdrawnEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.delegator = delegatorAddress
  eventEntity.accounts = accounts
  eventEntity.tokenAmount = event.params.tokens
  eventEntity.save()
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
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  createOrLoadSubgraphDeployment(event.params.subgraphDeploymentID.toHexString())

  let eventEntity = new AllocationCreatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.allocatedAmount = event.params.tokens
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.save()
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
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  let eventEntity = new AllocationCollectedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.collectedQueryFees = event.params.rebateFees
  eventEntity.curatorQueryFees = event.params.curationFees
  eventEntity.save()
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
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  let eventEntity = new AllocationClosedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.save()
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
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  let eventEntity = new RebateClaimedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.allocation = event.params.allocationID.toHexString()
  eventEntity.deployment = event.params.subgraphDeploymentID.toHexString()
  eventEntity.indexerQueryFeeRebates = event.params.tokens
  eventEntity.delegatorQueryFeeRebates = event.params.delegationFees
  eventEntity.save()
}

/**
 * @dev handleParameterUpdated
 * - updates all parameters of staking, depending on string passed. We then can
 *   call the contract directly to get the updated value
 */
export function handleParameterUpdated(event: ParameterUpdated): void {
  // let parameter = event.params.param
  // let graphNetwork = GraphNetwork.load('1')
  // let staking = Staking.bind(event.address)
  //
  // if (parameter == 'minimumIndexerStake') {
  //   graphNetwork.minimumIndexerStake = staking.minimumIndexerStake()
  // } else if (parameter == 'thawingPeriod') {
  //   graphNetwork.thawingPeriod = staking.thawingPeriod().toI32()
  // } else if (parameter == 'curationPercentage') {
  //   graphNetwork.curationPercentage = staking.curationPercentage().toI32()
  // } else if (parameter == 'protocolPercentage') {
  //   graphNetwork.protocolFeePercentage = staking.protocolPercentage().toI32()
  // } else if (parameter == 'channelDisputeEpochs') {
  //   graphNetwork.channelDisputeEpochs = staking.channelDisputeEpochs().toI32()
  // } else if (parameter == 'maxAllocationEpochs') {
  //   graphNetwork.maxAllocationEpochs = staking.maxAllocationEpochs().toI32()
  // } else if (parameter == 'rebateRatio') {
  //   graphNetwork.rebateRatio = staking
  //     .alphaNumerator()
  //     .toBigDecimal()
  //     .div(staking.alphaDenominator().toBigDecimal()) // alphaDemoninator != 0, no div() protection needed
  // } else if (parameter == 'delegationRatio') {
  //   graphNetwork.delegationRatio = staking.delegationRatio().toI32()
  // } else if (parameter == 'delegationParametersCooldown') {
  //   graphNetwork.delegationParametersCooldown = staking.delegationParametersCooldown().toI32()
  // } else if (parameter == 'delegationUnbondingPeriod') {
  //   graphNetwork.delegationUnbondingPeriod = staking.delegationUnbondingPeriod().toI32()
  // } else if (parameter == 'delegationTaxPercentage') {
  //   graphNetwork.delegationTaxPercentage = staking.delegationTaxPercentage().toI32()
  // }
  // graphNetwork.save()
}

export function handleSetOperator(event: SetOperator): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new SetOperatorEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.operator = event.params.operator
  eventEntity.allowed = event.params.allowed
  eventEntity.save()
}

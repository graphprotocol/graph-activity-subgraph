import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import {
  Indexer,
  Allocation,
  SubgraphDeployment,
  ParameterUpdatedEvent,
  RewardsDenylistUpdatedEvent,
} from '../types/schema'
import {
  RewardsAssigned,
  ParameterUpdated,
  RewardsManager,
  RewardsDenylistUpdated,
} from '../types/RewardsManager/RewardsManager'
import { createOrLoadSubgraphDeployment, getCounter, BIGINT_ONE } from './helpers'

export function handleRewardsAssigned(event: RewardsAssigned): void {
  // let indexerID = event.params.indexer.toHexString()
  // let allocationID = event.params.allocationID.toHexString()
  //
  // // update indexer
  // let indexer = Indexer.load(indexerID)
  // indexer.rewardsEarned = indexer.rewardsEarned.plus(event.params.amount)
  // // If the delegation pool has zero tokens, the contracts don't give away any rewards
  // let indexerIndexingRewards =
  //   indexer.delegatedTokens == BigInt.fromI32(0)
  //     ? event.params.amount
  //     : event.params.amount
  //         .times(BigInt.fromI32(indexer.indexingRewardCut))
  //         .div(BigInt.fromI32(1000000))
  //
  // let delegatorIndexingRewards = event.params.amount.minus(indexerIndexingRewards)
  //
  // indexer.delegatorIndexingRewards = indexer.delegatorIndexingRewards.plus(delegatorIndexingRewards)
  // indexer.indexerIndexingRewards = indexer.indexerIndexingRewards.plus(indexerIndexingRewards)
  // indexer.delegatedTokens = indexer.delegatedTokens.plus(delegatorIndexingRewards)
  //
  // if (indexer.delegatorShares != BigInt.fromI32(0)) {
  //   indexer = updateDelegationExchangeRate(indexer as Indexer)
  // }
  // indexer = updateAdvancedIndexerMetrics(indexer as Indexer)
  // indexer.save()
  //
  // // update allocation
  // // no status updated, Claimed happens when RebateClaimed, and it is done
  // let allocation = Allocation.load(allocationID)
  // allocation.indexingRewards = allocation.indexingRewards.plus(event.params.amount)
  // allocation.indexingIndexerRewards = allocation.indexingIndexerRewards.plus(indexerIndexingRewards)
  // allocation.indexingDelegatorRewards = allocation.indexingDelegatorRewards.plus(
  //   delegatorIndexingRewards,
  // )
  // allocation.save()
  //
  // // Update epoch
  // let epoch = createOrLoadEpoch(event.block.number)
  // epoch.totalRewards = epoch.totalRewards.plus(event.params.amount)
  // epoch.totalIndexerRewards = epoch.totalIndexerRewards.plus(indexerIndexingRewards)
  // epoch.totalDelegatorRewards = epoch.totalDelegatorRewards.plus(delegatorIndexingRewards)
  // epoch.save()
  //
  // // update subgraph deployment
  // let subgraphDeploymentID = allocation.subgraphDeployment
  // let subgraphDeployment = createOrLoadSubgraphDeployment(
  //   subgraphDeploymentID,
  //   event.block.timestamp,
  // )
  // subgraphDeployment.indexingRewardAmount = subgraphDeployment.indexingRewardAmount.plus(
  //   event.params.amount,
  // )
  // subgraphDeployment.indexingIndexerRewardAmount = subgraphDeployment.indexingIndexerRewardAmount.plus(
  //   indexerIndexingRewards,
  // )
  // subgraphDeployment.indexingDelegatorRewardAmount = subgraphDeployment.indexingDelegatorRewardAmount.plus(
  //   delegatorIndexingRewards,
  // )
  // subgraphDeployment.save()
  //
  // // update graph network
  // let graphNetwork = GraphNetwork.load('1')
  // graphNetwork.totalIndexingRewards = graphNetwork.totalIndexingRewards.plus(event.params.amount)
  // graphNetwork.totalIndexingIndexerRewards = graphNetwork.totalIndexingIndexerRewards.plus(
  //   indexerIndexingRewards,
  // )
  // graphNetwork.totalIndexingDelegatorRewards = graphNetwork.totalIndexingDelegatorRewards.plus(
  //   delegatorIndexingRewards,
  // )
  // graphNetwork.save()
}

/**
 * @dev handleParameterUpdated
 * - handlers updating all parameters
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

// export function handleImplementationUpdated(event: ImplementationUpdated): void {
//   let graphNetwork = GraphNetwork.load('1')
//   let implementations = graphNetwork.rewardsManagerImplementations
//   implementations.push(event.params.newImplementation)
//   graphNetwork.rewardsManagerImplementations = implementations
//   graphNetwork.save()
// }

export function handleRewardsDenyListUpdated(event: RewardsDenylistUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let subgraphDeploymentID = event.params.subgraphDeploymentID.toHexString()

  let eventEntity = new RewardsDenylistUpdatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'RewardsDenylistUpdatedEvent'
  eventEntity.deployment = subgraphDeploymentID
  eventEntity.deniedAt = event.params.sinceBlock.toI32()
  eventEntity.save()

  let counter = getCounter()
  counter.rewardsDenylistUpdatedEventCount =
    counter.rewardsDenylistUpdatedEventCount.plus(BIGINT_ONE)
  counter.subgraphDeploymentEventCount = counter.subgraphDeploymentEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

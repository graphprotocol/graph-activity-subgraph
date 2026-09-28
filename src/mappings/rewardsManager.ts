import { activityId, saveActivity } from './activity'
import { hasServiceRewardCollection } from './rewardCorrelation'
import { Address, Entity, Value, ethereum } from '@graphprotocol/graph-ts'
import {
  IndexingRewardsAssignedEvent,
  UnresolvedIndexingRewardsAssignedEvent,
  ActivityAllocation,
  ParameterUpdatedEvent,
  RewardsDenylistUpdatedEvent,
} from '../types/schema'
import {
  RewardsAssigned,
  HorizonRewardsAssigned,
  ParameterUpdated,
  RewardsDenylistUpdated,
} from '../types/RewardsManager/RewardsManager'
import { createOrLoadSubgraphDeployment } from './helpers'

function assignmentRecord(event: ethereum.Event, indexer: Address, allocation: Address): Entity {
  let context = ActivityAllocation.load(allocation.toHexString())
  let record: Entity
  if (context == null) {
    record = new UnresolvedIndexingRewardsAssignedEvent(activityId(event))
    record.set('typename', Value.fromString('UnresolvedIndexingRewardsAssignedEvent'))
  } else {
    record = new IndexingRewardsAssignedEvent(activityId(event))
    record.set('typename', Value.fromString('IndexingRewardsAssignedEvent'))
    record.set('deployment', Value.fromString(context.deployment))
  }
  record.set('indexer', Value.fromString(indexer.toHexString()))
  record.set('accounts', Value.fromStringArray([indexer.toHexString()]))
  record.set('allocation', Value.fromString(allocation.toHexString()))
  return record
}

export function handleRewardsAssigned(event: RewardsAssigned): void {
  let record = assignmentRecord(event, event.params.indexer, event.params.allocationID)
  record.set('amount', Value.fromBigInt(event.params.amount))
  record.set('epoch', Value.fromBigInt(event.params.epoch))
  record.set('horizon', Value.fromBoolean(false))
  saveActivity(record, event)
}

export function handleHorizonRewardsAssigned(event: HorizonRewardsAssigned): void {
  // Inspect sibling logs instead of requiring a previously indexed allocation.
  // The service collection is the richer record for the same reward distribution.
  if (
    hasServiceRewardCollection(
      event,
      event.params.indexer,
      event.params.allocationID,
      event.params.amount,
    )
  )
    return
  let record = assignmentRecord(event, event.params.indexer, event.params.allocationID)
  record.set('amount', Value.fromBigInt(event.params.amount))
  record.set('horizon', Value.fromBoolean(true))
  saveActivity(record, event)
}

/**
 * @dev handleParameterUpdated
 * - handlers updating all parameters
 */
export function handleParameterUpdated(event: ParameterUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let eventEntity = new ParameterUpdatedEvent(eventId)

  eventEntity.typename = 'ParameterUpdatedEvent'
  eventEntity.parameter = event.params.param
  saveActivity(eventEntity, event)
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

  eventEntity.typename = 'RewardsDenylistUpdatedEvent'
  eventEntity.deployment = subgraphDeploymentID
  eventEntity.deniedAt = event.params.sinceBlock.toI32()
  saveActivity(eventEntity, event)
}

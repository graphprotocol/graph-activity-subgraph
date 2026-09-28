import { Bytes, ethereum } from '@graphprotocol/graph-ts'
import {
  AllocationCreated,
  AllocationResized,
  AllocationClosed,
  IndexingRewardsCollected,
  POIPresented,
  QueryFeesCollected,
  ServiceProviderRegistered,
  RewardsDestinationSet,
} from '../types/SubgraphService/SubgraphService'
import {
  HorizonAllocationCreatedEvent,
  AllocationResizedEvent,
  HorizonAllocationClosedEvent,
  IndexingRewardsCollectedEvent,
  POIPresentedEvent,
  QueryFeesCollectedEvent,
  ServiceProviderRegisteredEvent,
  RewardsDestinationSetEvent,
} from '../types/schema'
import { activityId, saveActivity, setProvision, addAccount, rememberAllocation } from './activity'

export function handleAllocationCreated(event: AllocationCreated): void {
  let record = new HorizonAllocationCreatedEvent(activityId(event))
  record.typename = 'HorizonAllocationCreatedEvent'
  setProvision(record, event.params.indexer, event.address)
  record.allocation = event.params.allocationId.toHexString()
  record.deployment = event.params.subgraphDeploymentId.toHexString()
  rememberAllocation(
    event.params.allocationId,
    event.params.indexer,
    record.deployment,
    record.provision,
  )
  record.allocatedAmount = event.params.tokens
  record.currentEpoch = event.params.currentEpoch
  saveActivity(record, event)
}

export function handleAllocationResized(event: AllocationResized): void {
  let record = new AllocationResizedEvent(activityId(event))
  record.typename = 'AllocationResizedEvent'
  setProvision(record, event.params.indexer, event.address)
  record.allocation = event.params.allocationId.toHexString()
  record.deployment = event.params.subgraphDeploymentId.toHexString()
  rememberAllocation(
    event.params.allocationId,
    event.params.indexer,
    record.deployment,
    record.provision,
  )
  record.oldTokens = event.params.oldTokens
  record.newTokens = event.params.newTokens
  saveActivity(record, event)
}

export function handleAllocationClosed(event: AllocationClosed): void {
  let record = new HorizonAllocationClosedEvent(activityId(event))
  record.typename = 'HorizonAllocationClosedEvent'
  setProvision(record, event.params.indexer, event.address)
  record.allocation = event.params.allocationId.toHexString()
  record.deployment = event.params.subgraphDeploymentId.toHexString()
  rememberAllocation(
    event.params.allocationId,
    event.params.indexer,
    record.deployment,
    record.provision,
  )
  record.tokens = event.params.tokens
  record.forceClosed = event.params.forceClosed
  saveActivity(record, event)
}

export function handleIndexingRewardsCollected(event: IndexingRewardsCollected): void {
  let record = new IndexingRewardsCollectedEvent(activityId(event))
  record.typename = 'IndexingRewardsCollectedEvent'
  setProvision(record, event.params.indexer, event.address)
  record.allocation = event.params.allocationId.toHexString()
  record.deployment = event.params.subgraphDeploymentId.toHexString()
  rememberAllocation(
    event.params.allocationId,
    event.params.indexer,
    record.deployment,
    record.provision,
  )
  record.tokensRewards = event.params.tokensRewards
  record.tokensIndexerRewards = event.params.tokensIndexerRewards
  record.tokensDelegationRewards = event.params.tokensDelegationRewards
  record.poi = event.params.poi
  record.poiMetadata = event.params.poiMetadata
  record.currentEpoch = event.params.currentEpoch
  saveActivity(record, event)
}

export function handlePOIPresented(event: POIPresented): void {
  let record = new POIPresentedEvent(activityId(event))
  record.typename = 'POIPresentedEvent'
  setProvision(record, event.params.indexer, event.address)
  record.allocation = event.params.allocationId.toHexString()
  record.deployment = event.params.subgraphDeploymentId.toHexString()
  rememberAllocation(
    event.params.allocationId,
    event.params.indexer,
    record.deployment,
    record.provision,
  )
  record.poi = event.params.poi
  record.poiMetadata = event.params.poiMetadata
  record.condition = event.params.condition
  saveActivity(record, event)
}

export function handleQueryFeesCollected(event: QueryFeesCollected): void {
  let record = new QueryFeesCollectedEvent(activityId(event))
  record.typename = 'QueryFeesCollectedEvent'
  setProvision(record, event.params.serviceProvider, event.address)
  record.allocation = event.params.allocationId.toHexString()
  record.deployment = event.params.subgraphDeploymentId.toHexString()
  rememberAllocation(
    event.params.allocationId,
    event.params.serviceProvider,
    record.deployment,
    record.provision,
  )
  record.tokensCollected = event.params.tokensCollected
  record.tokensCurators = event.params.tokensCurators
  record.payer = event.params.payer.toHexString()
  addAccount(record, record.payer)
  saveActivity(record, event)
}

export function handleServiceProviderRegistered(event: ServiceProviderRegistered): void {
  let record = new ServiceProviderRegisteredEvent(activityId(event))
  record.typename = 'ServiceProviderRegisteredEvent'
  setProvision(record, event.params.serviceProvider, event.address)
  record.data = event.params.data
  // Dynamic tuple offset, matching the network subgraph's registration decoder.
  // Raw data remains useful even when a different/malformed encoding is emitted.
  if (event.params.data.length >= 96) {
    let prefix = Bytes.fromHexString(
      '0x0000000000000000000000000000000000000000000000000000000000000020',
    )
    let decoded = ethereum.decode('(string,string,address)', prefix.concat(event.params.data))
    if (decoded != null && decoded.kind == ethereum.ValueKind.TUPLE) {
      let tuple = decoded.toTuple()
      record.url = tuple[0].toString()
      record.geoHash = tuple[1].toString()
      record.rewardsDestination = tuple[2].toAddress()
    }
  }
  saveActivity(record, event)
}

export function handleRewardsDestinationSet(event: RewardsDestinationSet): void {
  let record = new RewardsDestinationSetEvent(activityId(event))
  record.typename = 'RewardsDestinationSetEvent'
  setProvision(record, event.params.indexer, event.address)
  record.rewardsDestination = event.params.rewardsDestination
  addAccount(record, event.params.rewardsDestination.toHexString())
  saveActivity(record, event)
}

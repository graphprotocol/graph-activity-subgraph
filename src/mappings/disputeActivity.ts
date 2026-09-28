import { Address, BigInt, Bytes, Entity, Value, ethereum } from '@graphprotocol/graph-ts'
import { ActivityDispute, ActivityAllocation } from '../types/schema'
import { activityId, saveActivity, provisionFor } from './activity'
import { createOrLoadSubgraphDeployment } from './helpers'
import { addresses } from '../../config/addresses'

export function disputeContext(manager: Address, id: Bytes): ActivityDispute {
  let key = manager.toHexString() + '-' + id.toHexString()
  let context = ActivityDispute.load(key)
  if (context === null) {
    context = new ActivityDispute(key)
    context.manager = manager
    context.disputeId = id
    context.save()
  }
  return context as ActivityDispute
}

function enrichAllocation(context: ActivityDispute): void {
  if (context.allocation === null || context.indexer === null) return
  let allocation = ActivityAllocation.load(context.allocation!)
  if (allocation !== null && allocation.indexer == context.indexer!) {
    context.deployment = allocation.deployment
  }
}

function attachContext(record: Entity, context: ActivityDispute, horizon: boolean): void {
  record.set('dispute', Value.fromString(context.id))
  record.set('horizon', Value.fromBoolean(horizon))
  let accounts: string[] = []
  if (context.indexer !== null) {
    record.set('indexer', Value.fromString(context.indexer!))
    accounts.push(context.indexer!)
  }
  if (context.fisherman !== null && accounts.indexOf(context.fisherman!) == -1)
    accounts.push(context.fisherman!)
  record.set('accounts', Value.fromStringArray(accounts))
  if (context.deployment !== null) {
    createOrLoadSubgraphDeployment(context.deployment!)
    record.set('deployment', Value.fromString(context.deployment!))
  }
  if (context.provision !== null) {
    record.set('provision', Value.fromString(context.provision!))
    record.set('dataService', Value.fromString(context.dataService!))
  }
}

// The factory uses concrete schema types so required query relationships stay
// honest when an earlier creation/allocation event was not indexed.
export function newDisputeActivity(type: string, id: string): Entity {
  let record = disputeRecord(type, id)
  record.set('typename', Value.fromString(type))
  return record
}

export function createDispute(
  event: ethereum.Event,
  id: Bytes,
  indexer: Address,
  fisherman: Address,
  kind: string,
  horizon: boolean,
  allocation: Address | null = null,
  deployment: Bytes | null = null,
): Entity {
  let context = disputeContext(event.address, id)
  context.indexer = indexer.toHexString()
  context.fisherman = fisherman.toHexString()
  context.kind = kind
  if (allocation !== null) context.allocation = allocation.toHexString()
  if (deployment !== null) context.deployment = deployment.toHexString()
  if (horizon && kind != 'Legacy') {
    let provision = provisionFor(indexer, Address.fromString(addresses.subgraphService))
    context.provision = provision.id
    context.dataService = provision.dataService
  }
  enrichAllocation(context)
  context.save()
  let type =
    (context.deployment === null ? 'Unresolved' : '') +
    (horizon && kind != 'Legacy' ? 'Horizon' : '') +
    kind +
    'DisputeCreatedEvent'
  let record = newDisputeActivity(type, activityId(event))
  attachContext(record, context, horizon)
  record.set('fisherman', Value.fromString(fisherman.toHexString()))
  if (allocation !== null) record.set('allocation', Value.fromString(allocation.toHexString()))
  return record
}

export function recordDisputeOutcome(
  event: ethereum.Event,
  id: Bytes,
  indexer: Address,
  fisherman: Address,
  tokens: BigInt,
  action: string,
  horizon: boolean,
): void {
  let context = disputeContext(event.address, id)
  context.indexer = indexer.toHexString()
  context.fisherman = fisherman.toHexString()
  enrichAllocation(context)
  context.save()
  let type =
    (context.deployment === null ? 'Unresolved' : '') +
    (context.provision !== null ? 'Provision' : '') +
    'Dispute' +
    action +
    'Event'
  let record = newDisputeActivity(type, activityId(event))
  attachContext(record, context, horizon)
  record.set('fisherman', Value.fromString(fisherman.toHexString()))
  record.set('tokenAmount', Value.fromBigInt(tokens))
  // Payouts include deposits in some outcomes. Preserve the emitted value
  // instead of reconstructing reward/slash amounts using protocol parameters.
  record.set(
    'slashEventIds',
    Value.fromStringArray(
      action == 'Accepted' ? relatedSlashes(event, indexer) : new Array<string>(),
    ),
  )
  saveActivity(record, event)
}

export function recordDisputeLink(
  event: ethereum.Event,
  a: Bytes,
  b: Bytes,
  horizon: boolean,
): void {
  let first = disputeContext(event.address, a)
  let second = disputeContext(event.address, b)
  first.linkedDispute = second.id
  second.linkedDispute = first.id
  enrichAllocation(first)
  enrichAllocation(second)
  first.save()
  second.save()
  // Two observations preserve both dispute feeds, including conflicting cases
  // with different indexers. The suffix identifies the side of the link.
  let contexts = [first, second]
  for (let i = 0; i < contexts.length; i++) {
    let context = contexts[i]
    let prefix = ''
    if (context.provision !== null)
      prefix = context.deployment === null ? 'UnresolvedProvision' : 'Provision'
    else if (context.deployment !== null) prefix = 'Deployment'
    else if (context.indexer !== null) prefix = 'Indexer'
    let record = newDisputeActivity(
      prefix + 'DisputeLinkedEvent',
      activityId(event) + '-' + i.toString(),
    )
    attachContext(record, context, horizon)
    record.set('relatedDispute', Value.fromString(contexts[1 - i].id))
    saveActivity(record, event)
  }
}

import {
  QueryDisputeCreatedEvent,
  IndexingDisputeCreatedEvent,
  UnresolvedIndexingDisputeCreatedEvent,
  HorizonQueryDisputeCreatedEvent,
  HorizonIndexingDisputeCreatedEvent,
  UnresolvedHorizonIndexingDisputeCreatedEvent,
  LegacyDisputeCreatedEvent,
  UnresolvedLegacyDisputeCreatedEvent,
  DisputeAcceptedEvent,
  UnresolvedDisputeAcceptedEvent,
  ProvisionDisputeAcceptedEvent,
  UnresolvedProvisionDisputeAcceptedEvent,
  DisputeRejectedEvent,
  UnresolvedDisputeRejectedEvent,
  ProvisionDisputeRejectedEvent,
  UnresolvedProvisionDisputeRejectedEvent,
  DisputeCancelledEvent,
  UnresolvedDisputeCancelledEvent,
  ProvisionDisputeCancelledEvent,
  UnresolvedProvisionDisputeCancelledEvent,
  DisputeDrawnEvent,
  UnresolvedDisputeDrawnEvent,
  ProvisionDisputeDrawnEvent,
  UnresolvedProvisionDisputeDrawnEvent,
  DisputeLinkedEvent,
  IndexerDisputeLinkedEvent,
  DeploymentDisputeLinkedEvent,
  ProvisionDisputeLinkedEvent,
  UnresolvedProvisionDisputeLinkedEvent,
} from '../types/schema'

function disputeRecord(type: string, id: string): Entity {
  if (type == 'QueryDisputeCreatedEvent') return new QueryDisputeCreatedEvent(id)
  if (type == 'IndexingDisputeCreatedEvent') return new IndexingDisputeCreatedEvent(id)
  if (type == 'UnresolvedIndexingDisputeCreatedEvent')
    return new UnresolvedIndexingDisputeCreatedEvent(id)
  if (type == 'HorizonQueryDisputeCreatedEvent') return new HorizonQueryDisputeCreatedEvent(id)
  if (type == 'HorizonIndexingDisputeCreatedEvent')
    return new HorizonIndexingDisputeCreatedEvent(id)
  if (type == 'UnresolvedHorizonIndexingDisputeCreatedEvent')
    return new UnresolvedHorizonIndexingDisputeCreatedEvent(id)
  if (type == 'LegacyDisputeCreatedEvent') return new LegacyDisputeCreatedEvent(id)
  if (type == 'UnresolvedLegacyDisputeCreatedEvent')
    return new UnresolvedLegacyDisputeCreatedEvent(id)
  if (type == 'DisputeAcceptedEvent') return new DisputeAcceptedEvent(id)
  if (type == 'UnresolvedDisputeAcceptedEvent') return new UnresolvedDisputeAcceptedEvent(id)
  if (type == 'ProvisionDisputeAcceptedEvent') return new ProvisionDisputeAcceptedEvent(id)
  if (type == 'UnresolvedProvisionDisputeAcceptedEvent')
    return new UnresolvedProvisionDisputeAcceptedEvent(id)
  if (type == 'DisputeRejectedEvent') return new DisputeRejectedEvent(id)
  if (type == 'UnresolvedDisputeRejectedEvent') return new UnresolvedDisputeRejectedEvent(id)
  if (type == 'ProvisionDisputeRejectedEvent') return new ProvisionDisputeRejectedEvent(id)
  if (type == 'UnresolvedProvisionDisputeRejectedEvent')
    return new UnresolvedProvisionDisputeRejectedEvent(id)
  if (type == 'DisputeCancelledEvent') return new DisputeCancelledEvent(id)
  if (type == 'UnresolvedDisputeCancelledEvent') return new UnresolvedDisputeCancelledEvent(id)
  if (type == 'ProvisionDisputeCancelledEvent') return new ProvisionDisputeCancelledEvent(id)
  if (type == 'UnresolvedProvisionDisputeCancelledEvent')
    return new UnresolvedProvisionDisputeCancelledEvent(id)
  if (type == 'DisputeDrawnEvent') return new DisputeDrawnEvent(id)
  if (type == 'UnresolvedDisputeDrawnEvent') return new UnresolvedDisputeDrawnEvent(id)
  if (type == 'ProvisionDisputeDrawnEvent') return new ProvisionDisputeDrawnEvent(id)
  if (type == 'UnresolvedProvisionDisputeDrawnEvent')
    return new UnresolvedProvisionDisputeDrawnEvent(id)
  if (type == 'DisputeLinkedEvent') return new DisputeLinkedEvent(id)
  if (type == 'IndexerDisputeLinkedEvent') return new IndexerDisputeLinkedEvent(id)
  if (type == 'DeploymentDisputeLinkedEvent') return new DeploymentDisputeLinkedEvent(id)
  if (type == 'ProvisionDisputeLinkedEvent') return new ProvisionDisputeLinkedEvent(id)
  if (type == 'UnresolvedProvisionDisputeLinkedEvent')
    return new UnresolvedProvisionDisputeLinkedEvent(id)
  throw new Error('Unknown dispute activity type: ' + type)
}

import { isLog, topicAddress } from './receiptLogs'

function relatedSlashes(event: ethereum.Event, indexer: Address): string[] {
  let result: string[] = []
  if (event.receipt === null) return result
  let logs = event.receipt!.logs
  // Bound this decision's segment by the previous decision for this indexer.
  let boundary = BigInt.fromI32(-1)
  for (let i = 0; i < logs.length; i++) {
    let log = logs[i]
    if (log.logIndex.ge(event.logIndex)) continue
    if (
      isLog(
        log,
        event.address.toHexString(),
        'DisputeAccepted(bytes32,address,address,uint256)',
        4,
        1,
      ) &&
      topicAddress(log, 2).equals(indexer) &&
      log.logIndex.gt(boundary)
    )
      boundary = log.logIndex
  }
  for (let i = 0; i < logs.length; i++) {
    let log = logs[i]
    if (log.logIndex.le(boundary) || log.logIndex.ge(event.logIndex)) continue
    let provisionSlash =
      isLog(log, addresses.staking, 'ProvisionSlashed(address,address,uint256)', 3, 1) ||
      isLog(log, addresses.staking, 'DelegationSlashed(address,address,uint256)', 3, 1)
    if (
      provisionSlash &&
      topicAddress(log, 1).equals(indexer) &&
      topicAddress(log, 2).toHexString() == addresses.subgraphService.toLowerCase()
    )
      result.push(event.transaction.hash.toHexString() + '-' + log.logIndex.toString())
    if (
      isLog(log, addresses.staking, 'StakeSlashed(address,uint256,uint256,address)', 2, 3) &&
      topicAddress(log, 1).equals(indexer)
    )
      result.push(event.transaction.hash.toHexString() + '-' + log.logIndex.toString())
  }
  return result
}

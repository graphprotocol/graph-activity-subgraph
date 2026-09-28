import { Value } from '@graphprotocol/graph-ts'
import {
  QueryDisputeCreated,
  IndexingDisputeCreated,
  DisputeAccepted,
  DisputeRejected,
  DisputeDrawn,
  DisputeLinked,
  LegacyDisputeCreated,
  DisputeCancelled,
} from '../types/HorizonDisputeManager/HorizonDisputeManager'
import { createDispute, recordDisputeOutcome, recordDisputeLink } from './disputeActivity'
import { saveActivity } from './activity'

export function handleQueryDisputeCreated(event: QueryDisputeCreated): void {
  let record = createDispute(
    event,
    event.params.disputeId,
    event.params.indexer,
    event.params.fisherman,
    'Query',
    true,
    null,
    event.params.subgraphDeploymentId,
  )
  record.set('tokenAmount', Value.fromBigInt(event.params.tokens))
  record.set('attestation', Value.fromBytes(event.params.attestation))
  record.set(
    'queryContextValues',
    Value.fromBigIntArray([event.params.stakeSnapshot, event.params.cancellableAt]),
  )
  saveActivity(record, event)
}

export function handleIndexingDisputeCreated(event: IndexingDisputeCreated): void {
  let record = createDispute(
    event,
    event.params.disputeId,
    event.params.indexer,
    event.params.fisherman,
    'Indexing',
    true,
    event.params.allocationId,
  )
  record.set('tokenAmount', Value.fromBigInt(event.params.tokens))
  record.set('poi', Value.fromBytes(event.params.poi))
  record.set('disputedBlockNumber', Value.fromBigInt(event.params.blockNumber))
  record.set('stakeSnapshot', Value.fromBigInt(event.params.stakeSnapshot))
  record.set('cancellableAt', Value.fromBigInt(event.params.cancellableAt))
  saveActivity(record, event)
}

export function handleLegacyDisputeCreated(event: LegacyDisputeCreated): void {
  let record = createDispute(
    event,
    event.params.disputeId,
    event.params.indexer,
    event.params.fisherman,
    'Legacy',
    true,
    event.params.allocationId,
  )
  record.set('tokensSlash', Value.fromBigInt(event.params.tokensSlash))
  record.set('tokensRewards', Value.fromBigInt(event.params.tokensRewards))
  saveActivity(record, event)
}

export function handleDisputeAccepted(event: DisputeAccepted): void {
  recordDisputeOutcome(
    event,
    event.params.disputeId,
    event.params.indexer,
    event.params.fisherman,
    event.params.tokens,
    'Accepted',
    true,
  )
}

export function handleDisputeRejected(event: DisputeRejected): void {
  recordDisputeOutcome(
    event,
    event.params.disputeId,
    event.params.indexer,
    event.params.fisherman,
    event.params.tokens,
    'Rejected',
    true,
  )
}

export function handleDisputeDrawn(event: DisputeDrawn): void {
  recordDisputeOutcome(
    event,
    event.params.disputeId,
    event.params.indexer,
    event.params.fisherman,
    event.params.tokens,
    'Drawn',
    true,
  )
}

export function handleDisputeCancelled(event: DisputeCancelled): void {
  recordDisputeOutcome(
    event,
    event.params.disputeId,
    event.params.indexer,
    event.params.fisherman,
    event.params.tokens,
    'Cancelled',
    true,
  )
}

export function handleDisputeLinked(event: DisputeLinked): void {
  recordDisputeLink(event, event.params.disputeId1, event.params.disputeId2, true)
}

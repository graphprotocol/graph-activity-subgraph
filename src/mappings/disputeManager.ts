import { Value } from '@graphprotocol/graph-ts'
import {
  QueryDisputeCreated,
  IndexingDisputeCreated,
  DisputeAccepted,
  DisputeRejected,
  DisputeDrawn,
  DisputeLinked,
  ParameterUpdated,
} from '../types/DisputeManager/DisputeManager'
import { createDispute, recordDisputeOutcome, recordDisputeLink } from './disputeActivity'
import { activityId, saveActivity } from './activity'
import { ParameterUpdatedEvent } from '../types/schema'

export function handleQueryDisputeCreated(event: QueryDisputeCreated): void {
  let record = createDispute(
    event,
    event.params.disputeID,
    event.params.indexer,
    event.params.fisherman,
    'Query',
    false,
    null,
    event.params.subgraphDeploymentID,
  )
  record.set('tokenAmount', Value.fromBigInt(event.params.tokens))
  record.set('attestation', Value.fromBytes(event.params.attestation))
  saveActivity(record, event)
}

export function handleIndexingDisputeCreated(event: IndexingDisputeCreated): void {
  let record = createDispute(
    event,
    event.params.disputeID,
    event.params.indexer,
    event.params.fisherman,
    'Indexing',
    false,
    event.params.allocationID,
  )
  record.set('tokenAmount', Value.fromBigInt(event.params.tokens))
  saveActivity(record, event)
}

export function handleDisputeAccepted(event: DisputeAccepted): void {
  recordDisputeOutcome(
    event,
    event.params.disputeID,
    event.params.indexer,
    event.params.fisherman,
    event.params.tokens,
    'Accepted',
    false,
  )
}

export function handleDisputeRejected(event: DisputeRejected): void {
  recordDisputeOutcome(
    event,
    event.params.disputeID,
    event.params.indexer,
    event.params.fisherman,
    event.params.tokens,
    'Rejected',
    false,
  )
}

export function handleDisputeDrawn(event: DisputeDrawn): void {
  recordDisputeOutcome(
    event,
    event.params.disputeID,
    event.params.indexer,
    event.params.fisherman,
    event.params.tokens,
    'Drawn',
    false,
  )
}

export function handleDisputeLinked(event: DisputeLinked): void {
  recordDisputeLink(event, event.params.disputeID1, event.params.disputeID2, false)
}

export function handleParameterUpdated(event: ParameterUpdated): void {
  let record = new ParameterUpdatedEvent(activityId(event))
  record.typename = 'ParameterUpdatedEvent'
  record.parameter = event.params.param
  saveActivity(record, event)
}

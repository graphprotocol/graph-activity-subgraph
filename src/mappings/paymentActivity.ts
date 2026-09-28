import { Entity, Value, ethereum } from '@graphprotocol/graph-ts'
import {
  ActivityAllocation,
  PaymentCollectedEvent,
  SubgraphPaymentCollectedEvent,
  EscrowCollectedEvent,
  ServiceEscrowCollectedEvent,
  GraphPaymentCollectedEvent,
} from '../types/schema'
import { addresses } from '../../config/addresses'
import { activityId, saveActivity, setProvision, addAccount } from './activity'
import { createOrLoadSubgraphDeployment } from './helpers'
import {
  PaymentLog,
  DISTRIBUTION,
  ESCROW,
  paymentLogs,
  escrowForDistribution,
  distributionForEscrow,
  tallyForEscrow,
  escrowForTally,
  queryFeesForTally,
} from './paymentCorrelation'

function addDistribution(record: Entity, graph: PaymentLog): void {
  let source = graph.payer.toHexString()
  record.set('paymentSource', Value.fromString(source))
  addAccount(record, source)
  record.set('graphPaymentLogIndex', Value.fromBigInt(graph.logIndex))
  if (graph.protocol !== null) record.set('tokensProtocol', Value.fromBigInt(graph.protocol!))
  if (graph.serviceTokens !== null)
    record.set('tokensDataService', Value.fromBigInt(graph.serviceTokens!))
  if (graph.delegation !== null)
    record.set('tokensDelegationPool', Value.fromBigInt(graph.delegation!))
  if (graph.receiverTokens !== null)
    record.set('tokensReceiver', Value.fromBigInt(graph.receiverTokens!))
  if (graph.destination !== null)
    record.set('receiverDestination', Value.fromBytes(graph.destination!))
}

function addEscrow(record: Entity, escrow: PaymentLog): void {
  record.set('escrowLogIndex', Value.fromBigInt(escrow.logIndex))
  if (escrow.destination !== null)
    record.set('receiverDestination', Value.fromBytes(escrow.destination!))
}

export function recordPayment(event: ethereum.Event, own: PaymentLog): void {
  let logs = paymentLogs(event, own)
  let record: Entity
  if (own.kind == DISTRIBUTION) {
    // The escrow/tally record will retain the split. Only suppress a reciprocal,
    // source-checked match; otherwise preserve the distribution as a fallback.
    if (escrowForDistribution(own, logs) !== null) return
    record = new GraphPaymentCollectedEvent(activityId(event))
    record.set('typename', Value.fromString('GraphPaymentCollectedEvent'))
    setProvision(record, own.receiver, own.service)
    addDistribution(record, own)
  } else if (own.kind == ESCROW) {
    if (tallyForEscrow(own, logs) !== null) return
    let graph = distributionForEscrow(own, logs)
    if (graph === null) {
      record = new EscrowCollectedEvent(activityId(event))
      record.set('typename', Value.fromString('EscrowCollectedEvent'))
      record.set('accounts', Value.fromStringArray([]))
    } else {
      record = new ServiceEscrowCollectedEvent(activityId(event))
      record.set('typename', Value.fromString('ServiceEscrowCollectedEvent'))
      setProvision(record, own.receiver, graph.service)
    }
    record.set('payer', Value.fromString(own.payer.toHexString()))
    record.set('collector', Value.fromBytes(own.collector))
    addAccount(record, own.payer.toHexString())
    addAccount(record, own.collector.toHexString())
    addEscrow(record, own)
    if (graph !== null) addDistribution(record, graph)
  } else {
    let allocation: string | null = null
    let deployment: string | null = null
    // A collection ID is opaque for other services/payment types.
    if (
      own.service.toHexString() == addresses.subgraphService.toLowerCase() &&
      own.paymentType == 0 &&
      own.collectionId !== null &&
      own.collectionId!.length == 32 &&
      own.collectionId!.toHexString().slice(2, 26) == '000000000000000000000000'
    ) {
      allocation = '0x' + own.collectionId!.toHexString().slice(26)
      let fees = queryFeesForTally(own, logs)
      if (fees !== null) deployment = fees.deployment!.toHexString()
      else {
        let context = ActivityAllocation.load(allocation!)
        if (
          context !== null &&
          context.indexer == own.receiver.toHexString() &&
          context.provision == own.receiver.toHexString() + '-' + own.service.toHexString()
        )
          deployment = context.deployment
      }
    }
    if (deployment === null) {
      record = new PaymentCollectedEvent(activityId(event))
      record.set('typename', Value.fromString('PaymentCollectedEvent'))
    } else {
      record = new SubgraphPaymentCollectedEvent(activityId(event))
      record.set('typename', Value.fromString('SubgraphPaymentCollectedEvent'))
      createOrLoadSubgraphDeployment(deployment!)
      record.set('deployment', Value.fromString(deployment!))
    }
    setProvision(record, own.receiver, own.service)
    record.set('payer', Value.fromString(own.payer.toHexString()))
    record.set('collector', Value.fromBytes(event.address))
    record.set('collectionId', Value.fromBytes(own.collectionId!))
    if (allocation !== null) record.set('allocation', Value.fromString(allocation!))
    record.set('tallyLogIndex', Value.fromBigInt(own.logIndex))
    addAccount(record, own.payer.toHexString())
    let escrow = escrowForTally(own, logs)
    if (escrow !== null) {
      addEscrow(record, escrow)
      let graph = distributionForEscrow(escrow, logs)
      if (graph !== null) addDistribution(record, graph)
    }
  }
  record.set('receiver', Value.fromString(own.receiver.toHexString()))
  addAccount(record, own.receiver.toHexString())
  record.set('paymentType', Value.fromI32(own.paymentType))
  record.set('tokenAmount', Value.fromBigInt(own.tokens))
  saveActivity(record, event)
}

import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { afterEach, assert, clearStore, test } from 'matchstick-as/assembly/index'
import * as F from './stages45Fixtures'
import * as Old from './fixtures'
import * as G from '../src/mappings/graphPayments'
import * as E from '../src/mappings/paymentsEscrow'
import * as T from '../src/mappings/graphTallyCollector'
import * as S from '../src/mappings/subgraphService'
import { PaymentCollectedEvent, GraphPaymentCollectedEvent } from '../src/types/schema'
import { activityId, provisionFor, rememberAllocation } from '../src/mappings/activity'
import { assertAllCounters } from './counterAssertions'

afterEach(() => {
  assertAllCounters()
  clearStore()
})

test('funding and signer lifecycles preserve thaw/cancellation values and count each action once', () => {
  E.handleDeposit(F.EDeposit(1))
  E.handleThaw(F.EThaw(2))
  E.handleCancelThaw(F.ECancelThaw(3))
  E.handleWithdraw(F.EWithdraw(4))
  T.handleSignerAuthorized(F.TSignerAuthorized(5))
  T.handleSignerThawing(F.TSignerThawing(6))
  T.handleSignerThawCanceled(F.TSignerThawCanceled(7))
  T.handleSignerRevoked(F.TSignerRevoked(8))
  T.handleSignerRevoked(F.TSignerRevoked(8))
  assert.fieldEquals(
    'EscrowThawCancelledEvent',
    activityId(F.ECancelThaw(3)),
    'tokensThawing',
    '100',
  )
  assert.fieldEquals(
    'PayerSignerThawCanceledEvent',
    activityId(F.TSignerThawCanceled(7)),
    'thawEndTimestamp',
    '2000',
  )
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '8')
  assert.entityCount('Provision', 0)
})

test('one complete payment exposes the end payer, split, destination, collection and deployment', () => {
  let graph = F.GGraphPaymentCollected1(1)
  let escrow = F.EEscrowCollected(2)
  let tally = F.TPaymentCollected(3)
  let fees = Old.SQueryFeesCollected(4)
  fees.address = F.service()
  let logs = [
    F.GGraphPaymentCollected1Receipt(graph),
    F.EEscrowCollectedReceipt(escrow),
    F.TPaymentCollectedReceipt(tally),
    F.asLog(fees, 'QueryFeesCollected(address,address,address,bytes32,uint256,uint256)', [0, 1, 2]),
  ]
  graph.receipt!.logs = logs
  escrow.receipt!.logs = logs
  tally.receipt!.logs = logs
  fees.receipt!.logs = logs
  // Deliberately process the richest event first: correlation needs no store order.
  T.handlePaymentCollected(tally)
  G.handleGraphPaymentCollectedWithDestination(graph)
  E.handleEscrowCollected(escrow)
  S.handleQueryFeesCollected(fees)
  assert.entityCount('SubgraphPaymentCollectedEvent', 1)
  assert.entityCount('GraphPaymentCollectedEvent', 0)
  assert.entityCount('EscrowCollectedEvent', 0)
  assert.entityCount('ServiceEscrowCollectedEvent', 0)
  let id = activityId(tally)
  assert.fieldEquals('SubgraphPaymentCollectedEvent', id, 'payer', Old.PAYER.toHexString())
  assert.fieldEquals('SubgraphPaymentCollectedEvent', id, 'paymentSource', F.escrow().toHexString())
  assert.fieldEquals('SubgraphPaymentCollectedEvent', id, 'collector', F.tally().toHexString())
  assert.fieldEquals(
    'SubgraphPaymentCollectedEvent',
    id,
    'receiverDestination',
    Old.OPERATOR.toHexString(),
  )
  assert.fieldEquals('SubgraphPaymentCollectedEvent', id, 'tokensProtocol', '1')
  assert.fieldEquals('SubgraphPaymentCollectedEvent', id, 'tokensDataService', '2')
  assert.fieldEquals('SubgraphPaymentCollectedEvent', id, 'tokensDelegationPool', '3')
  assert.fieldEquals('SubgraphPaymentCollectedEvent', id, 'tokensReceiver', '94')
  assert.fieldEquals(
    'SubgraphPaymentCollectedEvent',
    id,
    'allocation',
    Old.ALLOCATION.toHexString(),
  )
  assert.fieldEquals(
    'SubgraphPaymentCollectedEvent',
    id,
    'deployment',
    Old.DEPLOYMENT.toHexString(),
  )
  assert.fieldEquals('QueryFeesCollectedEvent', activityId(fees), 'paymentEventId', id)
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '2')
})

test('two identical collections in a batch remain two records with their own split provenance', () => {
  let g1 = F.GGraphPaymentCollected(1),
    e1 = F.EEscrowCollected(2),
    t1 = F.TPaymentCollected(3)
  let g2 = F.GGraphPaymentCollected(4),
    e2 = F.EEscrowCollected(5),
    t2 = F.TPaymentCollected(6)
  let logs = [
    F.GGraphPaymentCollectedReceipt(g1),
    F.EEscrowCollectedReceipt(e1),
    F.TPaymentCollectedReceipt(t1),
    F.GGraphPaymentCollectedReceipt(g2),
    F.EEscrowCollectedReceipt(e2),
    F.TPaymentCollectedReceipt(t2),
  ]
  g1.receipt!.logs = logs
  e1.receipt!.logs = logs
  t1.receipt!.logs = logs
  g2.receipt!.logs = logs
  e2.receipt!.logs = logs
  t2.receipt!.logs = logs
  G.handleGraphPaymentCollected(g1)
  E.handleEscrowCollected(e1)
  T.handlePaymentCollected(t1)
  G.handleGraphPaymentCollected(g2)
  E.handleEscrowCollected(e2)
  T.handlePaymentCollected(t2)
  assert.entityCount('PaymentCollectedEvent', 2)
  assert.fieldEquals('PaymentCollectedEvent', activityId(t1), 'graphPaymentLogIndex', '1')
  assert.fieldEquals('PaymentCollectedEvent', activityId(t2), 'graphPaymentLogIndex', '4')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '2')
})

test('escrow plus distribution without a tally records one enriched escrow payment', () => {
  let graph = F.GGraphPaymentCollected(1),
    escrow = F.EEscrowCollected(2)
  let logs = [F.GGraphPaymentCollectedReceipt(graph), F.EEscrowCollectedReceipt(escrow)]
  graph.receipt!.logs = logs
  escrow.receipt!.logs = logs
  G.handleGraphPaymentCollected(graph)
  E.handleEscrowCollected(escrow)
  assert.entityCount('GraphPaymentCollectedEvent', 0)
  assert.entityCount('ServiceEscrowCollectedEvent', 1)
  assert.fieldEquals('ServiceEscrowCollectedEvent', activityId(escrow), 'tokensReceiver', '94')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
})

test('escrow and tally can correlate without a distribution log', () => {
  let escrow = F.EEscrowCollected(1),
    tally = F.TPaymentCollected(2)
  let logs = [F.EEscrowCollectedReceipt(escrow), F.TPaymentCollectedReceipt(tally)]
  escrow.receipt!.logs = logs
  tally.receipt!.logs = logs
  E.handleEscrowCollected(escrow)
  T.handlePaymentCollected(tally)
  assert.entityCount('PaymentCollectedEvent', 1)
  assert.entityCount('EscrowCollectedEvent', 0)
  assert.assertTrue(PaymentCollectedEvent.load(activityId(tally))!.tokensProtocol === null)
})

test('wrong emitters, amounts, types, participants or log order never hide a standalone payment', () => {
  for (let i = 0; i < 7; i++) {
    let graph = F.GGraphPaymentCollected(i * 3 + 1),
      escrow = F.EEscrowCollected(i * 3 + 2)
    let log = F.EEscrowCollectedReceipt(escrow)
    if (i == 0) log.address = Old.OPERATOR
    if (i == 1) {
      escrow.parameters[4].value = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(99))
      log = F.EEscrowCollectedReceipt(escrow)
    }
    if (i == 2) {
      escrow.parameters[0].value = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))
      log = F.EEscrowCollectedReceipt(escrow)
    }
    if (i == 3) {
      escrow.parameters[3].value = ethereum.Value.fromAddress(Old.OPERATOR)
      log = F.EEscrowCollectedReceipt(escrow)
    }
    if (i == 4) log.logIndex = graph.logIndex.minus(BigInt.fromI32(1))
    if (i == 5) log.data = Bytes.fromHexString('0x01')
    if (i == 6) graph.parameters[1].value = ethereum.Value.fromAddress(Old.PAYER)
    graph.receipt!.logs = [log]
    G.handleGraphPaymentCollected(graph)
  }
  assert.entityCount('GraphPaymentCollectedEvent', 7)
})

test('a mismatching tally payer or collector leaves escrow collection visible', () => {
  for (let i = 0; i < 2; i++) {
    let escrow = F.EEscrowCollected(i * 3 + 1),
      tally = F.TPaymentCollected(i * 3 + 2)
    if (i == 0) tally.parameters[2].value = ethereum.Value.fromAddress(Old.OPERATOR)
    else escrow.parameters[2].value = ethereum.Value.fromAddress(Old.OPERATOR)
    escrow.receipt!.logs = [F.TPaymentCollectedReceipt(tally)]
    E.handleEscrowCollected(escrow)
  }
  assert.entityCount('EscrowCollectedEvent', 2)
})

test('opaque IDs and other service/payment types are never treated as subgraph allocation addresses', () => {
  for (let i = 0; i < 3; i++) {
    let tally = F.TPaymentCollected(i + 1)
    if (i == 0) tally.parameters[1].value = ethereum.Value.fromFixedBytes(Old.HASH)
    if (i == 1) tally.parameters[4].value = ethereum.Value.fromAddress(Old.SERVICE)
    if (i == 2) tally.parameters[0].value = ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))
    T.handlePaymentCollected(tally)
    assert.assertTrue(PaymentCollectedEvent.load(activityId(tally))!.allocation === null)
  }
  assert.entityCount('PaymentCollectedEvent', 3)
})

test('known allocation context enriches a standalone tally collection only for the same provider/service', () => {
  let provision = provisionFor(Old.INDEXER, F.service())
  rememberAllocation(Old.ALLOCATION, Old.INDEXER, Old.DEPLOYMENT.toHexString(), provision.id)
  T.handlePaymentCollected(F.TPaymentCollected(1))
  rememberAllocation(Old.ALLOCATION, Old.OPERATOR, Old.DEPLOYMENT.toHexString())
  T.handlePaymentCollected(F.TPaymentCollected(2))
  assert.entityCount('SubgraphPaymentCollectedEvent', 1)
  assert.entityCount('PaymentCollectedEvent', 1)
})

test('receiver destination variants preserve standalone distributions without calling escrow the end payer', () => {
  G.handleGraphPaymentCollectedWithDestination(F.GGraphPaymentCollected1(1))
  G.handleGraphPaymentCollected(F.GGraphPaymentCollected(2))
  assert.fieldEquals(
    'GraphPaymentCollectedEvent',
    activityId(F.GGraphPaymentCollected1(1)),
    'receiverDestination',
    Old.OPERATOR.toHexString(),
  )
  assert.fieldEquals(
    'GraphPaymentCollectedEvent',
    activityId(F.GGraphPaymentCollected(2)),
    'paymentSource',
    F.escrow().toHexString(),
  )
  assert.assertTrue(
    GraphPaymentCollectedEvent.load(activityId(F.GGraphPaymentCollected(2)))!
      .receiverDestination === null,
  )
})

test('receipt decoding leaves wire bytes unchanged across repeated reads', () => {
  let graph = F.GGraphPaymentCollected1(1)
  let escrow = F.EEscrowCollected(2)
  let tally = F.TPaymentCollected(3)
  let graphLog = F.GGraphPaymentCollected1Receipt(graph)
  let escrowLog = F.EEscrowCollectedReceipt(escrow)
  let originalGraph = graphLog.data.toHexString()
  let originalEscrow = escrowLog.data.toHexString()
  tally.receipt!.logs = [graphLog, escrowLog, F.TPaymentCollectedReceipt(tally)]
  T.handlePaymentCollected(tally)
  T.handlePaymentCollected(tally)
  assert.stringEquals(graphLog.data.toHexString(), originalGraph)
  assert.stringEquals(escrowLog.data.toHexString(), originalEscrow)
  assert.fieldEquals('PaymentCollectedEvent', activityId(tally), 'tokensReceiver', '94')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
})

test('different services and destinations prevent unsupported payment correlation', () => {
  let graph = F.GGraphPaymentCollected1(1)
  let escrow = F.EEscrowCollected(2)
  graph.parameters[9].value = ethereum.Value.fromAddress(Old.PAYER)
  graph.receipt!.logs = [F.EEscrowCollectedReceipt(escrow)]
  G.handleGraphPaymentCollectedWithDestination(graph)
  assert.entityCount('GraphPaymentCollectedEvent', 1)

  let otherGraph = F.GGraphPaymentCollected(3)
  let otherEscrow = F.EEscrowCollected(4)
  let tally = F.TPaymentCollected(5)
  otherGraph.parameters[3].value = ethereum.Value.fromAddress(Old.SERVICE)
  otherEscrow.receipt!.logs = [
    F.GGraphPaymentCollectedReceipt(otherGraph),
    F.TPaymentCollectedReceipt(tally),
  ]
  E.handleEscrowCollected(otherEscrow)
  assert.entityCount('ServiceEscrowCollectedEvent', 1)
})

test('query-fee enrichment rejects another collection or an earlier fee log', () => {
  for (let i = 0; i < 2; i++) {
    let tally = F.TPaymentCollected(i * 3 + 2)
    let fees = Old.SQueryFeesCollected(i * 3 + 3)
    fees.address = F.service()
    if (i == 0) fees.parameters[2].value = ethereum.Value.fromAddress(Old.OPERATOR)
    else fees.logIndex = tally.logIndex.minus(BigInt.fromI32(1))
    tally.receipt!.logs = [
      F.asLog(
        fees,
        'QueryFeesCollected(address,address,address,bytes32,uint256,uint256)',
        [0, 1, 2],
      ),
    ]
    T.handlePaymentCollected(tally)
  }
  assert.entityCount('PaymentCollectedEvent', 2)
  assert.entityCount('SubgraphPaymentCollectedEvent', 0)
})

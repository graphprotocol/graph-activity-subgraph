import { afterEach, assert, clearStore, test } from 'matchstick-as/assembly/index'
import { activityId } from '../src/mappings/activity'
import { assertAllCounters } from './counterAssertions'
import * as F from './stages45Fixtures'
import * as D from '../src/mappings/disputeManager'
import * as H from '../src/mappings/horizonDisputeManager'
import * as E from '../src/mappings/paymentsEscrow'
import * as T from '../src/mappings/graphTallyCollector'
import * as G from '../src/mappings/graphPayments'

afterEach(() => {
  assertAllCounters()
  clearStore()
})

test('DisputeManager.DisputeAccepted records isolated activity', () => {
  let event = F.DDisputeAccepted()
  D.handleDisputeAccepted(event)
  assert.entityCount('UnresolvedDisputeAcceptedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'UnresolvedDisputeAcceptedEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('UnresolvedDisputeAcceptedEvent', id, 'logIndex', '1')
})

test('DisputeManager.DisputeDrawn records isolated activity', () => {
  let event = F.DDisputeDrawn()
  D.handleDisputeDrawn(event)
  assert.entityCount('UnresolvedDisputeDrawnEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'UnresolvedDisputeDrawnEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('UnresolvedDisputeDrawnEvent', id, 'logIndex', '1')
})

test('DisputeManager.DisputeLinked records isolated activity', () => {
  let event = F.DDisputeLinked()
  D.handleDisputeLinked(event)
  assert.entityCount('DisputeLinkedEvent', 2)
  let id = activityId(event) + '-0'
  assert.fieldEquals('DisputeLinkedEvent', id, 'contractAddress', event.address.toHexString())
  assert.fieldEquals('DisputeLinkedEvent', id, 'logIndex', '1')
})

test('DisputeManager.DisputeRejected records isolated activity', () => {
  let event = F.DDisputeRejected()
  D.handleDisputeRejected(event)
  assert.entityCount('UnresolvedDisputeRejectedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'UnresolvedDisputeRejectedEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('UnresolvedDisputeRejectedEvent', id, 'logIndex', '1')
})

test('DisputeManager.IndexingDisputeCreated records isolated activity', () => {
  let event = F.DIndexingDisputeCreated()
  D.handleIndexingDisputeCreated(event)
  assert.entityCount('UnresolvedIndexingDisputeCreatedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'UnresolvedIndexingDisputeCreatedEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('UnresolvedIndexingDisputeCreatedEvent', id, 'logIndex', '1')
})

test('DisputeManager.QueryDisputeCreated records isolated activity', () => {
  let event = F.DQueryDisputeCreated()
  D.handleQueryDisputeCreated(event)
  assert.entityCount('QueryDisputeCreatedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals('QueryDisputeCreatedEvent', id, 'contractAddress', event.address.toHexString())
  assert.fieldEquals('QueryDisputeCreatedEvent', id, 'logIndex', '1')
})

test('HorizonDisputeManager.DisputeAccepted records isolated activity', () => {
  let event = F.HDisputeAccepted()
  H.handleDisputeAccepted(event)
  assert.entityCount('UnresolvedDisputeAcceptedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'UnresolvedDisputeAcceptedEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('UnresolvedDisputeAcceptedEvent', id, 'logIndex', '1')
})

test('HorizonDisputeManager.DisputeCancelled records isolated activity', () => {
  let event = F.HDisputeCancelled()
  H.handleDisputeCancelled(event)
  assert.entityCount('UnresolvedDisputeCancelledEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'UnresolvedDisputeCancelledEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('UnresolvedDisputeCancelledEvent', id, 'logIndex', '1')
})

test('HorizonDisputeManager.DisputeDrawn records isolated activity', () => {
  let event = F.HDisputeDrawn()
  H.handleDisputeDrawn(event)
  assert.entityCount('UnresolvedDisputeDrawnEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'UnresolvedDisputeDrawnEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('UnresolvedDisputeDrawnEvent', id, 'logIndex', '1')
})

test('HorizonDisputeManager.DisputeLinked records isolated activity', () => {
  let event = F.HDisputeLinked()
  H.handleDisputeLinked(event)
  assert.entityCount('DisputeLinkedEvent', 2)
  let id = activityId(event) + '-0'
  assert.fieldEquals('DisputeLinkedEvent', id, 'contractAddress', event.address.toHexString())
  assert.fieldEquals('DisputeLinkedEvent', id, 'logIndex', '1')
})

test('HorizonDisputeManager.DisputeRejected records isolated activity', () => {
  let event = F.HDisputeRejected()
  H.handleDisputeRejected(event)
  assert.entityCount('UnresolvedDisputeRejectedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'UnresolvedDisputeRejectedEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('UnresolvedDisputeRejectedEvent', id, 'logIndex', '1')
})

test('HorizonDisputeManager.IndexingDisputeCreated records isolated activity', () => {
  let event = F.HIndexingDisputeCreated()
  H.handleIndexingDisputeCreated(event)
  assert.entityCount('UnresolvedHorizonIndexingDisputeCreatedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'UnresolvedHorizonIndexingDisputeCreatedEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('UnresolvedHorizonIndexingDisputeCreatedEvent', id, 'logIndex', '1')
})

test('HorizonDisputeManager.LegacyDisputeCreated records isolated activity', () => {
  let event = F.HLegacyDisputeCreated()
  H.handleLegacyDisputeCreated(event)
  assert.entityCount('UnresolvedLegacyDisputeCreatedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'UnresolvedLegacyDisputeCreatedEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('UnresolvedLegacyDisputeCreatedEvent', id, 'logIndex', '1')
})

test('HorizonDisputeManager.QueryDisputeCreated records isolated activity', () => {
  let event = F.HQueryDisputeCreated()
  H.handleQueryDisputeCreated(event)
  assert.entityCount('HorizonQueryDisputeCreatedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'HorizonQueryDisputeCreatedEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('HorizonQueryDisputeCreatedEvent', id, 'logIndex', '1')
})

test('PaymentsEscrow.CancelThaw records isolated activity', () => {
  let event = F.ECancelThaw()
  E.handleCancelThaw(event)
  assert.entityCount('EscrowThawCancelledEvent', 1)
  let id = activityId(event)
  assert.fieldEquals('EscrowThawCancelledEvent', id, 'contractAddress', event.address.toHexString())
  assert.fieldEquals('EscrowThawCancelledEvent', id, 'logIndex', '1')
})

test('PaymentsEscrow.Deposit records isolated activity', () => {
  let event = F.EDeposit()
  E.handleDeposit(event)
  assert.entityCount('EscrowDepositedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals('EscrowDepositedEvent', id, 'contractAddress', event.address.toHexString())
  assert.fieldEquals('EscrowDepositedEvent', id, 'logIndex', '1')
})

test('PaymentsEscrow.EscrowCollected records isolated activity', () => {
  let event = F.EEscrowCollected()
  E.handleEscrowCollected(event)
  assert.entityCount('EscrowCollectedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals('EscrowCollectedEvent', id, 'contractAddress', event.address.toHexString())
  assert.fieldEquals('EscrowCollectedEvent', id, 'logIndex', '1')
})

test('PaymentsEscrow.Thaw records isolated activity', () => {
  let event = F.EThaw()
  E.handleThaw(event)
  assert.entityCount('EscrowThawedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals('EscrowThawedEvent', id, 'contractAddress', event.address.toHexString())
  assert.fieldEquals('EscrowThawedEvent', id, 'logIndex', '1')
})

test('PaymentsEscrow.Withdraw records isolated activity', () => {
  let event = F.EWithdraw()
  E.handleWithdraw(event)
  assert.entityCount('EscrowWithdrawnEvent', 1)
  let id = activityId(event)
  assert.fieldEquals('EscrowWithdrawnEvent', id, 'contractAddress', event.address.toHexString())
  assert.fieldEquals('EscrowWithdrawnEvent', id, 'logIndex', '1')
})

test('GraphTallyCollector.PaymentCollected records isolated activity', () => {
  let event = F.TPaymentCollected()
  T.handlePaymentCollected(event)
  assert.entityCount('PaymentCollectedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals('PaymentCollectedEvent', id, 'contractAddress', event.address.toHexString())
  assert.fieldEquals('PaymentCollectedEvent', id, 'logIndex', '1')
})

test('GraphTallyCollector.SignerAuthorized records isolated activity', () => {
  let event = F.TSignerAuthorized()
  T.handleSignerAuthorized(event)
  assert.entityCount('PayerSignerAuthorizedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'PayerSignerAuthorizedEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('PayerSignerAuthorizedEvent', id, 'logIndex', '1')
})

test('GraphTallyCollector.SignerRevoked records isolated activity', () => {
  let event = F.TSignerRevoked()
  T.handleSignerRevoked(event)
  assert.entityCount('PayerSignerRevokedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals('PayerSignerRevokedEvent', id, 'contractAddress', event.address.toHexString())
  assert.fieldEquals('PayerSignerRevokedEvent', id, 'logIndex', '1')
})

test('GraphTallyCollector.SignerThawCanceled records isolated activity', () => {
  let event = F.TSignerThawCanceled()
  T.handleSignerThawCanceled(event)
  assert.entityCount('PayerSignerThawCanceledEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'PayerSignerThawCanceledEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('PayerSignerThawCanceledEvent', id, 'logIndex', '1')
})

test('GraphTallyCollector.SignerThawing records isolated activity', () => {
  let event = F.TSignerThawing()
  T.handleSignerThawing(event)
  assert.entityCount('PayerSignerThawingEvent', 1)
  let id = activityId(event)
  assert.fieldEquals('PayerSignerThawingEvent', id, 'contractAddress', event.address.toHexString())
  assert.fieldEquals('PayerSignerThawingEvent', id, 'logIndex', '1')
})

test('GraphPayments.GraphPaymentCollected records isolated activity', () => {
  let event = F.GGraphPaymentCollected()
  G.handleGraphPaymentCollected(event)
  assert.entityCount('GraphPaymentCollectedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'GraphPaymentCollectedEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('GraphPaymentCollectedEvent', id, 'logIndex', '1')
})

test('GraphPayments.GraphPaymentCollected1 records isolated activity', () => {
  let event = F.GGraphPaymentCollected1()
  G.handleGraphPaymentCollectedWithDestination(event)
  assert.entityCount('GraphPaymentCollectedEvent', 1)
  let id = activityId(event)
  assert.fieldEquals(
    'GraphPaymentCollectedEvent',
    id,
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('GraphPaymentCollectedEvent', id, 'logIndex', '1')
})

import { Address, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { afterEach, assert, clearStore, test } from 'matchstick-as/assembly/index'
import * as F from './stages45Fixtures'
import * as Old from './fixtures'
import * as H from '../src/mappings/horizonDisputeManager'
import * as D from '../src/mappings/disputeManager'
import { ActivityDispute } from '../src/types/schema'
import { addresses } from '../config/addresses'
import { activityId, provisionFor, rememberAllocation } from '../src/mappings/activity'
import { assertAllCounters } from './counterAssertions'
import { handleProvisionSlashed, handleDelegationSlashed } from '../src/mappings/horizonStaking'

afterEach(() => {
  assertAllCounters()
  clearStore()
})

function contextId(horizon: boolean, id: Bytes = F.DISPUTE_ID): string {
  return (
    (horizon ? addresses.horizonDisputeManager : addresses.disputeManager).toLowerCase() +
    '-' +
    id.toHexString()
  )
}

function allocation(): void {
  let p = provisionFor(Old.INDEXER, F.service())
  rememberAllocation(Old.ALLOCATION, Old.INDEXER, Old.DEPLOYMENT.toHexString(), p.id)
}

test('Horizon indexing creation and outcomes retain provision, deployment, POI and raw payout', () => {
  allocation()
  H.handleIndexingDisputeCreated(F.HIndexingDisputeCreated(1))
  H.handleDisputeAccepted(F.HDisputeAccepted(2))
  H.handleDisputeRejected(F.HDisputeRejected(3))
  H.handleDisputeCancelled(F.HDisputeCancelled(4))
  H.handleDisputeDrawn(F.HDisputeDrawn(5))
  assert.fieldEquals(
    'HorizonIndexingDisputeCreatedEvent',
    activityId(F.HIndexingDisputeCreated(1)),
    'poi',
    Old.HASH.toHexString(),
  )
  assert.fieldEquals(
    'HorizonIndexingDisputeCreatedEvent',
    activityId(F.HIndexingDisputeCreated(1)),
    'cancellableAt',
    '1000',
  )
  for (let i = 0; i < 4; i++) {
    let type = [
      'ProvisionDisputeAcceptedEvent',
      'ProvisionDisputeRejectedEvent',
      'ProvisionDisputeCancelledEvent',
      'ProvisionDisputeDrawnEvent',
    ][i]
    assert.fieldEquals(
      type,
      Old.HASH.toHexString() + '-' + (i + 2).toString(),
      'tokenAmount',
      '100',
    )
    assert.fieldEquals(
      type,
      Old.HASH.toHexString() + '-' + (i + 2).toString(),
      'deployment',
      Old.DEPLOYMENT.toHexString(),
    )
  }
})

test('Horizon outcomes without allocation history retain their known provision', () => {
  H.handleIndexingDisputeCreated(F.HIndexingDisputeCreated(1))
  H.handleDisputeAccepted(F.HDisputeAccepted(2))
  H.handleDisputeRejected(F.HDisputeRejected(3))
  H.handleDisputeCancelled(F.HDisputeCancelled(4))
  H.handleDisputeDrawn(F.HDisputeDrawn(5))
  for (let i = 0; i < 4; i++) {
    let type = [
      'UnresolvedProvisionDisputeAcceptedEvent',
      'UnresolvedProvisionDisputeRejectedEvent',
      'UnresolvedProvisionDisputeCancelledEvent',
      'UnresolvedProvisionDisputeDrawnEvent',
    ][i]
    assert.entityCount(type, 1)
  }
  assert.fieldEquals('CounterEntity', '0', 'subgraphDeploymentEventCount', '0')
})

test('legacy manager and Horizon legacy-allocation disputes never acquire a provision', () => {
  allocation()
  D.handleIndexingDisputeCreated(F.DIndexingDisputeCreated(1))
  D.handleDisputeAccepted(F.DDisputeAccepted(2))
  D.handleDisputeRejected(F.DDisputeRejected(3))
  D.handleDisputeDrawn(F.DDisputeDrawn(4))
  H.handleLegacyDisputeCreated(F.HLegacyDisputeCreated(5))
  H.handleDisputeAccepted(F.HDisputeAccepted(6))
  H.handleDisputeCancelled(F.HDisputeCancelled(7))
  assert.fieldEquals(
    'LegacyDisputeCreatedEvent',
    activityId(F.HLegacyDisputeCreated(5)),
    'tokensSlash',
    '80',
  )
  assert.fieldEquals(
    'LegacyDisputeCreatedEvent',
    activityId(F.HLegacyDisputeCreated(5)),
    'tokensRewards',
    '8',
  )
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '0')
  assert.entityCount('ActivityDispute', 2)
  assert.assertTrue(ActivityDispute.load(contextId(true))!.provision === null)
})

test('allocation enrichment appearing later affects new outcomes but never rewrites earlier activity', () => {
  H.handleIndexingDisputeCreated(F.HIndexingDisputeCreated(1))
  allocation()
  H.handleDisputeAccepted(F.HDisputeAccepted(2))
  assert.entityCount('UnresolvedHorizonIndexingDisputeCreatedEvent', 1)
  assert.entityCount('HorizonIndexingDisputeCreatedEvent', 0)
  assert.entityCount('ProvisionDisputeAcceptedEvent', 1)
})

test('allocation context from a different indexer is not attributed to a dispute', () => {
  rememberAllocation(Old.ALLOCATION, Old.OPERATOR, Old.DEPLOYMENT.toHexString())
  D.handleIndexingDisputeCreated(F.DIndexingDisputeCreated(1))
  assert.entityCount('UnresolvedIndexingDisputeCreatedEvent', 1)
  assert.fieldEquals('CounterEntity', '0', 'subgraphDeploymentEventCount', '0')
})

test('query creation retains raw attestation and ambiguous trailing ABI values without guessing units', () => {
  H.handleQueryDisputeCreated(F.HQueryDisputeCreated())
  assert.fieldEquals(
    'HorizonQueryDisputeCreatedEvent',
    activityId(F.HQueryDisputeCreated()),
    'attestation',
    Old.HASH.toHexString(),
  )
  assert.fieldEquals(
    'HorizonQueryDisputeCreatedEvent',
    activityId(F.HQueryDisputeCreated()),
    'queryContextValues',
    '[500, 1000]',
  )
})

test('linked disputes create two idempotent observations with their own indexer/deployment feeds', () => {
  D.handleQueryDisputeCreated(F.DQueryDisputeCreated(1))
  let second = F.DQueryDisputeCreated(2)
  second.parameters[0].value = ethereum.Value.fromFixedBytes(F.SECOND_DISPUTE_ID)
  second.parameters[1].value = ethereum.Value.fromAddress(Old.OPERATOR)
  D.handleQueryDisputeCreated(second)
  let link = F.DDisputeLinked(3)
  D.handleDisputeLinked(link)
  D.handleDisputeLinked(link)
  assert.entityCount('DeploymentDisputeLinkedEvent', 2)
  assert.fieldEquals(
    'DeploymentDisputeLinkedEvent',
    activityId(link) + '-0',
    'indexer',
    Old.INDEXER.toHexString(),
  )
  assert.fieldEquals(
    'DeploymentDisputeLinkedEvent',
    activityId(link) + '-1',
    'indexer',
    Old.OPERATOR.toHexString(),
  )
  assert.fieldEquals(
    'ActivityDispute',
    contextId(false),
    'linkedDispute',
    contextId(false, F.SECOND_DISPUTE_ID),
  )
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '4')
})

test('linked Horizon disputes select provision variants with and without deployment context', () => {
  H.handleQueryDisputeCreated(F.HQueryDisputeCreated(1))
  let second = F.HIndexingDisputeCreated(2)
  second.parameters[0].value = ethereum.Value.fromFixedBytes(F.SECOND_DISPUTE_ID)
  H.handleIndexingDisputeCreated(second)
  H.handleDisputeLinked(F.HDisputeLinked(3))
  assert.entityCount('ProvisionDisputeLinkedEvent', 1)
  assert.entityCount('UnresolvedProvisionDisputeLinkedEvent', 1)
})

test('a link can mix known participants with a wholly missing dispute', () => {
  D.handleDisputeAccepted(F.DDisputeAccepted(1))
  D.handleDisputeLinked(F.DDisputeLinked(2))
  assert.entityCount('IndexerDisputeLinkedEvent', 1)
  assert.entityCount('DisputeLinkedEvent', 1)
  assert.fieldEquals('DisputeLinkedEvent', activityId(F.DDisputeLinked(2)) + '-1', 'accounts', '[]')
})

test('accepted disputes correlate provision/pool losses without replacing slash activity', () => {
  H.handleQueryDisputeCreated(F.HQueryDisputeCreated(1))
  let slash = Old.HProvisionSlashed(2)
  slash.address = Address.fromString(addresses.staking)
  slash.parameters[1].value = ethereum.Value.fromAddress(F.service())
  let pool = Old.HDelegationSlashed(3)
  pool.address = slash.address
  pool.parameters[1].value = ethereum.Value.fromAddress(F.service())
  handleProvisionSlashed(slash)
  handleDelegationSlashed(pool)
  let accepted = F.HDisputeAccepted(4)
  accepted.receipt!.logs = [
    F.asLog(slash, 'ProvisionSlashed(address,address,uint256)', [0, 1]),
    F.asLog(pool, 'DelegationSlashed(address,address,uint256)', [0, 1]),
  ]
  H.handleDisputeAccepted(accepted)
  assert.fieldEquals(
    'ProvisionDisputeAcceptedEvent',
    activityId(accepted),
    'slashEventIds',
    '[' + activityId(slash) + ', ' + activityId(pool) + ']',
  )
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '4')
  let later = F.HDisputeAccepted(5)
  later.receipt!.logs = [
    accepted.receipt!.logs[0],
    accepted.receipt!.logs[1],
    F.HDisputeAcceptedReceipt(accepted),
  ]
  H.handleDisputeAccepted(later)
  assert.fieldEquals('ProvisionDisputeAcceptedEvent', activityId(later), 'slashEventIds', '[]')
})

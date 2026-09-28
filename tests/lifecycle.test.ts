import { assertAllCounters } from './counterAssertions'
import { BigInt, Bytes, ByteArray, crypto, ethereum, store } from '@graphprotocol/graph-ts'
import { assert, test, afterEach, clearStore } from 'matchstick-as/assembly/index'
import { addresses } from '../config/addresses'
import { activityId } from '../src/mappings/activity'
import * as H from '../src/mappings/horizonStaking'
import * as S from '../src/mappings/subgraphService'
import * as R from '../src/mappings/rewardsManager'
import * as F from './fixtures'
import { AllocationCreated as LegacyAllocationCreated } from '../src/types/Staking/Staking'
import { handleAllocationCreated as handleLegacyAllocationCreated } from '../src/mappings/staking'

afterEach(() => {
  assertAllCounters()
  clearStore()
})

test('legacy and transition reward assignments join the deployment interface when context exists', () => {
  let allocation = F.eventWith<LegacyAllocationCreated>([
    new ethereum.EventParam('indexer', ethereum.Value.fromAddress(F.INDEXER)),
    new ethereum.EventParam('subgraphDeploymentID', ethereum.Value.fromFixedBytes(F.DEPLOYMENT)),
    new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    new ethereum.EventParam('epoch', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(99))),
    new ethereum.EventParam('allocationID', ethereum.Value.fromAddress(F.ALLOCATION)),
    new ethereum.EventParam('metadata', ethereum.Value.fromFixedBytes(F.HASH)),
  ])
  handleLegacyAllocationCreated(allocation)
  R.handleRewardsAssigned(F.RRewardsAssigned(2))
  R.handleHorizonRewardsAssigned(F.RHorizonRewardsAssigned(3))
  assert.entityCount('IndexingRewardsAssignedEvent', 2)
  assert.entityCount('UnresolvedIndexingRewardsAssignedEvent', 0)
  assert.fieldEquals(
    'IndexingRewardsAssignedEvent',
    activityId(F.RRewardsAssigned(2)),
    'deployment',
    F.DEPLOYMENT.toHexString(),
  )
  assert.fieldEquals(
    'IndexingRewardsAssignedEvent',
    activityId(F.RHorizonRewardsAssigned(3)),
    'horizon',
    'true',
  )
  assert.fieldEquals('CounterEntity', '0', 'subgraphDeploymentEventCount', '3')
})

test('registration decodes service details while retaining the original bytes', () => {
  let tuple = new ethereum.Tuple()
  tuple.push(ethereum.Value.fromString('https://indexer.example'))
  tuple.push(ethereum.Value.fromString('u4pruyd'))
  tuple.push(ethereum.Value.fromAddress(F.OPERATOR))
  let encoded = ethereum.encode(ethereum.Value.fromTuple(tuple))!
  let raw = Bytes.fromUint8Array(encoded.subarray(32))
  let event = F.SServiceProviderRegistered()
  event.parameters[1] = new ethereum.EventParam('data', ethereum.Value.fromBytes(raw))
  S.handleServiceProviderRegistered(event)
  assert.fieldEquals(
    'ServiceProviderRegisteredEvent',
    activityId(event),
    'url',
    'https://indexer.example',
  )
  assert.fieldEquals('ServiceProviderRegisteredEvent', activityId(event), 'geoHash', 'u4pruyd')
  assert.fieldEquals(
    'ServiceProviderRegisteredEvent',
    activityId(event),
    'rewardsDestination',
    F.OPERATOR.toHexString(),
  )
  assert.fieldEquals('ServiceProviderRegisteredEvent', activityId(event), 'data', raw.toHexString())
})

test('one indexer and delegator have separate provisions and delegation identities across services', () => {
  let first = F.HTokensDelegated(1)
  let second = F.HTokensDelegated(2)
  second.parameters[1] = new ethereum.EventParam('verifier', ethereum.Value.fromAddress(F.OPERATOR))
  H.handleTokensDelegated(first)
  H.handleTokensDelegated(second)
  let p1 = F.INDEXER.toHexString() + '-' + F.SERVICE.toHexString()
  let p2 = F.INDEXER.toHexString() + '-' + F.OPERATOR.toHexString()
  assert.entityCount('Indexer', 1)
  assert.entityCount('Delegator', 1)
  assert.entityCount('Provision', 2)
  assert.entityCount('ProvisionDelegation', 2)
  assert.fieldEquals('TokensDelegatedEvent', activityId(first), 'provision', p1)
  assert.fieldEquals('TokensDelegatedEvent', activityId(second), 'provision', p2)
  assert.fieldEquals('TokensDelegatedEvent', activityId(first), 'tokenAmount', '100')
  assert.fieldEquals('TokensDelegatedEvent', activityId(first), 'shareAmount', '5')
  assert.fieldEquals(
    'ProvisionDelegation',
    F.DELEGATOR.toHexString() + '-' + p1,
    'delegator',
    F.DELEGATOR.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '2')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '2')
  assert.fieldEquals('CounterEntity', '0', 'delegatorEventCount', '2')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '2')
  // Each event involves two accounts but is counted only once in that interface.
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '2')
})

test('global own stake does not manufacture a provision and duplicate saves do not inflate counts', () => {
  let event = F.HHorizonStakeDeposited()
  H.handleHorizonStakeDeposited(event)
  H.handleHorizonStakeDeposited(event)
  assert.entityCount('Provision', 0)
  assert.fieldEquals('IndexerStakeDepositedEvent', activityId(event), 'horizon', 'true')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '0')
})

test('multiple thaw requests retain ownership, validity, shares and timestamp independently', () => {
  let first = F.HThawRequestCreated(1)
  let second = F.HThawRequestCreated(2)
  let otherId = Bytes.fromHexString(
    '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  )
  second.parameters[6] = new ethereum.EventParam(
    'thawRequestId',
    ethereum.Value.fromFixedBytes(otherId),
  )
  H.handleThawRequestCreated(first)
  H.handleThawRequestCreated(second)
  let fulfilled = F.HThawRequestFulfilled(3)
  fulfilled.parameters[5] = new ethereum.EventParam('valid', ethereum.Value.fromBoolean(false))
  H.handleThawRequestFulfilled(fulfilled)
  assert.entityCount('ActivityThawRequest', 2)
  assert.entityCount('DelegationThawRequestCreatedEvent', 2)
  assert.entityCount('DelegationThawRequestFulfilledEvent', 1)
  assert.fieldEquals(
    'DelegationThawRequestFulfilledEvent',
    activityId(fulfilled),
    'owner',
    F.DELEGATOR.toHexString(),
  )
  assert.fieldEquals('DelegationThawRequestFulfilledEvent', activityId(fulfilled), 'valid', 'false')
  assert.fieldEquals(
    'DelegationThawRequestFulfilledEvent',
    activityId(fulfilled),
    'thawingUntilTimestamp',
    '1600',
  )
  assert.fieldEquals('CounterEntity', '0', 'delegatorEventCount', '3')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '3')
})

test('provision thaw requests do not imply a delegator and are namespaced by staking contract', () => {
  let created = F.HThawRequestCreated(1)
  created.parameters[0] = new ethereum.EventParam('requestType', ethereum.Value.fromI32(0))
  H.handleThawRequestCreated(created)
  let fulfilled = F.HThawRequestFulfilled(2)
  fulfilled.parameters[0] = new ethereum.EventParam('requestType', ethereum.Value.fromI32(0))
  H.handleThawRequestFulfilled(fulfilled)
  let unrelated = F.HThawRequestFulfilled(3)
  unrelated.parameters[0] = new ethereum.EventParam('requestType', ethereum.Value.fromI32(0))
  unrelated.address = F.OPERATOR
  H.handleThawRequestFulfilled(unrelated)
  assert.entityCount('ProvisionThawRequestFulfilledEvent', 1)
  assert.entityCount('UnresolvedThawRequestFulfilledEvent', 1)
  assert.entityCount('Delegator', 0)
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '3')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '2')
  assert.fieldEquals('CounterEntity', '0', 'delegatorEventCount', '0')
})

test('fee cuts retain the raw delegator share and distinguish staged and applied terms', () => {
  H.handleDelegationFeeCutSet(F.HDelegationFeeCutSet(1))
  H.handleProvisionParametersStaged(F.HProvisionParametersStaged(2))
  H.handleProvisionParametersSet(F.HProvisionParametersSet(3))
  assert.fieldEquals(
    'DelegationFeeCutSetEvent',
    activityId(F.HDelegationFeeCutSet(1)),
    'delegatorFeeCut',
    '250000',
  )
  assert.fieldEquals(
    'DelegationFeeCutSetEvent',
    activityId(F.HDelegationFeeCutSet(1)),
    'paymentType',
    '2',
  )
  assert.fieldEquals(
    'ProvisionParametersStagedEvent',
    activityId(F.HProvisionParametersStaged(2)),
    'thawingPeriodSeconds',
    '600',
  )
  assert.fieldEquals('CounterEntity', '0', 'provisionParametersStagedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionParametersSetEventCount', '1')
})

test('pool additions and slashes are separate facts without fabricated delegator earnings', () => {
  H.handleTokensToDelegationPoolAdded(F.HTokensToDelegationPoolAdded(1))
  H.handleProvisionSlashed(F.HProvisionSlashed(2))
  H.handleDelegationSlashed(F.HDelegationSlashed(3))
  assert.entityCount('Delegator', 0)
  assert.fieldEquals('CounterEntity', '0', 'delegatorEventCount', '0')
  assert.fieldEquals('CounterEntity', '0', 'indexingRewardsCollectedEventCount', '0')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '3')
})

test('allocation create, resize and forced close preserve their own payloads', () => {
  let created = F.SAllocationCreated(1)
  let resized = F.SAllocationResized(2)
  let closed = F.SAllocationClosed(3)
  S.handleAllocationCreated(created)
  S.handleAllocationResized(resized)
  S.handleAllocationClosed(closed)
  assert.fieldEquals('HorizonAllocationCreatedEvent', activityId(created), 'allocatedAmount', '100')
  assert.fieldEquals('AllocationResizedEvent', activityId(resized), 'oldTokens', '100')
  assert.fieldEquals('AllocationResizedEvent', activityId(resized), 'newTokens', '200')
  assert.fieldEquals('HorizonAllocationClosedEvent', activityId(closed), 'forceClosed', 'true')
  assert.fieldEquals(
    'ActivityAllocation',
    F.ALLOCATION.toHexString(),
    'deployment',
    F.DEPLOYMENT.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'subgraphDeploymentEventCount', '3')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '3')
})

test('POI is retained without any reward collection and preserves unknown conditions', () => {
  let event = F.SPOIPresented()
  S.handlePOIPresented(event)
  assert.fieldEquals('POIPresentedEvent', activityId(event), 'condition', F.HASH.toHexString())
  assert.fieldEquals('CounterEntity', '0', 'poiPresentedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexingRewardsCollectedEventCount', '0')
})

function rewardLog(): ethereum.Log {
  let signature = Bytes.fromByteArray(
    crypto.keccak256(
      ByteArray.fromUTF8(
        'IndexingRewardsCollected(address,address,bytes32,uint256,uint256,uint256,bytes32,bytes,uint256)',
      ),
    ),
  )
  let topics = [
    signature,
    Bytes.fromHexString('0x000000000000000000000000' + F.INDEXER.toHexString().slice(2)),
    Bytes.fromHexString('0x000000000000000000000000' + F.ALLOCATION.toHexString().slice(2)),
    F.DEPLOYMENT,
  ]
  return new ethereum.Log(
    F.SERVICE,
    topics,
    Bytes.fromHexString('0x0000000000000000000000000000000000000000000000000000000000000064'),
    F.HASH,
    F.HASH,
    F.HASH,
    BigInt.fromI32(0),
    BigInt.fromI32(2),
    BigInt.fromI32(2),
    '',
    null,
  )
}

test('receipt correlation selects service rewards without requiring allocation history', () => {
  let configuredService = addresses.subgraphService
  addresses.subgraphService = F.SERVICE.toHexString()
  let assignment = F.RHorizonRewardsAssigned(1)
  assignment.receipt!.logs = [rewardLog()]
  R.handleHorizonRewardsAssigned(assignment)
  S.handleIndexingRewardsCollected(F.SIndexingRewardsCollected(2))
  assert.entityCount('UnresolvedIndexingRewardsAssignedEvent', 0)
  assert.entityCount('IndexingRewardsCollectedEvent', 1)
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals(
    'IndexingRewardsCollectedEvent',
    activityId(F.SIndexingRewardsCollected(2)),
    'tokensIndexerRewards',
    '75',
  )
  assert.fieldEquals(
    'IndexingRewardsCollectedEvent',
    activityId(F.SIndexingRewardsCollected(2)),
    'tokensDelegationRewards',
    '25',
  )
  addresses.subgraphService = configuredService
})

test('other allocations or emitters in the receipt do not suppress a reward assignment', () => {
  let configuredService = addresses.subgraphService
  addresses.subgraphService = F.SERVICE.toHexString()
  let assignment = F.RHorizonRewardsAssigned(1)
  let unrelated = rewardLog()
  unrelated.address = F.OPERATOR
  assignment.receipt!.logs = [unrelated]
  R.handleHorizonRewardsAssigned(assignment)
  let second = F.RHorizonRewardsAssigned(2)
  unrelated = rewardLog()
  unrelated.topics[2] = F.HASH
  second.receipt!.logs = [unrelated]
  R.handleHorizonRewardsAssigned(second)
  assert.entityCount('UnresolvedIndexingRewardsAssignedEvent', 2)
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '2')
  addresses.subgraphService = configuredService
})

test('a different amount or an earlier collection for the same allocation does not hide rewards', () => {
  let configuredService = addresses.subgraphService
  addresses.subgraphService = F.SERVICE.toHexString()
  let assignment = F.RHorizonRewardsAssigned(1)
  let unrelated = rewardLog()
  unrelated.data = Bytes.fromHexString(
    '0x0000000000000000000000000000000000000000000000000000000000000065',
  )
  assignment.receipt!.logs = [unrelated]
  R.handleHorizonRewardsAssigned(assignment)
  let laterAssignment = F.RHorizonRewardsAssigned(3)
  laterAssignment.receipt!.logs = [rewardLog()]
  R.handleHorizonRewardsAssigned(laterAssignment)
  assert.entityCount('UnresolvedIndexingRewardsAssignedEvent', 2)
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '2')
  addresses.subgraphService = configuredService
})

test('malformed registration retains raw data and fee collection attributes the payer', () => {
  let registered = F.SServiceProviderRegistered(1)
  S.handleServiceProviderRegistered(registered)
  assert.fieldEquals('ServiceProviderRegisteredEvent', activityId(registered), 'data', '0x1234')
  assert.assertNull(store.get('ServiceProviderRegisteredEvent', activityId(registered))!.get('url'))
  let fees = F.SQueryFeesCollected(2)
  S.handleQueryFeesCollected(fees)
  assert.fieldEquals('QueryFeesCollectedEvent', activityId(fees), 'payer', F.PAYER.toHexString())
  assert.fieldEquals('QueryFeesCollectedEvent', activityId(fees), 'tokensCurators', '10')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '2')
})

test('repeated reward correlation never mutates receipt data or creates duplicate earnings', () => {
  let configuredService = addresses.subgraphService
  addresses.subgraphService = F.SERVICE.toHexString()
  let assignment = F.RHorizonRewardsAssigned(1)
  let collection = rewardLog()
  let original = collection.data.toHexString()
  assignment.receipt!.logs = [collection]
  R.handleHorizonRewardsAssigned(assignment)
  R.handleHorizonRewardsAssigned(assignment)
  assert.stringEquals(collection.data.toHexString(), original)
  assert.entityCount('UnresolvedIndexingRewardsAssignedEvent', 0)
  addresses.subgraphService = configuredService
})

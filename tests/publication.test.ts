import { assertAllCounters } from './counterAssertions'
import { BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { assert, test, afterEach, clearStore } from 'matchstick-as/assembly/index'
import {
  SubgraphPublished,
  SubgraphPublished1,
  SubgraphVersionUpdated,
  SubgraphMetadataUpdated,
  SubgraphUpgraded,
} from '../src/types/GNS/GNS'
import {
  handleSubgraphPublished,
  handleSubgraphPublishedV2,
  handleSubgraphVersionUpdated,
  handleSubgraphMetadataUpdated,
  handleSubgraphUpgraded,
} from '../src/mappings/gns'
import { convertBigIntSubgraphIDToBase58, getSubgraphID } from '../src/mappings/helpers'
import { activityId } from '../src/mappings/activity'
import { addresses } from '../config/addresses'
import * as F from './fixtures'

afterEach(() => {
  assertAllCounters()
  clearStore()
})

function publishedV2(logIndex: i32): SubgraphPublished1 {
  return F.eventWith<SubgraphPublished1>(
    [
      new ethereum.EventParam('subgraphID', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123))),
      new ethereum.EventParam('subgraphDeploymentID', ethereum.Value.fromFixedBytes(F.DEPLOYMENT)),
      new ethereum.EventParam(
        'reserveRatio',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000)),
      ),
    ],
    logIndex,
  )
}

function version(logIndex: i32, deployment: Bytes = F.DEPLOYMENT): SubgraphVersionUpdated {
  return F.eventWith<SubgraphVersionUpdated>(
    [
      new ethereum.EventParam('subgraphID', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123))),
      new ethereum.EventParam('subgraphDeploymentID', ethereum.Value.fromFixedBytes(deployment)),
      new ethereum.EventParam('versionMetadata', ethereum.Value.fromFixedBytes(F.HASH)),
    ],
    logIndex,
  )
}

function legacyPublished(logIndex: i32): SubgraphPublished {
  return F.eventWith<SubgraphPublished>(
    [
      new ethereum.EventParam('graphAccount', ethereum.Value.fromAddress(F.INDEXER)),
      new ethereum.EventParam(
        'subgraphNumber',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)),
      ),
      new ethereum.EventParam('subgraphDeploymentID', ethereum.Value.fromFixedBytes(F.DEPLOYMENT)),
      new ethereum.EventParam('versionMetadata', ethereum.Value.fromFixedBytes(F.HASH)),
    ],
    logIndex,
  )
}

test('v2 initial publication and later versions retain distinct IDs and exact per-interface counts', () => {
  handleSubgraphPublishedV2(publishedV2(1))
  handleSubgraphVersionUpdated(version(2))
  let laterDeployment = Bytes.fromHexString(
    '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
  )
  handleSubgraphVersionUpdated(version(3, laterDeployment))
  let subgraph = convertBigIntSubgraphIDToBase58(BigInt.fromI32(123))
  assert.entityCount('SubgraphVersion', 2)
  assert.fieldEquals('SubgraphVersion', subgraph + '-0', 'version', '0')
  assert.fieldEquals(
    'SubgraphVersion',
    subgraph + '-0',
    'subgraphDeployment',
    F.DEPLOYMENT.toHexString(),
  )
  assert.fieldEquals('SubgraphVersion', subgraph + '-1', 'version', '1')
  assert.fieldEquals(
    'SubgraphVersion',
    subgraph + '-1',
    'subgraphDeployment',
    laterDeployment.toHexString(),
  )
  assert.fieldEquals('Subgraph', subgraph, 'versionCount', '2')
  assert.fieldEquals('Subgraph', subgraph, 'currentVersion', subgraph + '-1')
  assert.entityCount('NewSubgraphPublishedEvent', 1)
  assert.entityCount('NewSubgraphVersionPublishedEvent', 1)
  assert.entityCount('SubgraphVersionMetadataUpdatedEvent', 2)
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '4')
  assert.fieldEquals('CounterEntity', '0', 'subgraphEventCount', '4')
  assert.fieldEquals('CounterEntity', '0', 'subgraphDeploymentEventCount', '4')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '4')
  assert.fieldEquals('CounterEntity', '0', 'newSubgraphPublishedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'newSubgraphVersionPublishedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'subgraphVersionMetadataUpdatedEventCount', '2')
})

test('a version update indexed alone still records publication and metadata', () => {
  handleSubgraphVersionUpdated(version(1))
  assert.entityCount('NewSubgraphVersionPublishedEvent', 1)
  assert.entityCount('SubgraphVersionMetadataUpdatedEvent', 1)
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '2')
})

test('missing initial version metadata cannot suppress publication in a later transaction', () => {
  handleSubgraphPublishedV2(publishedV2(1))
  let later = version(2)
  later.transaction.hash = F.DEPLOYMENT
  handleSubgraphVersionUpdated(later)
  assert.entityCount('SubgraphVersion', 2)
  assert.entityCount('NewSubgraphVersionPublishedEvent', 1)
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '3')
})

test('legacy first publish and subsequent versions use the correct concrete types and typename', () => {
  let first = legacyPublished(1)
  let second = legacyPublished(2)
  handleSubgraphPublished(first)
  handleSubgraphPublished(second)
  let subgraph = convertBigIntSubgraphIDToBase58(
    getSubgraphID(F.INDEXER.toHexString(), BigInt.fromI32(1)),
  )
  assert.entityCount('NewSubgraphPublishedEvent', 1)
  assert.entityCount('NewSubgraphVersionPublishedEvent', 1)
  assert.fieldEquals(
    'NewSubgraphPublishedEvent',
    activityId(first),
    'typename',
    'NewSubgraphPublishedEvent',
  )
  assert.fieldEquals(
    'NewSubgraphVersionPublishedEvent',
    activityId(second),
    'typename',
    'NewSubgraphVersionPublishedEvent',
  )
  assert.fieldEquals('SubgraphVersion', subgraph + '-1', 'version', '1')
  assert.fieldEquals('CounterEntity', '0', 'newSubgraphPublishedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'newSubgraphVersionPublishedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '2')
})

test('legacy subgraph metadata counts the subgraph interface, not the indexer interface', () => {
  let event = F.eventWith<SubgraphMetadataUpdated>([
    new ethereum.EventParam('graphAccount', ethereum.Value.fromAddress(F.INDEXER)),
    new ethereum.EventParam('subgraphNumber', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))),
    new ethereum.EventParam('subgraphMetadata', ethereum.Value.fromFixedBytes(F.HASH)),
  ])
  handleSubgraphMetadataUpdated(event)
  assert.fieldEquals('CounterEntity', '0', 'subgraphMetadataUpdatedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'subgraphEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '0')
})

test('curated upgrade records signal movement without creating a duplicate published version', () => {
  let wasL1 = addresses.isL1
  addresses.isL1 = false
  let event = F.eventWith<SubgraphUpgraded>([
    new ethereum.EventParam('subgraphID', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(123))),
    new ethereum.EventParam(
      'vSignalCreated',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(50)),
    ),
    new ethereum.EventParam(
      'tokensSignalled',
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100)),
    ),
    new ethereum.EventParam('subgraphDeploymentID', ethereum.Value.fromFixedBytes(F.DEPLOYMENT)),
  ])
  handleSubgraphUpgraded(event)
  assert.fieldEquals('SubgraphUpgradedEvent', activityId(event), 'newVersionSignal', '50')
  assert.fieldEquals('SubgraphUpgradedEvent', activityId(event), 'tokensSignalled', '100')
  assert.entityCount('SubgraphVersion', 0)
  assert.fieldEquals('CounterEntity', '0', 'subgraphUpgradedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'newSubgraphVersionPublishedEventCount', '0')
  addresses.isL1 = wasL1
})

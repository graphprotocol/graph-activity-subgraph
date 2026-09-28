import { assertAllCounters } from './counterAssertions'
import { assert, test, afterEach, clearStore } from 'matchstick-as/assembly/index'
import { activityId } from '../src/mappings/activity'
import * as H from '../src/mappings/horizonStaking'
import * as S from '../src/mappings/subgraphService'
import * as R from '../src/mappings/rewardsManager'
import * as F from './fixtures'

afterEach(() => {
  assertAllCounters()
  clearStore()
})

test('HorizonStaking.ProvisionCreated records activity without earlier history', () => {
  let event = F.HProvisionCreated()
  H.handleProvisionCreated(event)
  assert.entityCount('ProvisionCreatedEvent', 1)
  assert.fieldEquals(
    'ProvisionCreatedEvent',
    activityId(event),
    'typename',
    'ProvisionCreatedEvent',
  )
  assert.fieldEquals(
    'ProvisionCreatedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'provisionCreatedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('HorizonStaking.ProvisionIncreased records activity without earlier history', () => {
  let event = F.HProvisionIncreased()
  H.handleProvisionIncreased(event)
  assert.entityCount('ProvisionIncreasedEvent', 1)
  assert.fieldEquals(
    'ProvisionIncreasedEvent',
    activityId(event),
    'typename',
    'ProvisionIncreasedEvent',
  )
  assert.fieldEquals(
    'ProvisionIncreasedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'provisionIncreasedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('HorizonStaking.ProvisionThawed records activity without earlier history', () => {
  let event = F.HProvisionThawed()
  H.handleProvisionThawed(event)
  assert.entityCount('ProvisionThawedEvent', 1)
  assert.fieldEquals('ProvisionThawedEvent', activityId(event), 'typename', 'ProvisionThawedEvent')
  assert.fieldEquals(
    'ProvisionThawedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'provisionThawedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('HorizonStaking.TokensDeprovisioned records activity without earlier history', () => {
  let event = F.HTokensDeprovisioned()
  H.handleTokensDeprovisioned(event)
  assert.entityCount('TokensDeprovisionedEvent', 1)
  assert.fieldEquals(
    'TokensDeprovisionedEvent',
    activityId(event),
    'typename',
    'TokensDeprovisionedEvent',
  )
  assert.fieldEquals(
    'TokensDeprovisionedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'tokensDeprovisionedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('HorizonStaking.ProvisionSlashed records activity without earlier history', () => {
  let event = F.HProvisionSlashed()
  H.handleProvisionSlashed(event)
  assert.entityCount('ProvisionSlashedEvent', 1)
  assert.fieldEquals(
    'ProvisionSlashedEvent',
    activityId(event),
    'typename',
    'ProvisionSlashedEvent',
  )
  assert.fieldEquals(
    'ProvisionSlashedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'provisionSlashedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('HorizonStaking.DelegationSlashed records activity without earlier history', () => {
  let event = F.HDelegationSlashed()
  H.handleDelegationSlashed(event)
  assert.entityCount('DelegationSlashedEvent', 1)
  assert.fieldEquals(
    'DelegationSlashedEvent',
    activityId(event),
    'typename',
    'DelegationSlashedEvent',
  )
  assert.fieldEquals(
    'DelegationSlashedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'delegationSlashedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('HorizonStaking.ProvisionParametersSet records activity without earlier history', () => {
  let event = F.HProvisionParametersSet()
  H.handleProvisionParametersSet(event)
  assert.entityCount('ProvisionParametersSetEvent', 1)
  assert.fieldEquals(
    'ProvisionParametersSetEvent',
    activityId(event),
    'typename',
    'ProvisionParametersSetEvent',
  )
  assert.fieldEquals(
    'ProvisionParametersSetEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'provisionParametersSetEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('HorizonStaking.ProvisionParametersStaged records activity without earlier history', () => {
  let event = F.HProvisionParametersStaged()
  H.handleProvisionParametersStaged(event)
  assert.entityCount('ProvisionParametersStagedEvent', 1)
  assert.fieldEquals(
    'ProvisionParametersStagedEvent',
    activityId(event),
    'typename',
    'ProvisionParametersStagedEvent',
  )
  assert.fieldEquals(
    'ProvisionParametersStagedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'provisionParametersStagedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('HorizonStaking.DelegationFeeCutSet records activity without earlier history', () => {
  let event = F.HDelegationFeeCutSet()
  H.handleDelegationFeeCutSet(event)
  assert.entityCount('DelegationFeeCutSetEvent', 1)
  assert.fieldEquals(
    'DelegationFeeCutSetEvent',
    activityId(event),
    'typename',
    'DelegationFeeCutSetEvent',
  )
  assert.fieldEquals(
    'DelegationFeeCutSetEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'delegationFeeCutSetEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('HorizonStaking.OperatorSet records activity without earlier history', () => {
  let event = F.HOperatorSet()
  H.handleOperatorSet(event)
  assert.entityCount('ProvisionOperatorSetEvent', 1)
  assert.fieldEquals(
    'ProvisionOperatorSetEvent',
    activityId(event),
    'typename',
    'ProvisionOperatorSetEvent',
  )
  assert.fieldEquals(
    'ProvisionOperatorSetEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'provisionOperatorSetEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('HorizonStaking.TokensToDelegationPoolAdded records activity without earlier history', () => {
  let event = F.HTokensToDelegationPoolAdded()
  H.handleTokensToDelegationPoolAdded(event)
  assert.entityCount('TokensToDelegationPoolAddedEvent', 1)
  assert.fieldEquals(
    'TokensToDelegationPoolAddedEvent',
    activityId(event),
    'typename',
    'TokensToDelegationPoolAddedEvent',
  )
  assert.fieldEquals(
    'TokensToDelegationPoolAddedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'tokensToDelegationPoolAddedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('HorizonStaking.TokensDelegated records activity without earlier history', () => {
  let event = F.HTokensDelegated()
  H.handleTokensDelegated(event)
  assert.entityCount('TokensDelegatedEvent', 1)
  assert.fieldEquals('TokensDelegatedEvent', activityId(event), 'typename', 'TokensDelegatedEvent')
  assert.fieldEquals(
    'TokensDelegatedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'tokensDelegatedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'delegatorEventCount', '1')
})

test('HorizonStaking.TokensUndelegated records activity without earlier history', () => {
  let event = F.HTokensUndelegated()
  H.handleTokensUndelegated(event)
  assert.entityCount('TokensUndelegatedEvent', 1)
  assert.fieldEquals(
    'TokensUndelegatedEvent',
    activityId(event),
    'typename',
    'TokensUndelegatedEvent',
  )
  assert.fieldEquals(
    'TokensUndelegatedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'tokensUndelegatedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'delegatorEventCount', '1')
})

test('HorizonStaking.DelegatedTokensWithdrawn records activity without earlier history', () => {
  let event = F.HDelegatedTokensWithdrawn()
  H.handleDelegatedTokensWithdrawn(event)
  assert.entityCount('DelegatedTokensWithdrawnEvent', 1)
  assert.fieldEquals(
    'DelegatedTokensWithdrawnEvent',
    activityId(event),
    'typename',
    'DelegatedTokensWithdrawnEvent',
  )
  assert.fieldEquals(
    'DelegatedTokensWithdrawnEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'delegatedTokensWithdrawnEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'delegatorEventCount', '1')
})

test('HorizonStaking.HorizonStakeDeposited records activity without earlier history', () => {
  let event = F.HHorizonStakeDeposited()
  H.handleHorizonStakeDeposited(event)
  assert.entityCount('IndexerStakeDepositedEvent', 1)
  assert.fieldEquals(
    'IndexerStakeDepositedEvent',
    activityId(event),
    'typename',
    'IndexerStakeDepositedEvent',
  )
  assert.fieldEquals(
    'IndexerStakeDepositedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'indexerStakeDepositedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
})

test('HorizonStaking.HorizonStakeLocked records activity without earlier history', () => {
  let event = F.HHorizonStakeLocked()
  H.handleHorizonStakeLocked(event)
  assert.entityCount('IndexerStakeLockedEvent', 1)
  assert.fieldEquals(
    'IndexerStakeLockedEvent',
    activityId(event),
    'typename',
    'IndexerStakeLockedEvent',
  )
  assert.fieldEquals(
    'IndexerStakeLockedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'indexerStakeLockedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
})

test('HorizonStaking.HorizonStakeWithdrawn records activity without earlier history', () => {
  let event = F.HHorizonStakeWithdrawn()
  H.handleHorizonStakeWithdrawn(event)
  assert.entityCount('IndexerStakeWithdrawnEvent', 1)
  assert.fieldEquals(
    'IndexerStakeWithdrawnEvent',
    activityId(event),
    'typename',
    'IndexerStakeWithdrawnEvent',
  )
  assert.fieldEquals(
    'IndexerStakeWithdrawnEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'indexerStakeWithdrawnEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
})

test('HorizonStaking.ThawRequestCreated records activity without earlier history', () => {
  let event = F.HThawRequestCreated()
  H.handleThawRequestCreated(event)
  assert.entityCount('DelegationThawRequestCreatedEvent', 1)
  assert.fieldEquals(
    'DelegationThawRequestCreatedEvent',
    activityId(event),
    'typename',
    'DelegationThawRequestCreatedEvent',
  )
  assert.fieldEquals(
    'DelegationThawRequestCreatedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'delegationThawRequestCreatedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'delegatorEventCount', '1')
})

test('HorizonStaking.ThawRequestFulfilled records activity without earlier history', () => {
  let event = F.HThawRequestFulfilled()
  H.handleThawRequestFulfilled(event)
  assert.entityCount('UnresolvedThawRequestFulfilledEvent', 1)
  assert.fieldEquals(
    'UnresolvedThawRequestFulfilledEvent',
    activityId(event),
    'typename',
    'UnresolvedThawRequestFulfilledEvent',
  )
  assert.fieldEquals(
    'UnresolvedThawRequestFulfilledEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'unresolvedThawRequestFulfilledEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
})

test('SubgraphService.ServiceProviderRegistered records activity without earlier history', () => {
  let event = F.SServiceProviderRegistered()
  S.handleServiceProviderRegistered(event)
  assert.entityCount('ServiceProviderRegisteredEvent', 1)
  assert.fieldEquals(
    'ServiceProviderRegisteredEvent',
    activityId(event),
    'typename',
    'ServiceProviderRegisteredEvent',
  )
  assert.fieldEquals(
    'ServiceProviderRegisteredEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'serviceProviderRegisteredEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('SubgraphService.RewardsDestinationSet records activity without earlier history', () => {
  let event = F.SRewardsDestinationSet()
  S.handleRewardsDestinationSet(event)
  assert.entityCount('RewardsDestinationSetEvent', 1)
  assert.fieldEquals(
    'RewardsDestinationSetEvent',
    activityId(event),
    'typename',
    'RewardsDestinationSetEvent',
  )
  assert.fieldEquals(
    'RewardsDestinationSetEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'rewardsDestinationSetEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
})

test('SubgraphService.AllocationCreated records activity without earlier history', () => {
  let event = F.SAllocationCreated()
  S.handleAllocationCreated(event)
  assert.entityCount('HorizonAllocationCreatedEvent', 1)
  assert.fieldEquals(
    'HorizonAllocationCreatedEvent',
    activityId(event),
    'typename',
    'HorizonAllocationCreatedEvent',
  )
  assert.fieldEquals(
    'HorizonAllocationCreatedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'horizonAllocationCreatedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'subgraphDeploymentEventCount', '1')
})

test('SubgraphService.AllocationResized records activity without earlier history', () => {
  let event = F.SAllocationResized()
  S.handleAllocationResized(event)
  assert.entityCount('AllocationResizedEvent', 1)
  assert.fieldEquals(
    'AllocationResizedEvent',
    activityId(event),
    'typename',
    'AllocationResizedEvent',
  )
  assert.fieldEquals(
    'AllocationResizedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'allocationResizedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'subgraphDeploymentEventCount', '1')
})

test('SubgraphService.AllocationClosed records activity without earlier history', () => {
  let event = F.SAllocationClosed()
  S.handleAllocationClosed(event)
  assert.entityCount('HorizonAllocationClosedEvent', 1)
  assert.fieldEquals(
    'HorizonAllocationClosedEvent',
    activityId(event),
    'typename',
    'HorizonAllocationClosedEvent',
  )
  assert.fieldEquals(
    'HorizonAllocationClosedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'horizonAllocationClosedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'subgraphDeploymentEventCount', '1')
})

test('SubgraphService.IndexingRewardsCollected records activity without earlier history', () => {
  let event = F.SIndexingRewardsCollected()
  S.handleIndexingRewardsCollected(event)
  assert.entityCount('IndexingRewardsCollectedEvent', 1)
  assert.fieldEquals(
    'IndexingRewardsCollectedEvent',
    activityId(event),
    'typename',
    'IndexingRewardsCollectedEvent',
  )
  assert.fieldEquals(
    'IndexingRewardsCollectedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'indexingRewardsCollectedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'subgraphDeploymentEventCount', '1')
})

test('SubgraphService.POIPresented records activity without earlier history', () => {
  let event = F.SPOIPresented()
  S.handlePOIPresented(event)
  assert.entityCount('POIPresentedEvent', 1)
  assert.fieldEquals('POIPresentedEvent', activityId(event), 'typename', 'POIPresentedEvent')
  assert.fieldEquals(
    'POIPresentedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'poiPresentedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'subgraphDeploymentEventCount', '1')
})

test('SubgraphService.QueryFeesCollected records activity without earlier history', () => {
  let event = F.SQueryFeesCollected()
  S.handleQueryFeesCollected(event)
  assert.entityCount('QueryFeesCollectedEvent', 1)
  assert.fieldEquals(
    'QueryFeesCollectedEvent',
    activityId(event),
    'typename',
    'QueryFeesCollectedEvent',
  )
  assert.fieldEquals(
    'QueryFeesCollectedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'queryFeesCollectedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'provisionEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'dataServiceEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'subgraphDeploymentEventCount', '1')
})

test('RewardsManager.RewardsAssigned records activity without earlier history', () => {
  let event = F.RRewardsAssigned()
  R.handleRewardsAssigned(event)
  assert.entityCount('UnresolvedIndexingRewardsAssignedEvent', 1)
  assert.fieldEquals(
    'UnresolvedIndexingRewardsAssignedEvent',
    activityId(event),
    'typename',
    'UnresolvedIndexingRewardsAssignedEvent',
  )
  assert.fieldEquals(
    'UnresolvedIndexingRewardsAssignedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'unresolvedIndexingRewardsAssignedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
})

test('RewardsManager.HorizonRewardsAssigned records activity without earlier history', () => {
  let event = F.RHorizonRewardsAssigned()
  R.handleHorizonRewardsAssigned(event)
  assert.entityCount('UnresolvedIndexingRewardsAssignedEvent', 1)
  assert.fieldEquals(
    'UnresolvedIndexingRewardsAssignedEvent',
    activityId(event),
    'typename',
    'UnresolvedIndexingRewardsAssignedEvent',
  )
  assert.fieldEquals(
    'UnresolvedIndexingRewardsAssignedEvent',
    activityId(event),
    'contractAddress',
    event.address.toHexString(),
  )
  assert.fieldEquals('CounterEntity', '0', 'unresolvedIndexingRewardsAssignedEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'eventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'indexerEventCount', '1')
  assert.fieldEquals('CounterEntity', '0', 'graphAccountEventCount', '1')
})

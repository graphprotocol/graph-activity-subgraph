import { Address, Entity, Value } from '@graphprotocol/graph-ts'
import {
  ProvisionCreated,
  ProvisionIncreased,
  ProvisionThawed,
  TokensDeprovisioned,
  ProvisionSlashed,
  DelegationSlashed,
  ProvisionParametersSet,
  ProvisionParametersStaged,
  DelegationFeeCutSet,
  OperatorSet,
  TokensToDelegationPoolAdded,
  TokensDelegated,
  TokensUndelegated,
  DelegatedTokensWithdrawn,
  HorizonStakeDeposited,
  HorizonStakeLocked,
  HorizonStakeWithdrawn,
  ThawRequestCreated,
  ThawRequestFulfilled,
} from '../types/HorizonStaking/HorizonStaking'
import {
  ProvisionCreatedEvent,
  ProvisionIncreasedEvent,
  ProvisionThawedEvent,
  TokensDeprovisionedEvent,
  ProvisionSlashedEvent,
  DelegationSlashedEvent,
  ProvisionParametersSetEvent,
  ProvisionParametersStagedEvent,
  DelegationFeeCutSetEvent,
  ProvisionOperatorSetEvent,
  TokensToDelegationPoolAddedEvent,
  TokensDelegatedEvent,
  TokensUndelegatedEvent,
  DelegatedTokensWithdrawnEvent,
  IndexerStakeDepositedEvent,
  IndexerStakeLockedEvent,
  IndexerStakeWithdrawnEvent,
  ActivityThawRequest,
  ProvisionThawRequestCreatedEvent,
  DelegationThawRequestCreatedEvent,
  ProvisionThawRequestFulfilledEvent,
  DelegationThawRequestFulfilledEvent,
  UnresolvedThawRequestFulfilledEvent,
} from '../types/schema'
import { activityId, saveActivity, setProvision, setDelegator, addAccount } from './activity'

export function handleProvisionCreated(event: ProvisionCreated): void {
  let record = new ProvisionCreatedEvent(activityId(event))
  record.typename = 'ProvisionCreatedEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  record.tokens = event.params.tokens
  record.maxVerifierCut = event.params.maxVerifierCut.toI32()
  record.thawingPeriodSeconds = event.params.thawingPeriod
  saveActivity(record, event)
}

export function handleProvisionIncreased(event: ProvisionIncreased): void {
  let record = new ProvisionIncreasedEvent(activityId(event))
  record.typename = 'ProvisionIncreasedEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  record.tokens = event.params.tokens
  saveActivity(record, event)
}

export function handleProvisionThawed(event: ProvisionThawed): void {
  let record = new ProvisionThawedEvent(activityId(event))
  record.typename = 'ProvisionThawedEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  record.tokens = event.params.tokens
  saveActivity(record, event)
}

export function handleTokensDeprovisioned(event: TokensDeprovisioned): void {
  let record = new TokensDeprovisionedEvent(activityId(event))
  record.typename = 'TokensDeprovisionedEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  record.tokens = event.params.tokens
  saveActivity(record, event)
}

export function handleProvisionSlashed(event: ProvisionSlashed): void {
  let record = new ProvisionSlashedEvent(activityId(event))
  record.typename = 'ProvisionSlashedEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  record.tokens = event.params.tokens
  saveActivity(record, event)
}

export function handleDelegationSlashed(event: DelegationSlashed): void {
  let record = new DelegationSlashedEvent(activityId(event))
  record.typename = 'DelegationSlashedEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  record.tokens = event.params.tokens
  saveActivity(record, event)
}

export function handleProvisionParametersSet(event: ProvisionParametersSet): void {
  let record = new ProvisionParametersSetEvent(activityId(event))
  record.typename = 'ProvisionParametersSetEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  record.maxVerifierCut = event.params.maxVerifierCut.toI32()
  record.thawingPeriodSeconds = event.params.thawingPeriod
  saveActivity(record, event)
}

export function handleProvisionParametersStaged(event: ProvisionParametersStaged): void {
  let record = new ProvisionParametersStagedEvent(activityId(event))
  record.typename = 'ProvisionParametersStagedEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  record.maxVerifierCut = event.params.maxVerifierCut.toI32()
  record.thawingPeriodSeconds = event.params.thawingPeriod
  saveActivity(record, event)
}

export function handleDelegationFeeCutSet(event: DelegationFeeCutSet): void {
  let record = new DelegationFeeCutSetEvent(activityId(event))
  record.typename = 'DelegationFeeCutSetEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  record.paymentType = event.params.paymentType
  record.delegatorFeeCut = event.params.feeCut
  saveActivity(record, event)
}

export function handleOperatorSet(event: OperatorSet): void {
  let record = new ProvisionOperatorSetEvent(activityId(event))
  record.typename = 'ProvisionOperatorSetEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  addAccount(record, event.params.operator.toHexString())
  record.operator = event.params.operator
  record.allowed = event.params.allowed
  saveActivity(record, event)
}

export function handleTokensToDelegationPoolAdded(event: TokensToDelegationPoolAdded): void {
  let record = new TokensToDelegationPoolAddedEvent(activityId(event))
  record.typename = 'TokensToDelegationPoolAddedEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  record.tokens = event.params.tokens
  saveActivity(record, event)
}

export function handleTokensDelegated(event: TokensDelegated): void {
  let record = new TokensDelegatedEvent(activityId(event))
  record.typename = 'TokensDelegatedEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  setDelegator(record, event.params.delegator)
  record.tokenAmount = event.params.tokens
  record.shareAmount = event.params.shares
  saveActivity(record, event)
}

export function handleTokensUndelegated(event: TokensUndelegated): void {
  let record = new TokensUndelegatedEvent(activityId(event))
  record.typename = 'TokensUndelegatedEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  setDelegator(record, event.params.delegator)
  record.tokenAmount = event.params.tokens
  record.shareAmount = event.params.shares
  saveActivity(record, event)
}

export function handleDelegatedTokensWithdrawn(event: DelegatedTokensWithdrawn): void {
  let record = new DelegatedTokensWithdrawnEvent(activityId(event))
  record.typename = 'DelegatedTokensWithdrawnEvent'
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  setDelegator(record, event.params.delegator)
  record.tokenAmount = event.params.tokens
  saveActivity(record, event)
}

export function handleHorizonStakeDeposited(event: HorizonStakeDeposited): void {
  let record = new IndexerStakeDepositedEvent(activityId(event))
  record.typename = 'IndexerStakeDepositedEvent'
  record.indexer = event.params.serviceProvider.toHexString()
  record.accounts = [record.indexer]
  record.horizon = true
  record.amount = event.params.tokens
  saveActivity(record, event)
}

export function handleHorizonStakeLocked(event: HorizonStakeLocked): void {
  let record = new IndexerStakeLockedEvent(activityId(event))
  record.typename = 'IndexerStakeLockedEvent'
  record.indexer = event.params.serviceProvider.toHexString()
  record.accounts = [record.indexer]
  record.horizon = true
  record.amount = event.params.tokens
  record.lockedUntil = event.params.until
  saveActivity(record, event)
}

export function handleHorizonStakeWithdrawn(event: HorizonStakeWithdrawn): void {
  let record = new IndexerStakeWithdrawnEvent(activityId(event))
  record.typename = 'IndexerStakeWithdrawnEvent'
  record.indexer = event.params.serviceProvider.toHexString()
  record.accounts = [record.indexer]
  record.horizon = true
  record.amount = event.params.tokens
  saveActivity(record, event)
}

export function handleThawRequestCreated(event: ThawRequestCreated): void {
  let record: Entity
  if (event.params.requestType == 1) {
    record = new DelegationThawRequestCreatedEvent(activityId(event))
    record.set('typename', Value.fromString('DelegationThawRequestCreatedEvent'))
  } else {
    record = new ProvisionThawRequestCreatedEvent(activityId(event))
    record.set('typename', Value.fromString('ProvisionThawRequestCreatedEvent'))
  }
  setProvision(record, event.params.serviceProvider, event.params.verifier)
  if (event.params.requestType == 1) setDelegator(record, event.params.owner)
  addAccount(record, event.params.owner.toHexString())
  record.set('owner', Value.fromString(event.params.owner.toHexString()))
  record.set('requestId', Value.fromBytes(event.params.thawRequestId))
  record.set('requestType', Value.fromI32(event.params.requestType))
  record.set('shares', Value.fromBigInt(event.params.shares))
  record.set('thawingUntilTimestamp', Value.fromBigInt(event.params.thawingUntil))
  record.set('nonce', Value.fromBigInt(event.params.nonce))
  let request = new ActivityThawRequest(
    event.address.toHexString() +
      '-' +
      event.params.requestType.toString() +
      '-' +
      event.params.thawRequestId.toHexString(),
  )
  request.requestId = event.params.thawRequestId
  request.requestType = event.params.requestType
  request.owner = event.params.owner.toHexString()
  request.indexer = record.get('indexer')!.toString()
  request.provision = record.get('provision')!.toString()
  request.dataService = record.get('dataService')!.toString()
  request.save()
  saveActivity(record, event)
}

export function handleThawRequestFulfilled(event: ThawRequestFulfilled): void {
  let request = ActivityThawRequest.load(
    event.address.toHexString() +
      '-' +
      event.params.requestType.toString() +
      '-' +
      event.params.thawRequestId.toHexString(),
  )
  let record: Entity
  if (request == null) {
    record = new UnresolvedThawRequestFulfilledEvent(activityId(event))
    record.set('typename', Value.fromString('UnresolvedThawRequestFulfilledEvent'))
  } else {
    if (event.params.requestType == 1) {
      record = new DelegationThawRequestFulfilledEvent(activityId(event))
      record.set('typename', Value.fromString('DelegationThawRequestFulfilledEvent'))
    } else {
      record = new ProvisionThawRequestFulfilledEvent(activityId(event))
      record.set('typename', Value.fromString('ProvisionThawRequestFulfilledEvent'))
    }
    setProvision(
      record,
      Address.fromString(request.indexer),
      Address.fromString(request.dataService),
    )
    if (event.params.requestType == 1) setDelegator(record, Address.fromString(request.owner))
    addAccount(record, request.owner)
    record.set('owner', Value.fromString(request.owner))
  }
  record.set('requestId', Value.fromBytes(event.params.thawRequestId))
  record.set('requestType', Value.fromI32(event.params.requestType))
  record.set('shares', Value.fromBigInt(event.params.shares))
  record.set('tokens', Value.fromBigInt(event.params.tokens))
  record.set('thawingUntilTimestamp', Value.fromBigInt(event.params.thawingUntil))
  record.set('valid', Value.fromBoolean(event.params.valid))
  saveActivity(record, event)
}

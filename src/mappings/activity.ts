import { Address, BigInt, Entity, Value, ethereum, store } from '@graphprotocol/graph-ts'
import { ActivityAllocation, DataService, Provision, ProvisionDelegation } from '../types/schema'
import { counterFields, loadCounters } from './eventCounters'
import {
  createOrLoadGraphAccount,
  createOrLoadIndexer,
  createOrLoadDelegator,
  createOrLoadSubgraphDeployment,
} from './helpers'

export function activityId(event: ethereum.Event): string {
  return event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
}

// Save and count a record together. Interface totals follow schema membership,
// not a handler's guesses about which roles happen to participate in a log.
export function saveActivity(entity: Entity, event: ethereum.Event): void {
  let type = entity.get('typename')!.toString()
  let id = entity.get('id')!.toString()
  let fields = counterFields(type)
  if (store.get(type, id) != null) return
  entity.set('timestamp', Value.fromBigInt(event.block.timestamp))
  entity.set('blockNumber', Value.fromBigInt(event.block.number))
  entity.set('tx_hash', Value.fromBytes(event.transaction.hash))
  entity.set('contractAddress', Value.fromBytes(event.address))
  entity.set('logIndex', Value.fromBigInt(event.logIndex))
  entity.set('tx_gasLimit', Value.fromBigInt(event.transaction.gasLimit))
  entity.set('tx_gasPrice', Value.fromBigInt(event.transaction.gasPrice))
  assert(event.receipt != null, 'Activity handlers require receipt: true')
  entity.set('tx_gasUsed', Value.fromBigInt(event.receipt!.gasUsed))
  entity.set('tx_cumulativeGasUsed', Value.fromBigInt(event.receipt!.cumulativeGasUsed))
  if (
    type == 'IndexerStakeDepositedEvent' ||
    type == 'IndexerStakeLockedEvent' ||
    type == 'IndexerStakeWithdrawnEvent'
  ) {
    if (entity.get('horizon') == null) entity.set('horizon', Value.fromBoolean(false))
  }
  // Ensure role/account relations exist even when the event is indexed alone.
  let accountList = entity.get('accounts')
  if (accountList != null) {
    let accounts = accountList.toStringArray()
    for (let i = 0; i < accounts.length; i++) createOrLoadGraphAccount(accounts[i])
  }
  let indexer = entity.get('indexer')
  if (indexer != null) {
    createOrLoadGraphAccount(indexer.toString())
    createOrLoadIndexer(indexer.toString())
  }
  let delegator = entity.get('delegator')
  if (delegator != null) {
    createOrLoadGraphAccount(delegator.toString())
    createOrLoadDelegator(delegator.toString())
  }
  let counter = loadCounters()
  for (let i = 0; i < fields.length; i++) {
    let field = fields[i]
    counter.set(field, Value.fromBigInt(counter.get(field)!.toBigInt().plus(BigInt.fromI32(1))))
  }
  store.set(type, id, entity)
  counter.save()
}

export function provisionFor(indexer: Address, verifier: Address): Provision {
  let indexerId = indexer.toHexString()
  let serviceId = verifier.toHexString()
  createOrLoadGraphAccount(indexerId)
  createOrLoadIndexer(indexerId)
  let service = DataService.load(serviceId)
  if (service == null) {
    service = new DataService(serviceId)
    service.save()
  }
  let id = indexerId + '-' + serviceId
  let provision = Provision.load(id)
  if (provision == null) {
    provision = new Provision(id)
    provision.indexer = indexerId
    provision.dataService = serviceId
    provision.save()
  }
  return provision as Provision
}

export function setProvision(entity: Entity, provider: Address, verifier: Address): void {
  let provision = provisionFor(provider, verifier)
  entity.set('indexer', Value.fromString(provision.indexer))
  entity.set('provision', Value.fromString(provision.id))
  entity.set('dataService', Value.fromString(provision.dataService))
  entity.set('accounts', Value.fromStringArray([provision.indexer]))
}

export function setDelegator(entity: Entity, delegator: Address): void {
  let id = delegator.toHexString()
  createOrLoadGraphAccount(id)
  createOrLoadDelegator(id)
  entity.set('delegator', Value.fromString(id))
  addAccount(entity, id)
  let provisionId = entity.get('provision')!.toString()
  let delegationId = id + '-' + provisionId
  if (ProvisionDelegation.load(delegationId) == null) {
    let delegation = new ProvisionDelegation(delegationId)
    delegation.delegator = id
    delegation.provision = provisionId
    delegation.save()
  }
}

export function addAccount(entity: Entity, id: string): void {
  createOrLoadGraphAccount(id)
  let accounts = entity.get('accounts')!.toStringArray()
  if (accounts.indexOf(id) == -1) accounts.push(id)
  entity.set('accounts', Value.fromStringArray(accounts))
}

export function rememberAllocation(
  allocation: Address,
  indexer: Address,
  deployment: string,
  provision: string | null = null,
): void {
  createOrLoadGraphAccount(indexer.toHexString())
  createOrLoadIndexer(indexer.toHexString())
  createOrLoadSubgraphDeployment(deployment)
  let context = new ActivityAllocation(allocation.toHexString())
  context.indexer = indexer.toHexString()
  context.deployment = deployment
  context.provision = provision
  context.save()
}

import { saveActivity } from './activity'
import { BigInt, Address, BigDecimal, Bytes, ipfs, log } from '@graphprotocol/graph-ts'
import {
  CuratorBalanceReceived,
  CuratorBalanceReturnedToBeneficiary,
  SubgraphL2TransferFinalized,
  SubgraphReceivedFromL1,
} from '../types/L2GNS/L2GNS'
import {
  CuratorBalanceReceivedEvent,
  CuratorBalanceReturnedToBeneficiaryEvent,
  SubgraphL2TransferFinalizedEvent,
  SubgraphReceivedFromL1Event,
} from '../types/schema'

import {
  createOrLoadIndexer,
  createOrLoadGraphAccount,
  BIGINT_ONE,
  convertBigIntSubgraphIDToBase58,
  createOrLoadSubgraph,
  createOrLoadCurator,
} from './helpers'

handleSubgraphReceivedFromL1
handleSubgraphL2TransferFinalized
handleCuratorBalanceReceived
handleCuratorBalanceReturnedToBeneficiary

/**
 * @dev handleSubgraphReceivedFromL1
 */
export function handleSubgraphReceivedFromL1(event: SubgraphReceivedFromL1): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let owner = event.params._owner.toHexString()
  let l1SubgraphID = convertBigIntSubgraphIDToBase58(event.params._l1SubgraphID)
  let l2SubgraphID = convertBigIntSubgraphIDToBase58(event.params._l2SubgraphID)
  let accounts = new Array<string>()
  accounts.push(owner)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(owner)
  createOrLoadSubgraph(l1SubgraphID, event.params._owner)
  createOrLoadSubgraph(l2SubgraphID, event.params._owner)

  let eventEntity = new SubgraphReceivedFromL1Event(eventId)

  eventEntity.typename = 'SubgraphReceivedFromL1Event'
  eventEntity.subgraph = l2SubgraphID
  eventEntity.owner = owner
  eventEntity.l1Subgraph = l1SubgraphID
  eventEntity.l2Subgraph = l2SubgraphID
  eventEntity.accounts = accounts
  eventEntity.amountTransferred = event.params._tokens
  saveActivity(eventEntity, event)
}

/**
 * @dev handleSubgraphL2TransferFinalized
 */
export function handleSubgraphL2TransferFinalized(event: SubgraphL2TransferFinalized): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let l2SubgraphID = convertBigIntSubgraphIDToBase58(event.params._l2SubgraphID)

  let eventEntity = new SubgraphL2TransferFinalizedEvent(eventId)

  eventEntity.typename = 'SubgraphL2TransferFinalizedEvent'
  eventEntity.subgraph = l2SubgraphID
  saveActivity(eventEntity, event)
}

/**
 * @dev handleCuratorBalanceReceived
 */
export function handleCuratorBalanceReceived(event: CuratorBalanceReceived): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let curatorAddress = event.params._l2Curator.toHexString()
  let l1SubgraphID = convertBigIntSubgraphIDToBase58(event.params._l1SubgraphId)
  let l2SubgraphID = convertBigIntSubgraphIDToBase58(event.params._l2SubgraphID)
  let accounts = new Array<string>()
  accounts.push(curatorAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(curatorAddress)
  createOrLoadCurator(curatorAddress)

  let eventEntity = new CuratorBalanceReceivedEvent(eventId)

  eventEntity.typename = 'CuratorBalanceReceivedEvent'
  eventEntity.curator = curatorAddress
  eventEntity.l1Subgraph = l1SubgraphID
  eventEntity.l2Subgraph = l2SubgraphID
  eventEntity.accounts = accounts
  eventEntity.amountTransferred = event.params._tokens
  saveActivity(eventEntity, event)
}

/**
 * @dev handleCuratorBalanceReturnedToBeneficiary
 */
export function handleCuratorBalanceReturnedToBeneficiary(
  event: CuratorBalanceReturnedToBeneficiary,
): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let curatorAddress = event.params._l2Curator.toHexString()
  let l1SubgraphID = convertBigIntSubgraphIDToBase58(event.params._l1SubgraphID)
  let accounts = new Array<string>()
  accounts.push(curatorAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(curatorAddress)
  createOrLoadCurator(curatorAddress)

  let eventEntity = new CuratorBalanceReturnedToBeneficiaryEvent(eventId)

  eventEntity.typename = 'CuratorBalanceReturnedToBeneficiary'
  eventEntity.curator = curatorAddress
  eventEntity.l1Subgraph = l1SubgraphID
  eventEntity.accounts = accounts
  eventEntity.amountTransferred = event.params._tokens
  saveActivity(eventEntity, event)
}

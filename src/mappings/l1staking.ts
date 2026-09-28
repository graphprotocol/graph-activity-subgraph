import { saveActivity } from './activity'
import { BigInt, Address, BigDecimal, Bytes, ipfs, log } from '@graphprotocol/graph-ts'
import {
  DelegationTransferredToL2,
  IndexerStakeTransferredToL2,
  StakeDelegatedUnlockedDueToL2Transfer,
} from '../types/L1Staking/L1Staking'
import {
  DelegationTransferredToL2Event,
  IndexerStakeTransferredToL2Event,
  StakeDelegatedUnlockedDueToL2TransferEvent,
} from '../types/schema'

import {
  createOrLoadIndexer,
  createOrLoadDelegator,
  createOrLoadGraphAccount,
  BIGINT_ONE,
} from './helpers'

/**
 * @dev handleDelegationTransferredToL2
 */
export function handleDelegationTransferredToL2(event: DelegationTransferredToL2): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddressL1 = event.params.indexer.toHexString()
  let indexerAddressL2 = event.params.l2Indexer.toHexString()
  let delegatorAddressL1 = event.params.delegator.toHexString()
  let delegatorAddressL2 = event.params.l2Delegator.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddressL1)
  accounts.push(indexerAddressL2)
  accounts.push(delegatorAddressL1)
  accounts.push(delegatorAddressL2)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddressL1)
  createOrLoadIndexer(indexerAddressL1)
  createOrLoadGraphAccount(indexerAddressL2)
  createOrLoadIndexer(indexerAddressL2)
  createOrLoadGraphAccount(delegatorAddressL1)
  createOrLoadDelegator(delegatorAddressL1)
  createOrLoadGraphAccount(delegatorAddressL2)
  createOrLoadDelegator(delegatorAddressL2)

  let eventEntity = new DelegationTransferredToL2Event(eventId)

  eventEntity.typename = 'DelegationTransferredToL2Event'
  eventEntity.indexer = indexerAddressL1
  eventEntity.l1Indexer = indexerAddressL1
  eventEntity.l2Indexer = indexerAddressL2
  eventEntity.delegator = delegatorAddressL1
  eventEntity.l1Delegator = delegatorAddressL1
  eventEntity.l2Delegator = delegatorAddressL2
  eventEntity.accounts = accounts
  eventEntity.amountTransferred = event.params.transferredDelegationTokens
  saveActivity(eventEntity, event)
}

/**
 * @dev handleIndexerStakeTransferredToL2
 */
export function handleIndexerStakeTransferredToL2(event: IndexerStakeTransferredToL2): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddressL1 = event.params.indexer.toHexString()
  let indexerAddressL2 = event.params.l2Indexer.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddressL1)
  accounts.push(indexerAddressL2)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddressL1)
  createOrLoadIndexer(indexerAddressL1)
  createOrLoadGraphAccount(indexerAddressL2)
  createOrLoadIndexer(indexerAddressL2)

  let eventEntity = new IndexerStakeTransferredToL2Event(eventId)

  eventEntity.typename = 'IndexerStakeTransferredToL2Event'
  eventEntity.indexer = indexerAddressL1
  eventEntity.l1Indexer = indexerAddressL1
  eventEntity.l2Indexer = indexerAddressL2
  eventEntity.accounts = accounts
  eventEntity.amountTransferred = event.params.transferredStakeTokens
  saveActivity(eventEntity, event)
}

/**
 * @dev handleStakeDelegatedUnlockedDueToL2Transfer
 */
export function handleStakeDelegatedUnlockedDueToL2Transfer(
  event: StakeDelegatedUnlockedDueToL2Transfer,
): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let delegatorAddress = event.params.delegator.toHexString()
  let accounts = new Array<string>()
  accounts.push(indexerAddress)
  accounts.push(delegatorAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)
  createOrLoadGraphAccount(delegatorAddress)
  createOrLoadDelegator(delegatorAddress)

  let eventEntity = new StakeDelegatedUnlockedDueToL2TransferEvent(eventId)

  eventEntity.typename = 'StakeDelegatedUnlockedDueToL2TransferEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.delegator = delegatorAddress
  eventEntity.accounts = accounts
  saveActivity(eventEntity, event)
}

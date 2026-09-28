import { saveActivity } from './activity'
import { BigInt, Address, BigDecimal, Bytes, ipfs, log } from '@graphprotocol/graph-ts'
import { TransferredDelegationReturnedToDelegator } from '../types/L2Staking/L2Staking'
import { TransferredDelegationReturnedToDelegatorEvent } from '../types/schema'

import {
  createOrLoadIndexer,
  createOrLoadDelegator,
  createOrLoadGraphAccount,
  BIGINT_ONE,
} from './helpers'

/**
 * @dev handleTransferredDelegationReturnedToDelegator
 */
export function handleTransferredDelegationReturnedToDelegator(
  event: TransferredDelegationReturnedToDelegator,
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

  let eventEntity = new TransferredDelegationReturnedToDelegatorEvent(eventId)

  eventEntity.typename = 'TransferredDelegationReturnedToDelegatorEvent'
  eventEntity.delegator = delegatorAddress
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.amountTransferred = event.params.amount
  saveActivity(eventEntity, event)
}

import { BigInt, Address, BigDecimal, Bytes, ipfs, log } from '@graphprotocol/graph-ts'
import { TransferredDelegationReturnedToDelegator } from '../types/L2Staking/L2Staking'
import { TransferredDelegationReturnedToDelegatorEvent } from '../types/schema'

import {
  createOrLoadIndexer,
  createOrLoadDelegator,
  createOrLoadGraphAccount,
  getCounter,
  BIGINT_ONE,
} from './helpers'


/**
 * @dev handleTransferredDelegationReturnedToDelegator
 */
export function handleTransferredDelegationReturnedToDelegator(event: TransferredDelegationReturnedToDelegator): void {
    let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
    let indexerAddress = event.params.indexer.toHexString()
    let delegatorAddress = event.params.delegator.toHexString()
    let accounts = new Array<String>()
    accounts.push(indexerAddress)
    accounts.push(delegatorAddress)
  
    // Creates Graph Account, if needed
    createOrLoadGraphAccount(indexerAddress)
    createOrLoadIndexer(indexerAddress)
    createOrLoadGraphAccount(delegatorAddress)
    createOrLoadDelegator(delegatorAddress)
  
    let eventEntity = new TransferredDelegationReturnedToDelegatorEvent(eventId)
    eventEntity.timestamp = event.block.timestamp
    eventEntity.tx_gasLimit = event.transaction.gasLimit
    eventEntity.tx_gasPrice = event.transaction.gasPrice
    eventEntity.tx_gasUsed = event.receipt!.gasUsed
    eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
    eventEntity.blockNumber = event.block.number
    eventEntity.tx_hash = event.transaction.hash
    eventEntity.typename = 'TransferredDelegationReturnedToDelegatorEvent'
    eventEntity.delegator = delegatorAddress
    eventEntity.indexer = indexerAddress
    eventEntity.accounts = accounts
    eventEntity.amountTransferred = event.params.amount
    eventEntity.save()
  
    let counter = getCounter()
    counter.transferredDelegationReturnedToDelegatorEventCount = counter.transferredDelegationReturnedToDelegatorEventCount.plus(BIGINT_ONE)
    counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
    counter.delegatorEventCount = counter.delegatorEventCount.plus(BIGINT_ONE)
    counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
    counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
    counter.save()
  }
  
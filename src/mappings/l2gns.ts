import { BigInt, Address, BigDecimal, Bytes, ipfs, log } from '@graphprotocol/graph-ts'
import { CuratorBalanceReceived, CuratorBalanceReturnedToBeneficiary, SubgraphL2TransferFinalized, SubgraphReceivedFromL1 } from '../types/L2GNS/L2GNS'
import { CuratorBalanceReceivedEvent, CuratorBalanceReturnedToBeneficiaryEvent, SubgraphL2TransferFinalizedEvent, SubgraphReceivedFromL1Event } from '../types/schema'

import {
  createOrLoadIndexer,
  createOrLoadGraphAccount,
  getCounter,
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
    let accounts = new Array<String>()
    accounts.push(owner)
  
    // Creates Graph Account, if needed
    createOrLoadGraphAccount(owner)
    createOrLoadSubgraph(l1SubgraphID, event.params._owner)
    createOrLoadSubgraph(l2SubgraphID, event.params._owner)
  
  
    let eventEntity = new SubgraphReceivedFromL1Event(eventId)
    eventEntity.timestamp = event.block.timestamp
    eventEntity.tx_gasLimit = event.transaction.gasLimit
    eventEntity.tx_gasPrice = event.transaction.gasPrice
    eventEntity.tx_gasUsed = event.receipt!.gasUsed
    eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
    eventEntity.blockNumber = event.block.number
    eventEntity.tx_hash = event.transaction.hash
    eventEntity.typename = 'SubgraphReceivedFromL1Event'
    eventEntity.subgraph = l2SubgraphID
    eventEntity.owner = owner
    eventEntity.l1Subgraph = l1SubgraphID
    eventEntity.l2Subgraph = l2SubgraphID
    eventEntity.accounts = accounts
    eventEntity.amountTransferred = event.params._tokens
    eventEntity.save()
  
    let counter = getCounter()
    counter.subgraphReceivedFromL1EventCount = counter.subgraphReceivedFromL1EventCount.plus(BIGINT_ONE)
    counter.subgraphEventCount = counter.subgraphEventCount.plus(BIGINT_ONE)
    counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
    counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
    counter.save()
  }
  

/**
 * @dev handleSubgraphL2TransferFinalized
 */
export function handleSubgraphL2TransferFinalized(event: SubgraphL2TransferFinalized): void {
    let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
    let l2SubgraphID = convertBigIntSubgraphIDToBase58(event.params._l2SubgraphID)

    let eventEntity = new SubgraphL2TransferFinalizedEvent(eventId)
    eventEntity.timestamp = event.block.timestamp
    eventEntity.tx_gasLimit = event.transaction.gasLimit
    eventEntity.tx_gasPrice = event.transaction.gasPrice
    eventEntity.tx_gasUsed = event.receipt!.gasUsed
    eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
    eventEntity.blockNumber = event.block.number
    eventEntity.tx_hash = event.transaction.hash
    eventEntity.typename = 'SubgraphL2TransferFinalizedEvent'
    eventEntity.subgraph = l2SubgraphID
    eventEntity.save()

    let counter = getCounter()
    counter.subgraphL2TransferFinalizedEventCount = counter.subgraphL2TransferFinalizedEventCount.plus(BIGINT_ONE)
    counter.subgraphEventCount = counter.subgraphEventCount.plus(BIGINT_ONE)
    counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
    counter.save()
  }
  

/**
 * @dev handleCuratorBalanceReceived
 */
export function handleCuratorBalanceReceived(event: CuratorBalanceReceived): void {
    let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
    let curatorAddress = event.params._l2Curator.toHexString()
    let l1SubgraphID = convertBigIntSubgraphIDToBase58(event.params._l1SubgraphId)
    let l2SubgraphID = convertBigIntSubgraphIDToBase58(event.params._l2SubgraphID)
    let accounts = new Array<String>()
    accounts.push(curatorAddress)
  
    // Creates Graph Account, if needed
    createOrLoadGraphAccount(curatorAddress)
    createOrLoadCurator(curatorAddress)
  
    let eventEntity = new CuratorBalanceReceivedEvent(eventId)
    eventEntity.timestamp = event.block.timestamp
    eventEntity.tx_gasLimit = event.transaction.gasLimit
    eventEntity.tx_gasPrice = event.transaction.gasPrice
    eventEntity.tx_gasUsed = event.receipt!.gasUsed
    eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
    eventEntity.blockNumber = event.block.number
    eventEntity.tx_hash = event.transaction.hash
    eventEntity.typename = 'CuratorBalanceReceivedEvent'
    eventEntity.curator = curatorAddress
    eventEntity.l1Subgraph = l1SubgraphID
    eventEntity.l2Subgraph = l2SubgraphID
    eventEntity.accounts = accounts
    eventEntity.amountTransferred = event.params._tokens
    eventEntity.save()
  
    let counter = getCounter()
    counter.curatorBalanceReceivedEventCount = counter.curatorBalanceReceivedEventCount.plus(BIGINT_ONE)
    counter.curatorEventCount = counter.curatorEventCount.plus(BIGINT_ONE)
    counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
    counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
    counter.save()
  }
  

/**
 * @dev handleCuratorBalanceReturnedToBeneficiary
 */
export function handleCuratorBalanceReturnedToBeneficiary(event: CuratorBalanceReturnedToBeneficiary): void {
    let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
    let curatorAddress = event.params._l2Curator.toHexString()
    let l1SubgraphID = convertBigIntSubgraphIDToBase58(event.params._l1SubgraphID)
    let accounts = new Array<String>()
    accounts.push(curatorAddress)
  
    // Creates Graph Account, if needed
    createOrLoadGraphAccount(curatorAddress)
    createOrLoadCurator(curatorAddress)
  
    let eventEntity = new CuratorBalanceReturnedToBeneficiaryEvent(eventId)
    eventEntity.timestamp = event.block.timestamp
    eventEntity.tx_gasLimit = event.transaction.gasLimit
    eventEntity.tx_gasPrice = event.transaction.gasPrice
    eventEntity.tx_gasUsed = event.receipt!.gasUsed
    eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
    eventEntity.blockNumber = event.block.number
    eventEntity.tx_hash = event.transaction.hash
    eventEntity.typename = 'CuratorBalanceReturnedToBeneficiary'
    eventEntity.curator = curatorAddress
    eventEntity.l1Subgraph = l1SubgraphID
    eventEntity.accounts = accounts
    eventEntity.amountTransferred = event.params._tokens
    eventEntity.save()
  
    let counter = getCounter()
    counter.curatorBalanceReturnedToBeneficiaryEventCount = counter.curatorBalanceReturnedToBeneficiaryEventCount.plus(BIGINT_ONE)
    counter.curatorEventCount = counter.curatorEventCount.plus(BIGINT_ONE)
    counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
    counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
    counter.save()
  }
  
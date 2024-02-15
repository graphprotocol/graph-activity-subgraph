import { BigInt, Address, BigDecimal, Bytes, ipfs, log } from '@graphprotocol/graph-ts'
import { CuratorBalanceSentToL2, SubgraphSentToL2 } from '../types/L1GNS/L1GNS'
import {
  CuratorBalanceSentToL2Event,
  SubgraphSentToL2Event
} from '../types/schema'

import {
  createOrLoadSubgraph,
  createOrLoadGraphAccount,
  getCounter,
  BIGINT_ONE,
  convertBigIntSubgraphIDToBase58,
} from './helpers'

/**
 * @dev handleSubgraphSentToL2
 */
export function handleSubgraphSentToL2(event: SubgraphSentToL2): void {
    let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
    let l1OwnerAddress = event.params._l1Owner.toHexString()
    let l2OwnerAddress = event.params._l2Owner.toHexString()
    let subgraphID = convertBigIntSubgraphIDToBase58(event.params._subgraphID)
    let accounts = new Array<String>()
    accounts.push(l1OwnerAddress)
    accounts.push(l2OwnerAddress)
  
    // Creates Graph Account, if needed
    createOrLoadGraphAccount(l1OwnerAddress)
    createOrLoadGraphAccount(l2OwnerAddress)
    createOrLoadSubgraph(subgraphID, event.params._l1Owner)
  
    let eventEntity = new SubgraphSentToL2Event(eventId)
    eventEntity.timestamp = event.block.timestamp
    eventEntity.tx_gasLimit = event.transaction.gasLimit
    eventEntity.tx_gasPrice = event.transaction.gasPrice
    eventEntity.tx_gasUsed = event.receipt!.gasUsed
    eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
    eventEntity.blockNumber = event.block.number
    eventEntity.tx_hash = event.transaction.hash
    eventEntity.typename = 'SubgraphSentToL2Event'
    eventEntity.subgraph = subgraphID
    eventEntity.l1Owner = l1OwnerAddress
    eventEntity.l2Owner = l2OwnerAddress
    eventEntity.accounts = accounts
    eventEntity.amountTransferred = event.params._tokens
    eventEntity.save()
  
    let counter = getCounter()
    counter.subgraphSentToL2EventCount = counter.subgraphSentToL2EventCount.plus(BIGINT_ONE)
    counter.subgraphEventCount = counter.subgraphEventCount.plus(BIGINT_ONE)
    counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
    counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
    counter.save()
  }

/**
 * @dev handleCuratorBalanceSentToL2
 */
export function handleCuratorBalanceSentToL2(event: CuratorBalanceSentToL2): void {
    let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
    let l1CuratorAddress = event.params._l1Curator.toHexString()
    let l2BeneficiaryAddress = event.params._l2Beneficiary.toHexString()
    let accounts = new Array<String>()
    accounts.push(l1CuratorAddress)
    accounts.push(l2BeneficiaryAddress)
  
    // Creates Graph Account, if needed
    createOrLoadGraphAccount(l1CuratorAddress)
    createOrLoadGraphAccount(l2BeneficiaryAddress)
  
    let eventEntity = new CuratorBalanceSentToL2Event(eventId)
    eventEntity.timestamp = event.block.timestamp
    eventEntity.tx_gasLimit = event.transaction.gasLimit
    eventEntity.tx_gasPrice = event.transaction.gasPrice
    eventEntity.tx_gasUsed = event.receipt!.gasUsed
    eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
    eventEntity.blockNumber = event.block.number
    eventEntity.tx_hash = event.transaction.hash
    eventEntity.typename = 'CuratorBalanceSentToL2Event'
    eventEntity.curator = l1CuratorAddress
    eventEntity.l1CuratorAccount = l1CuratorAddress
    eventEntity.l2BeneficiaryAccount = l1CuratorAddress
    eventEntity.accounts = accounts
    eventEntity.amountTransferred = event.params._tokens
    eventEntity.save()
  
    let counter = getCounter()
    counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
    counter.curatorEventCount = counter.curatorEventCount.plus(BIGINT_ONE)
    counter.curatorBalanceSentToL2EventCount = counter.curatorBalanceSentToL2EventCount.plus(BIGINT_ONE)
    counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
    counter.save()
  }
  
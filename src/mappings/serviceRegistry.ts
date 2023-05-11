import { IndexerServiceRegisteredEvent, IndexerServiceUnregisteredEvent } from '../types/schema'
import { ServiceRegistered, ServiceUnregistered } from '../types/ServiceRegistry/ServiceRegistry'
import { createOrLoadIndexer, createOrLoadGraphAccount, getCounter, BIGINT_ONE } from './helpers'

/**
 * @dev handleServiceRegistered
 * - updates indexer, creates if needed
 */
export function handleServiceRegistered(event: ServiceRegistered): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new IndexerServiceRegisteredEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'IndexerServiceRegisteredEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.url = event.params.url
  eventEntity.geoHash = event.params.geohash
  eventEntity.save()

  let counter = getCounter()
  counter.indexerServiceRegisteredEventCount =
    counter.indexerServiceRegisteredEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

/**
 * @dev handleServiceUnregistered
 * - updates indexer
 */
export function handleServiceUnregistered(event: ServiceUnregistered): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  let eventEntity = new IndexerServiceUnregisteredEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'IndexerServiceUnregisteredEvent'
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.save()

  let counter = getCounter()
  counter.indexerServiceUnregisteredEventCount =
    counter.indexerServiceUnregisteredEventCount.plus(BIGINT_ONE)
  counter.indexerEventCount = counter.indexerEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

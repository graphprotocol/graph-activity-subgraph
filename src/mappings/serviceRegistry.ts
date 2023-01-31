import { IndexerServiceRegisteredEvent, IndexerServiceUnregisteredEvent } from '../types/schema'
import { ServiceRegistered, ServiceUnregistered } from '../types/ServiceRegistry/ServiceRegistry'
import { createOrLoadIndexer, createOrLoadGraphAccount } from './helpers'

/**
 * @dev handleServiceRegistered
 * - updates indexer, creates if needed
 */
export function handleServiceRegistered(event: ServiceRegistered): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new IndexerServiceRegisteredEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = "IndexerServiceRegisteredEvent"
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.url = event.params.url
  eventEntity.geoHash = event.params.geohash
  eventEntity.save()
}

/**
 * @dev handleServiceUnregistered
 * - updates indexer
 */
export function handleServiceUnregistered(event: ServiceUnregistered): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.indexer.toHexString()
  let accounts = new Array<String>();
  accounts.push(indexerAddress)

  let eventEntity = new IndexerServiceUnregisteredEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = "IndexerServiceUnregisteredEvent"
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  eventEntity.save()
}

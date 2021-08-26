import { ServiceRegistered, ServiceUnregistered } from '../types/ServiceRegistry/ServiceRegistry'
import { createOrLoadIndexer, createOrLoadGraphAccount } from './helpers'

/**
 * @dev handleServiceRegistered
 * - updates indexer, creates if needed
 */
export function handleServiceRegistered(event: ServiceRegistered): void {
  let indexerAddress = event.params.indexer.toHexString()

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress, event.params.indexer, event.block.timestamp)
  createOrLoadIndexer(indexerAddress, event.block.timestamp)

  // Add action here
}

/**
 * @dev handleServiceUnregistered
 * - updates indexer
 */
export function handleServiceUnregistered(event: ServiceUnregistered): void {
  let indexerAddress = event.params.indexer.toHexString()

  // Add action here
}

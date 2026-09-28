import { saveActivity } from './activity'
import { Signalled, Burned, ParameterUpdated } from '../types/Curation/Curation'
import { SignalMintedEvent, SignalBurnedEvent, ParameterUpdatedEvent } from '../types/schema'

import {
  createOrLoadSubgraphDeployment,
  createOrLoadCurator,
  createOrLoadGraphAccount,
  joinID,
  BIGINT_ZERO,
  BIGINT_ONE,
} from './helpers'

/**
 * @dev handleStaked
 * - updates curator, creates if needed
 * - updates signal, creates if needed
 * - updates subgraph deployment, creates if needed
 */
export function handleSignalled(event: Signalled): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let curatorID = event.params.curator.toHexString()
  let graphAccount = curatorID
  let deploymentID = event.params.subgraphDeploymentID.toHexString()
  let accounts = new Array<string>()
  accounts.push(graphAccount)

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  createOrLoadSubgraphDeployment(deploymentID)
  let signalId = joinID([curatorID, deploymentID])

  let eventEntity = new SignalMintedEvent(eventId)

  eventEntity.typename = 'SignalMintedEvent'
  eventEntity.deployment = deploymentID
  eventEntity.curator = curatorID
  eventEntity.accounts = accounts
  eventEntity.signalId = signalId
  eventEntity.versionSignal = event.params.signal
  eventEntity.tokens = event.params.tokens
  saveActivity(eventEntity, event)
}
/**
 * @dev handleRedeemed
 * - updates curator
 * - updates signal
 * - updates subgraph
 */
export function handleBurned(event: Burned): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let curatorID = event.params.curator.toHexString()
  let graphAccount = curatorID
  let deploymentID = event.params.subgraphDeploymentID.toHexString()
  let accounts = new Array<string>()
  accounts.push(graphAccount)

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  let signalId = joinID([curatorID, deploymentID])

  let eventEntity = new SignalBurnedEvent(eventId)

  eventEntity.typename = 'SignalBurnedEvent'
  eventEntity.deployment = deploymentID
  eventEntity.curator = curatorID
  eventEntity.accounts = accounts
  eventEntity.signalId = signalId
  eventEntity.versionSignal = event.params.signal
  eventEntity.tokens = event.params.tokens
  saveActivity(eventEntity, event)
  //
}

/**
 * @dev handleParamterUpdated
 * - updates all parameters of Curation, depending on string passed. We then can
 *   call the contract directly to get the updated value
 */
export function handleParameterUpdated(event: ParameterUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let eventEntity = new ParameterUpdatedEvent(eventId)

  eventEntity.typename = 'ParameterUpdatedEvent'
  eventEntity.parameter = event.params.param
  saveActivity(eventEntity, event)
}

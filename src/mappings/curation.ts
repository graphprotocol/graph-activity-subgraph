import { Signalled, Burned, ParameterUpdated } from '../types/Curation/Curation'
import { SignalMintedEvent, SignalBurnedEvent, ParameterUpdatedEvent } from '../types/schema'

import {
  createOrLoadSubgraphDeployment,
  createOrLoadCurator,
  createOrLoadGraphAccount,
  joinID,
  getCounter,
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
  let accounts = new Array<String>()
  accounts.push(graphAccount)

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  createOrLoadSubgraphDeployment(deploymentID)
  let signalId = joinID([curatorID, deploymentID])

  let eventEntity = new SignalMintedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'SignalMintedEvent'
  eventEntity.deployment = deploymentID
  eventEntity.curator = curatorID
  eventEntity.accounts = accounts
  eventEntity.signalId = signalId
  eventEntity.versionSignal = event.params.signal
  eventEntity.tokens = event.params.tokens
  eventEntity.save()

  let counter = getCounter()
  counter.signalMintedEventCount = counter.signalMintedEventCount.plus(BIGINT_ONE)
  counter.curatorEventCount = counter.curatorEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.subgraphDeploymentEventCount = counter.subgraphDeploymentEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
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
  let accounts = new Array<String>()
  accounts.push(graphAccount)

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  let signalId = joinID([curatorID, deploymentID])

  let eventEntity = new SignalBurnedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'SignalBurnedEvent'
  eventEntity.deployment = deploymentID
  eventEntity.curator = curatorID
  eventEntity.accounts = accounts
  eventEntity.signalId = signalId
  eventEntity.versionSignal = event.params.signal
  eventEntity.tokens = event.params.tokens
  eventEntity.save()
  //
  let counter = getCounter()
  counter.signalBurnedEventCount = counter.signalBurnedEventCount.plus(BIGINT_ONE)
  counter.curatorEventCount = counter.curatorEventCount.plus(BIGINT_ONE)
  counter.graphAccountEventCount = counter.graphAccountEventCount.plus(BIGINT_ONE)
  counter.subgraphDeploymentEventCount = counter.subgraphDeploymentEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

/**
 * @dev handleParamterUpdated
 * - updates all parameters of Curation, depending on string passed. We then can
 *   call the contract directly to get the updated value
 */
export function handleParameterUpdated(event: ParameterUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let eventEntity = new ParameterUpdatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.tx_gasLimit = event.transaction.gasLimit
  eventEntity.tx_gasPrice = event.transaction.gasPrice
  eventEntity.tx_gasUsed = event.receipt!.gasUsed
  eventEntity.tx_cumulativeGasUsed = event.receipt!.cumulativeGasUsed
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.typename = 'ParameterUpdatedEvent'
  eventEntity.parameter = event.params.param
  eventEntity.save()

  let counter = getCounter()
  counter.parameterUpdatedEventCount = counter.parameterUpdatedEventCount.plus(BIGINT_ONE)
  counter.eventCount = counter.eventCount.plus(BIGINT_ONE)
  counter.save()
}

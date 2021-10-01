import { BigInt, BigDecimal, Bytes, json } from '@graphprotocol/graph-ts'
import {
  SubgraphPublished,
  SubgraphDeprecated,
  NameSignalEnabled,
  NSignalMinted,
  NSignalBurned,
  NameSignalUpgrade,
  NameSignalDisabled,
  GRTWithdrawn,
  SubgraphMetadataUpdated,
  SetDefaultName,
  ParameterUpdated,
  GNS,
} from '../types/GNS/GNS'

import {
  Subgraph,
  SubgraphVersion,
  Curator,
  Delegator,
  Indexer,
  SubgraphDeployment,
  NewSubgraphPublishedEvent,
  NewSubgraphVersionPublishedEvent,
  SubgraphMetadataUpdatedEvent,
  SubgraphDeprecatedEvent,
  SubgraphNameSignalEnabledEvent,
  NSignalMintedEvent,
  NSignalBurnedEvent,
} from '../types/schema'

import { zeroBD } from './utils'
import {
  createOrLoadSubgraphDeployment,
  createOrLoadGraphAccount,
  createOrLoadCurator,
  addQm,
  createOrLoadSubgraph,
  joinID,
} from './helpers'

export function handleSetDefaultName(event: SetDefaultName): void {
  // let graphAccount = createOrLoadGraphAccount(
  //   event.params.graphAccount.toHexString(),
  //   event.params.graphAccount,
  //   event.block.timestamp,
  // )
  //
  // if (graphAccount.defaultName != null) {
  //   let graphAccountName = GraphAccountName.load(graphAccount.defaultName)
  //   // If trying to set the same name, do nothing
  //   if (graphAccountName.name == event.params.name) {
  //     return
  //   }
  //
  //   // A user is resetting their name. This is done by passing nameIdentifier = bytes32(0)
  //   // String can be anything, but in front end we should just do a blank string
  //   if (
  //     event.params.nameIdentifier.toHex() ==
  //     '0x0000000000000000000000000000000000000000000000000000000000000000'
  //   ) {
  //     graphAccountName.graphAccount = null
  //     graphAccountName.save()
  //
  //     graphAccount.defaultName = null
  //     graphAccount.defaultDisplayName = null
  //     graphAccount.save()
  //
  //     let indexer = Indexer.load(event.params.graphAccount.toHexString())
  //     if (indexer != null) {
  //       indexer.defaultDisplayName = graphAccount.defaultDisplayName
  //       indexer.save()
  //     }
  //
  //     let curator = Curator.load(event.params.graphAccount.toHexString())
  //     if (curator != null) {
  //       curator.defaultDisplayName = graphAccount.defaultDisplayName
  //       curator.save()
  //     }
  //
  //     let delegator = Delegator.load(event.params.graphAccount.toHexString())
  //     if (delegator != null) {
  //       delegator.defaultDisplayName = graphAccount.defaultDisplayName
  //       delegator.save()
  //     }
  //     addDefaultNameTokenLockWallets(graphAccount, graphAccount.defaultDisplayName)
  //   }
  // }
  //
  // let newDefaultName = resolveName(
  //   event.params.graphAccount,
  //   event.params.name,
  //   event.params.nameIdentifier,
  // )
  //
  // // Edge case - a user sets a correct ID, and then sets an incorrect ID. It should not overwrite
  // // the good name with null
  // if (newDefaultName != null) {
  //   graphAccount.defaultName = newDefaultName
  //   graphAccount.defaultDisplayName = event.params.name
  //
  //   // And if the GraphAccount changes default name, we should change it on the indexer too.
  //   // Indexer also has a defaultDisplayName because it helps with filtering.
  //   let userAddress = event.params.graphAccount.toHexString()
  //
  //   let indexer = Indexer.load(userAddress)
  //   if (indexer != null) {
  //     indexer.defaultDisplayName = graphAccount.defaultDisplayName
  //     indexer.save()
  //   }
  //
  //   let curator = Curator.load(userAddress)
  //   if (curator != null) {
  //     curator.defaultDisplayName = graphAccount.defaultDisplayName
  //     curator.save()
  //   }
  //
  //   let delegator = Delegator.load(userAddress)
  //   if (delegator != null) {
  //     delegator.defaultDisplayName = graphAccount.defaultDisplayName
  //     delegator.save()
  //   }
  //   addDefaultNameTokenLockWallets(graphAccount, graphAccount.defaultDisplayName)
  // }
  // graphAccount.save()
}

export function handleSubgraphMetadataUpdated(event: SubgraphMetadataUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let graphAccountID = event.params.graphAccount.toHexString()
  createOrLoadGraphAccount(graphAccountID)
  let subgraphNumber = event.params.subgraphNumber.toString()
  let subgraphID = joinID([graphAccountID, subgraphNumber])
  let subgraph = createOrLoadSubgraph(subgraphID, event.params.graphAccount)

  let subgraphVersion = SubgraphVersion.load(subgraph.currentVersion) as SubgraphVersion
  let subgraphDeploymentID = subgraphVersion.subgraphDeployment

  let hexHash = addQm(event.params.subgraphMetadata) as Bytes
  let base58Hash = hexHash.toBase58()

  let eventEntity = new SubgraphMetadataUpdatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraph.id
  eventEntity.account = graphAccountID
  eventEntity.ipfsFileHash = base58Hash
  eventEntity.save()
}

/**
 * @dev handleSubgraphPublished - Publishes a SubgraphVersion. If it is the first SubgraphVersion,
 * it will also create the Subgraph
 * - Updates subgraph, creates if needed
 * - Creates subgraph version
 * - Creates subgraph deployment, if needed
 * - creates graph account, if needed
 */
export function handleSubgraphPublished(event: SubgraphPublished): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let graphAccountID = event.params.graphAccount.toHexString()
  let subgraphNumber = event.params.subgraphNumber.toString()
  let subgraphID = joinID([graphAccountID, subgraphNumber])
  let versionID: string
  let versionNumber: number

  // Update subgraph
  let subgraph = createOrLoadSubgraph(subgraphID, event.params.graphAccount)
  let oldVersionID = subgraph.currentVersion

  versionID = joinID([subgraphID, subgraph.versionCount.toString()])
  subgraph.currentVersion = versionID
  subgraph.versionCount = subgraph.versionCount.plus(BigInt.fromI32(1))
  subgraph.save()

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(graphAccountID)

  // Create subgraph deployment, if needed. Can happen if the deployment has never been staked on
  let deployment = createOrLoadSubgraphDeployment(event.params.subgraphDeploymentID.toHexString())

  // Create subgraph version
  let subgraphVersion = new SubgraphVersion(versionID)
  subgraphVersion.subgraph = subgraphID
  subgraphVersion.subgraphDeployment = deployment.id
  subgraphVersion.version = versionNumber as i32
  subgraphVersion.save()

  let eventEntity = new NewSubgraphPublishedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraph.id
  eventEntity.version = subgraphVersion.id
  eventEntity.deployment = deployment.id
  eventEntity.account = graphAccountID
  if (subgraph.versionCount == BigInt.fromI32(1)) {
    let coercedEntity = changetype<NewSubgraphVersionPublishedEvent>(eventEntity)
    coercedEntity.save()
  } else {
    eventEntity.save()
  }
}
/**
 * @dev handleSubgraphDeprecated
 * - updates subgraph to have no version and no name
 * - deprecates subgraph version
 */
export function handleSubgraphDeprecated(event: SubgraphDeprecated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let graphAccount = event.params.graphAccount.toHexString()
  let subgraphNumber = event.params.subgraphNumber.toString()
  let subgraphID = joinID([graphAccount, subgraphNumber])

  let eventEntity = new SubgraphDeprecatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.account = graphAccount
  eventEntity.save()
}

export function handleNameSignalEnabled(event: NameSignalEnabled): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let graphAccount = event.params.graphAccount.toHexString()
  let subgraphNumber = event.params.subgraphNumber.toString()
  let subgraphID = joinID([graphAccount, subgraphNumber])

  let eventEntity = new SubgraphNameSignalEnabledEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.account = graphAccount
  eventEntity.save()
}

export function handleNSignalMinted(event: NSignalMinted): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let curatorID = event.params.nameCurator.toHexString()
  let graphAccount = event.params.graphAccount.toHexString()
  let subgraphNumber = event.params.subgraphNumber.toString()
  let subgraphID = joinID([graphAccount, subgraphNumber])

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  let nameSignalId = joinID([curatorID, subgraphID])

  let eventEntity = new NSignalMintedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.subgraphOwner = graphAccount
  eventEntity.curator = curatorID
  eventEntity.account = curatorID
  eventEntity.nameSignalId = nameSignalId
  eventEntity.nameSignal = event.params.nSignalCreated
  eventEntity.versionSignal = event.params.vSignalCreated
  eventEntity.tokens = event.params.tokensDeposited
  eventEntity.save()
}

export function handleNSignalBurned(event: NSignalBurned): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let curatorID = event.params.nameCurator.toHexString()
  let graphAccount = event.params.graphAccount.toHexString()
  let subgraphNumber = event.params.subgraphNumber.toString()
  let subgraphID = joinID([graphAccount, subgraphNumber])

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  let nameSignalId = joinID([curatorID, subgraphID])

  let eventEntity = new NSignalBurnedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.subgraphOwner = graphAccount
  eventEntity.curator = curatorID
  eventEntity.account = curatorID
  eventEntity.nameSignalId = nameSignalId
  eventEntity.nameSignal = event.params.nSignalBurnt
  eventEntity.versionSignal = event.params.vSignalBurnt
  eventEntity.tokens = event.params.tokensReceived
  eventEntity.save()
}

export function handleNameSignalUpgrade(event: NameSignalUpgrade): void {
  // let graphAccount = event.params.graphAccount.toHexString()
  // let subgraphNumber = event.params.subgraphNumber.toString()
  // let subgraphID = joinID([graphAccount, subgraphNumber])
  // let subgraph = Subgraph.load(subgraphID)
  //
  // // Weirdly here, we add the token amount to both, but also the name curator owner must
  // // stake the withdrawal fees, so both balance fairly
  // // TODO - will have to come back here and make sure my thinking is correct
  // // event.params.newVSignalCreated -> will be used to calculate new nSignal/vSignal ratio
  // subgraph.signalAmount = event.params.newVSignalCreated
  // subgraph.unsignalledTokens = subgraph.unsignalledTokens.plus(event.params.tokensSignalled)
  // subgraph.signalledTokens = subgraph.signalledTokens.plus(event.params.tokensSignalled)
  // subgraph.save()
  //
  // let signalRatio = subgraph.signalAmount.toBigDecimal() / subgraph.nameSignalAmount.toBigDecimal()
  //
  // for (let i = 0; i < subgraph.nameSignalCount; i++) {
  //   let relation = NameSignalSubgraphRelation.load(
  //     joinID([subgraphID, BigInt.fromI32(i).toString()]),
  //   )
  //   let nameSignal = NameSignal.load(relation.nameSignal)
  //   if (!nameSignal.nameSignal.isZero()) {
  //     let curator = Curator.load(nameSignal.curator)
  //
  //     let oldSignal = nameSignal.signal
  //     nameSignal.signal = nameSignal.nameSignal.toBigDecimal() * signalRatio
  //     nameSignal.signal = nameSignal.signal.truncate(18)
  //
  //     // zero division protection
  //     if (nameSignal.signal != zeroBD) {
  //       nameSignal.signalAverageCostBasisPerSignal = nameSignal.signalAverageCostBasis
  //         .div(nameSignal.signal)
  //         .truncate(18)
  //     }
  //
  //     let previousACBSignal = nameSignal.signalAverageCostBasis
  //     nameSignal.signalAverageCostBasis = nameSignal.signal
  //       .times(nameSignal.signalAverageCostBasisPerSignal)
  //       .truncate(18)
  //
  //     let diffACBSignal = previousACBSignal.minus(nameSignal.signalAverageCostBasis)
  //     if (nameSignal.signalAverageCostBasis == zeroBD) {
  //       nameSignal.signalAverageCostBasisPerSignal = zeroBD
  //     }
  //
  //     curator.totalSignal = curator.totalSignal.minus(oldSignal).plus(nameSignal.signal)
  //     curator.totalSignalAverageCostBasis = curator.totalSignalAverageCostBasis.minus(diffACBSignal)
  //     if (curator.totalSignal == zeroBD) {
  //       curator.totalAverageCostBasisPerSignal = zeroBD
  //     } else {
  //       curator.totalAverageCostBasisPerSignal = curator.totalSignalAverageCostBasis
  //         .div(curator.totalSignal)
  //         .truncate(18)
  //     }
  //     nameSignal.save()
  //     curator.save()
  //   }
  // }
}

// Only need to upgrade withdrawable tokens. Everything else handled from
// curation events, or handleGRTWithdrawn
export function handleNameSignalDisabled(event: NameSignalDisabled): void {
  // let graphAccount = event.params.graphAccount.toHexString()
  // let subgraphNumber = event.params.subgraphNumber.toString()
  // let subgraphID = joinID([graphAccount, subgraphNumber])
  // let subgraph = Subgraph.load(subgraphID)
  // subgraph.withdrawableTokens = event.params.withdrawableGRT
  // subgraph.signalAmount = BigInt.fromI32(0)
  // subgraph.save()
}

export function handleGRTWithdrawn(event: GRTWithdrawn): void {
  // let graphAccount = event.params.graphAccount.toHexString()
  // let subgraphNumber = event.params.subgraphNumber.toString()
  // let subgraphID = joinID([graphAccount, subgraphNumber])
  // let subgraph = Subgraph.load(subgraphID)
  // subgraph.withdrawableTokens = subgraph.withdrawableTokens.minus(event.params.withdrawnGRT)
  // subgraph.withdrawnTokens = subgraph.withdrawnTokens.plus(event.params.withdrawnGRT)
  // subgraph.nameSignalAmount = subgraph.nameSignalAmount.minus(event.params.nSignalBurnt)
  // subgraph.save()
  //
  // let nameSignal = createOrLoadNameSignal(
  //   event.params.nameCurator.toHexString(),
  //   subgraphID,
  //   event.block.timestamp,
  // )
  // nameSignal.withdrawnTokens = event.params.withdrawnGRT
  // nameSignal.nameSignal = nameSignal.nameSignal.minus(event.params.nSignalBurnt)
  // // Resetting this one since we don't have the value to subtract, but it should be 0 anyways.
  // nameSignal.signal = BigDecimal.fromString('0')
  // nameSignal.lastNameSignalChange = event.block.timestamp.toI32()
  //
  // // Reset everything to 0 since this empties the signal
  // nameSignal.averageCostBasis = BigDecimal.fromString('0')
  // nameSignal.averageCostBasisPerSignal = BigDecimal.fromString('0')
  // nameSignal.nameSignalAverageCostBasis = BigDecimal.fromString('0')
  // nameSignal.nameSignalAverageCostBasisPerSignal = BigDecimal.fromString('0')
  // nameSignal.signalAverageCostBasis = BigDecimal.fromString('0')
  // nameSignal.signalAverageCostBasisPerSignal = BigDecimal.fromString('0')
  //
  // nameSignal.save()
  //
  // let curator = Curator.load(event.params.nameCurator.toHexString())
  // curator.totalWithdrawnTokens = curator.totalWithdrawnTokens.plus(event.params.withdrawnGRT)
  // curator.save()
}

/**
 * @dev handleParamterUpdated
 * - updates all parameters of GNS, depending on string passed. We then can
 *   call the contract directly to get the updated value
 */
export function handleParameterUpdated(event: ParameterUpdated): void {
  // let parameter = event.params.param
  // let graphNetwork = GraphNetwork.load('1')
  // let gns = GNS.bind(event.address)
  //
  // if (parameter == 'ownerTaxPercentage') {
  //   graphNetwork.ownerTaxPercentage = gns.ownerTaxPercentage().toI32()
  // }
  // graphNetwork.save()
}

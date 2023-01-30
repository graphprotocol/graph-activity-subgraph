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
  SubgraphPublished1,
  SubgraphDeprecated1,
  SubgraphMetadataUpdated1,
  SignalMinted,
  SignalBurned,
  GRTWithdrawn1,
  SubgraphUpgraded,
  SubgraphVersionUpdated,
  LegacySubgraphClaimed,
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
  GRTWithdrawnEvent,
  ParameterUpdatedEvent,
  SetDefaultNameEvent,
} from '../types/schema'

import { zeroBD } from './utils'
import {
  createOrLoadSubgraphDeployment,
  createOrLoadGraphAccount,
  createOrLoadIndexer,
  createOrLoadCurator,
  addQm,
  createOrLoadSubgraph,
  joinID,
  convertBigIntSubgraphIDToBase58,
  getSubgraphID,
} from './helpers'

export function handleSetDefaultName(event: SetDefaultName): void {
  // let newDefaultName = resolveName(
  //   event.params.graphAccount,
  //   event.params.name,
  //   event.params.nameIdentifier,
  // )
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let indexerAddress = event.params.graphAccount.toHexString()
  let accounts = new Array<String>()
  accounts.push(indexerAddress)

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(indexerAddress)
  createOrLoadIndexer(indexerAddress)

  let eventEntity = new SetDefaultNameEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.indexer = indexerAddress
  eventEntity.accounts = accounts
  if (
    event.params.nameIdentifier.toHex() ==
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  ) {
    // Removing name
    eventEntity.newDefaultName = ''
  } else {
    // should probably do a resolve name to make sure we have the same checks that in the core subgraph
    eventEntity.newDefaultName = event.params.name
  }
  eventEntity.save()
}

export function handleSubgraphMetadataUpdated(event: SubgraphMetadataUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let graphAccountID = event.params.graphAccount.toHexString()
  createOrLoadGraphAccount(graphAccountID)
  let subgraphNumber = event.params.subgraphNumber
  let subgraphID = convertBigIntSubgraphIDToBase58(getSubgraphID(graphAccountID, subgraphNumber))
  let subgraph = createOrLoadSubgraph(subgraphID, event.params.graphAccount)
  let accounts = new Array<String>()
  accounts.push(graphAccountID)

  let subgraphVersion = SubgraphVersion.load(subgraph.currentVersion) as SubgraphVersion
  let subgraphDeploymentID = subgraphVersion.subgraphDeployment

  let hexHash = changetype<Bytes>(addQm(event.params.subgraphMetadata))
  let base58Hash = hexHash.toBase58()

  let eventEntity = new SubgraphMetadataUpdatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraph.id
  eventEntity.accounts = accounts
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
  let subgraphNumber = event.params.subgraphNumber
  let subgraphID = convertBigIntSubgraphIDToBase58(getSubgraphID(graphAccountID, subgraphNumber))
  let versionID: string
  let versionNumber: number
  let accounts = new Array<String>()
  accounts.push(graphAccountID)

  // Update subgraph
  let subgraph = createOrLoadSubgraph(subgraphID, event.params.graphAccount)
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
  eventEntity.accounts = accounts
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
  let subgraphNumber = event.params.subgraphNumber
  let subgraphID = convertBigIntSubgraphIDToBase58(getSubgraphID(graphAccount, subgraphNumber))
  let accounts = new Array<String>()
  accounts.push(graphAccount)

  let eventEntity = new SubgraphDeprecatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.accounts = accounts
  eventEntity.save()
}

export function handleNameSignalEnabled(event: NameSignalEnabled): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let graphAccount = event.params.graphAccount.toHexString()
  let subgraphNumber = event.params.subgraphNumber
  let subgraphID = convertBigIntSubgraphIDToBase58(getSubgraphID(graphAccount, subgraphNumber))
  let accounts = new Array<String>()
  accounts.push(graphAccount)

  let eventEntity = new SubgraphNameSignalEnabledEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.accounts = accounts
  eventEntity.save()
}

export function handleNSignalMinted(event: NSignalMinted): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let curatorID = event.params.nameCurator.toHexString()
  let graphAccount = event.params.graphAccount.toHexString()
  let subgraphNumber = event.params.subgraphNumber
  let subgraphID = convertBigIntSubgraphIDToBase58(getSubgraphID(graphAccount, subgraphNumber))
  let accounts = new Array<String>()
  accounts.push(graphAccount)
  accounts.push(curatorID)

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  let nameSignalId = joinID([curatorID, subgraphID])

  let eventEntity = new NSignalMintedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.curator = curatorID
  eventEntity.accounts = accounts
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
  let subgraphNumber = event.params.subgraphNumber
  let subgraphID = convertBigIntSubgraphIDToBase58(getSubgraphID(graphAccount, subgraphNumber))
  let accounts = new Array<String>()
  accounts.push(graphAccount)
  accounts.push(curatorID)

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  let nameSignalId = joinID([curatorID, subgraphID])

  let eventEntity = new NSignalBurnedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.curator = curatorID
  eventEntity.accounts = accounts
  eventEntity.nameSignalId = nameSignalId
  eventEntity.nameSignal = event.params.nSignalBurnt
  eventEntity.versionSignal = event.params.vSignalBurnt
  eventEntity.tokens = event.params.tokensReceived
  eventEntity.save()
}

export function handleNameSignalUpgrade(event: NameSignalUpgrade): void {
  // let graphAccount = event.params.graphAccount.toHexString()
  // let subgraphNumber = event.params.subgraphNumber
  // let subgraphID = convertBigIntSubgraphIDToBase58(getSubgraphID(graphAccount, subgraphNumber))
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
  // let subgraphNumber = event.params.subgraphNumber
  // let subgraphID = convertBigIntSubgraphIDToBase58(getSubgraphID(graphAccount, subgraphNumber))
  // let subgraph = Subgraph.load(subgraphID)
  // subgraph.withdrawableTokens = event.params.withdrawableGRT
  // subgraph.signalAmount = BigInt.fromI32(0)
  // subgraph.save()
}

export function handleGRTWithdrawn(event: GRTWithdrawn): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let curatorID = event.params.nameCurator.toHexString()
  let graphAccount = event.params.graphAccount.toHexString()
  let subgraphNumber = event.params.subgraphNumber
  let subgraphID = convertBigIntSubgraphIDToBase58(getSubgraphID(graphAccount, subgraphNumber))
  let accounts = new Array<String>()
  accounts.push(graphAccount)
  accounts.push(curatorID)

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  let nameSignalId = joinID([curatorID, subgraphID])

  let eventEntity = new GRTWithdrawnEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.curator = curatorID
  eventEntity.accounts = accounts
  eventEntity.nameSignalId = nameSignalId
  eventEntity.nameSignal = event.params.nSignalBurnt
  eventEntity.tokens = event.params.withdrawnGRT
  eventEntity.save()
}

/**
 * @dev handleParamterUpdated
 * - updates all parameters of GNS, depending on string passed. We then can
 *   call the contract directly to get the updated value
 */
export function handleParameterUpdated(event: ParameterUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let eventEntity = new ParameterUpdatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.parameter = event.params.param
  eventEntity.save()
}

// - event: SubgraphPublished(indexed uint256,indexed bytes32,uint32)
//   handler: handleSubgraphPublishedV2

export function handleSubgraphPublishedV2(event: SubgraphPublished1): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let bigIntID = event.params.subgraphID
  let graphAccountID = event.transaction.from.toHexString()
  let subgraphID = convertBigIntSubgraphIDToBase58(bigIntID)
  let versionID: string
  let versionNumber: number
  let accounts = new Array<String>()
  accounts.push(graphAccountID)

  // Update subgraph
  let subgraph = createOrLoadSubgraph(subgraphID, event.transaction.from)

  versionID = joinID([subgraphID, subgraph.versionCount.toString()])
  subgraph.currentVersion = versionID
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
  eventEntity.accounts = accounts
  eventEntity.save()
}

// - event: SubgraphDeprecated(indexed uint256,uint256)
//   handler: handleSubgraphDeprecatedV2

export function handleSubgraphDeprecatedV2(event: SubgraphDeprecated1): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let bigIntID = event.params.subgraphID
  let graphAccount = event.transaction.from.toHexString()
  let subgraphID = convertBigIntSubgraphIDToBase58(bigIntID)
  let accounts = new Array<String>()
  accounts.push(graphAccount)

  let eventEntity = new SubgraphDeprecatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.accounts = accounts
  eventEntity.save()
}

// - event: SubgraphMetadataUpdated(indexed uint256,bytes32)
//   handler: handleSubgraphMetadataUpdatedV2

export function handleSubgraphMetadataUpdatedV2(event: SubgraphMetadataUpdated1): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let bigIntID = event.params.subgraphID
  let graphAccountID = event.transaction.from.toHexString()
  let subgraphID = convertBigIntSubgraphIDToBase58(bigIntID)
  let subgraph = createOrLoadSubgraph(subgraphID, event.transaction.from)
  let accounts = new Array<String>()
  accounts.push(graphAccountID)

  let subgraphVersion = SubgraphVersion.load(subgraph.currentVersion) as SubgraphVersion
  let subgraphDeploymentID = subgraphVersion.subgraphDeployment

  let hexHash = changetype<Bytes>(addQm(event.params.subgraphMetadata))
  let base58Hash = hexHash.toBase58()

  let eventEntity = new SubgraphMetadataUpdatedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraph.id
  eventEntity.accounts = accounts
  eventEntity.ipfsFileHash = base58Hash
  eventEntity.save()
}

// - event: SignalMinted(indexed uint256,indexed address,uint256,uint256,uint256)
//   handler: handleNSignalMintedV2

export function handleNSignalMintedV2(event: SignalMinted): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let curatorID = event.params.curator.toHexString()
  let bigIntID = event.params.subgraphID
  let subgraphID = convertBigIntSubgraphIDToBase58(bigIntID)
  let accounts = new Array<String>()
  accounts.push(curatorID)

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  let nameSignalId = joinID([curatorID, subgraphID])

  let eventEntity = new NSignalMintedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.curator = curatorID
  eventEntity.accounts = accounts
  eventEntity.nameSignalId = nameSignalId
  eventEntity.nameSignal = event.params.nSignalCreated
  eventEntity.versionSignal = event.params.vSignalCreated
  eventEntity.tokens = event.params.tokensDeposited
  eventEntity.save()
}

// - event: SignalBurned(indexed uint256,indexed address,uint256,uint256,uint256)
//   handler: handleNSignalBurnedV2

export function handleNSignalBurnedV2(event: SignalBurned): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let curatorID = event.params.curator.toHexString()
  let bigIntID = event.params.subgraphID
  let subgraphID = convertBigIntSubgraphIDToBase58(bigIntID)
  let accounts = new Array<String>()
  accounts.push(curatorID)

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  let nameSignalId = joinID([curatorID, subgraphID])

  let eventEntity = new NSignalBurnedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.curator = curatorID
  eventEntity.accounts = accounts
  eventEntity.nameSignalId = nameSignalId
  eventEntity.nameSignal = event.params.nSignalBurnt
  eventEntity.versionSignal = event.params.vSignalBurnt
  eventEntity.tokens = event.params.tokensReceived
  eventEntity.save()
}

// - event: GRTWithdrawn(indexed uint256,indexed address,uint256,uint256)
//   handler: handleGRTWithdrawnV2

export function handleGRTWithdrawnV2(event: GRTWithdrawn1): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let bigIntID = event.params.subgraphID
  let curatorID = event.params.curator.toHexString()
  let subgraphID = convertBigIntSubgraphIDToBase58(bigIntID)
  let accounts = new Array<String>()
  accounts.push(curatorID)

  // Update the curator and his account
  createOrLoadGraphAccount(curatorID)
  createOrLoadCurator(curatorID)
  let nameSignalId = joinID([curatorID, subgraphID])

  let eventEntity = new GRTWithdrawnEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraphID
  eventEntity.curator = curatorID
  eventEntity.accounts = accounts
  eventEntity.nameSignalId = nameSignalId
  eventEntity.nameSignal = event.params.nSignalBurnt
  eventEntity.tokens = event.params.withdrawnGRT
  eventEntity.save()
}

// - event: SubgraphUpgraded(indexed uint256,uint256,uint256,indexed bytes32)
//   handler: handleSubgraphUpgraded

export function handleSubgraphUpgraded(event: SubgraphUpgraded): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let bigIntID = event.params.subgraphID
  let subgraphID = convertBigIntSubgraphIDToBase58(bigIntID)
}

// - event: SubgraphVersionUpdated(indexed uint256,indexed bytes32,bytes32)
//   handler: handleSubgraphVersionUpdated

// Might need to workaround this one, because of the ordering in subgraph creation scenario,
// we need to run this same code in SubgraphPublished (v2) too, and flag it so some of these executions
// don't create bugs (like double counting/creating versions)

export function handleSubgraphVersionUpdated(event: SubgraphVersionUpdated): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
  let bigIntID = event.params.subgraphID
  let graphAccountID = event.transaction.from.toHexString()
  let subgraphID = convertBigIntSubgraphIDToBase58(bigIntID)
  let versionID: string
  let versionNumber: number
  let accounts = new Array<String>()
  accounts.push(graphAccountID)

  // Update subgraph
  let subgraph = createOrLoadSubgraph(subgraphID, event.transaction.from)

  versionID = joinID([subgraphID, subgraph.versionCount.toString()])
  subgraph.currentVersion = versionID
  subgraph.versionCount = subgraph.versionCount.plus(BigInt.fromI32(1))
  subgraph.save()

  // Creates Graph Account, if needed
  createOrLoadGraphAccount(graphAccountID)

  // Create subgraph deployment, if needed. Can happen if the deployment has never been staked on
  let deployment = createOrLoadSubgraphDeployment(event.params.subgraphDeploymentID.toHexString())

  // Create/load subgraph version
  let subgraphVersion = SubgraphVersion.load(versionID)
  if(subgraphVersion == null) {
    subgraphVersion = new SubgraphVersion(versionID)
  }
  subgraphVersion.subgraph = subgraphID
  subgraphVersion.subgraphDeployment = deployment.id
  subgraphVersion.version = versionNumber as i32
  subgraphVersion.save()

  let eventEntity = new NewSubgraphVersionPublishedEvent(eventId)
  eventEntity.timestamp = event.block.timestamp
  eventEntity.blockNumber = event.block.number
  eventEntity.tx_hash = event.transaction.hash
  eventEntity.subgraph = subgraph.id
  eventEntity.version = subgraphVersion.id
  eventEntity.deployment = deployment.id
  eventEntity.accounts = accounts
  eventEntity.save()
}

// - event: LegacySubgraphClaimed(indexed address,uint256)
//   handler: handleLegacySubgraphClaimed

export function handleLegacySubgraphClaimed(event: LegacySubgraphClaimed): void {
  let eventId = event.transaction.hash.toHexString().concat('-').concat(event.logIndex.toString())
}

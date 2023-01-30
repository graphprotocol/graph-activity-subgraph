import { BigInt, ByteArray, Address, Bytes, crypto, log, BigDecimal } from '@graphprotocol/graph-ts'
import {
  SubgraphDeployment,
  Indexer,
  Curator,
  SubgraphVersion,
  Subgraph,
  GraphAccount,
  Delegator,
  DelegatedStake,
} from '../types/schema'

export function createOrLoadSubgraph(subgraphID: string, owner: Address): Subgraph {
  let subgraph = Subgraph.load(subgraphID)
  if (subgraph == null) {
    subgraph = new Subgraph(subgraphID)
    subgraph.owner = owner.toHexString()
    subgraph.versionCount = BigInt.fromI32(0)
  }
  return subgraph as Subgraph
}

export function createOrLoadSubgraphDeployment(subgraphID: string): SubgraphDeployment {
  let deployment = SubgraphDeployment.load(subgraphID)
  if (deployment == null) {
    let prefix = '1220'
    deployment = new SubgraphDeployment(subgraphID)
    deployment.ipfsHash = Bytes.fromHexString(prefix.concat(subgraphID.slice(2))).toBase58()
    deployment.save()
  }
  return deployment as SubgraphDeployment
}

export function createOrLoadIndexer(id: string): Indexer {
  let indexer = Indexer.load(id)
  if (indexer == null) {
    indexer = new Indexer(id)
    indexer.account = id
    indexer.save()
  }
  return indexer as Indexer
}

export function createOrLoadDelegator(id: string): Delegator {
  let delegator = Delegator.load(id)
  if (delegator == null) {
    delegator = new Delegator(id)
    delegator.account = id
    delegator.save()
  }
  return delegator as Delegator
}

export function createOrLoadDelegatedStake(delegator: string, indexer: string): DelegatedStake {
  let id = joinID([delegator, indexer])
  let delegatedStake = DelegatedStake.load(id)
  if (delegatedStake == null) {
    delegatedStake = new DelegatedStake(id)
    delegatedStake.indexer = indexer
    delegatedStake.delegator = delegator

    delegatedStake.save()
  }
  return delegatedStake as DelegatedStake
}
export function createOrLoadCurator(id: string): Curator {
  let curator = Curator.load(id)
  if (curator == null) {
    curator = new Curator(id)
    curator.account = id

    curator.save()
  }
  return curator as Curator
}
//
// export function createOrLoadSignal(
//   curator: string,
//   subgraphDeploymentID: string,
// ): Signal {
//   let signalID = joinID([curator, subgraphDeploymentID])
//   let signal = Signal.load(signalID)
//   if (signal == null) {
//     signal = new Signal(signalID)
//     signal.curator = curator
//     signal.subgraphDeployment = subgraphDeploymentID
//     signal.save()
//   }
//   return signal as Signal
// }
//
// export function createOrLoadNameSignal(
//   curator: string,
//   subgraphID: string,
// ): NameSignal {
//   let nameSignalID = joinID([curator, subgraphID])
//   let nameSignal = NameSignal.load(nameSignalID)
//   if (nameSignal == null) {
//     nameSignal = new NameSignal(nameSignalID)
//     nameSignal.curator = curator
//     nameSignal.subgraph = subgraphID
//     nameSignal.save()
//   }
//   return nameSignal as NameSignal
// }

export function createOrLoadGraphAccount(id: string): GraphAccount {
  let graphAccount = GraphAccount.load(id)
  if (graphAccount == null) {
    graphAccount = new GraphAccount(id)
    graphAccount.save()
  }
  return graphAccount as GraphAccount
}

export function addQm(a: ByteArray): ByteArray {
  let out = new Uint8Array(34)
  out[0] = 0x12
  out[1] = 0x20
  for (let i = 0; i < 32; i++) {
    out[i + 2] = a[i]
  }
  return changetype<ByteArray>(out)
}

// Helper for concatenating two byte arrays
export function concatByteArrays(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length)
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i]
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j]
  }
  return out as ByteArray
}

export function getVersionNumber(
  graphAccount: string,
  subgraphNumber: string,
  versionNumber: BigInt,
): BigInt {
  // create versionID. start at version 1
  // TODO - should I start it at 0?
  let versionID = joinID([graphAccount, subgraphNumber, versionNumber.toString()])
  let version = SubgraphVersion.load(versionID)
  // recursion until you get the right version
  if (version != null) {
    versionNumber = versionNumber.plus(BigInt.fromI32(1))
    getVersionNumber(graphAccount, subgraphNumber, versionNumber)
  }
  return versionNumber
}

export function joinID(pieces: Array<string>): string {
  return pieces.join('-')
}

function min(a: BigDecimal, b: BigDecimal): BigDecimal {
  return a < b ? a : b
}

function max(a: BigDecimal, b: BigDecimal): BigDecimal {
  return a > b ? a : b
}

export function convertBigIntSubgraphIDToBase58(bigIntRepresentation: BigInt): String {
  // Might need to unpad the BigInt since `fromUnsignedBytes` pads one byte with a zero.
  // Although for the events where the uint256 is provided, we probably don't need to unpad.
  let hexString = bigIntRepresentation.toHexString()
  if (hexString.length % 2 != 0) {
    log.error('Hex string not even, hex: {}, original: {}. Padding it to even length', [
      hexString,
      bigIntRepresentation.toString(),
    ])
    hexString = '0x0' + hexString.slice(2)
  }
  let bytes = ByteArray.fromHexString(hexString)
  return bytes.toBase58()
}

export function getSubgraphID(graphAccountStr: String, subgraphNumber: BigInt): BigInt {
  let subgraphNumberStr = subgraphNumber.toHexString().slice(2)
  let number = subgraphNumberStr.padStart(64, '0')
  let unhashedSubgraphID = graphAccountStr.concat(number)
  let hashedId = Bytes.fromByteArray(crypto.keccak256(ByteArray.fromHexString(unhashedSubgraphID)))
  let bigIntRepresentation = BigInt.fromUnsignedBytes(changetype<Bytes>(hashedId.reverse()))
  return bigIntRepresentation
}

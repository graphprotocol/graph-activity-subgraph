import { Address, BigInt, Bytes, ByteArray, crypto, ethereum } from '@graphprotocol/graph-ts'
import { addresses } from '../config/addresses'
import { eventWith, INDEXER, PAYER, OPERATOR, ALLOCATION, DEPLOYMENT, HASH } from './fixtures'
export const DISPUTE_ID = Bytes.fromHexString(
  '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
)
export const SECOND_DISPUTE_ID = Bytes.fromHexString(
  '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
)
export const COLLECTION_ID = Bytes.fromHexString(
  '0x000000000000000000000000' + ALLOCATION.toHexString().slice(2),
)
export function service(): Address {
  return Address.fromString(addresses.subgraphService)
}
export function escrow(): Address {
  return Address.fromString(addresses.paymentsEscrow)
}
export function tally(): Address {
  return Address.fromString(addresses.graphTallyCollector)
}

import { DisputeAccepted as DDisputeAcceptedLog } from '../src/types/DisputeManager/DisputeManager'
export function DDisputeAccepted(index: i32 = 1): DDisputeAcceptedLog {
  return eventWith<DDisputeAcceptedLog>(
    [
      new ethereum.EventParam('disputeID', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    index,
    Address.fromString(addresses.disputeManager),
  )
}
export function DDisputeAcceptedReceipt(event: DDisputeAcceptedLog): ethereum.Log {
  return asLog(event, 'DisputeAccepted(bytes32,address,address,uint256)', [0, 1, 2])
}

import { DisputeDrawn as DDisputeDrawnLog } from '../src/types/DisputeManager/DisputeManager'
export function DDisputeDrawn(index: i32 = 1): DDisputeDrawnLog {
  return eventWith<DDisputeDrawnLog>(
    [
      new ethereum.EventParam('disputeID', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    index,
    Address.fromString(addresses.disputeManager),
  )
}
export function DDisputeDrawnReceipt(event: DDisputeDrawnLog): ethereum.Log {
  return asLog(event, 'DisputeDrawn(bytes32,address,address,uint256)', [0, 1, 2])
}

import { DisputeLinked as DDisputeLinkedLog } from '../src/types/DisputeManager/DisputeManager'
export function DDisputeLinked(index: i32 = 1): DDisputeLinkedLog {
  return eventWith<DDisputeLinkedLog>(
    [
      new ethereum.EventParam('disputeID1', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('disputeID2', ethereum.Value.fromFixedBytes(SECOND_DISPUTE_ID)),
    ],
    index,
    Address.fromString(addresses.disputeManager),
  )
}
export function DDisputeLinkedReceipt(event: DDisputeLinkedLog): ethereum.Log {
  return asLog(event, 'DisputeLinked(bytes32,bytes32)', [0, 1])
}

import { DisputeRejected as DDisputeRejectedLog } from '../src/types/DisputeManager/DisputeManager'
export function DDisputeRejected(index: i32 = 1): DDisputeRejectedLog {
  return eventWith<DDisputeRejectedLog>(
    [
      new ethereum.EventParam('disputeID', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    index,
    Address.fromString(addresses.disputeManager),
  )
}
export function DDisputeRejectedReceipt(event: DDisputeRejectedLog): ethereum.Log {
  return asLog(event, 'DisputeRejected(bytes32,address,address,uint256)', [0, 1, 2])
}

import { IndexingDisputeCreated as DIndexingDisputeCreatedLog } from '../src/types/DisputeManager/DisputeManager'
export function DIndexingDisputeCreated(index: i32 = 1): DIndexingDisputeCreatedLog {
  return eventWith<DIndexingDisputeCreatedLog>(
    [
      new ethereum.EventParam('disputeID', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam('allocationID', ethereum.Value.fromAddress(ALLOCATION)),
    ],
    index,
    Address.fromString(addresses.disputeManager),
  )
}
export function DIndexingDisputeCreatedReceipt(event: DIndexingDisputeCreatedLog): ethereum.Log {
  return asLog(event, 'IndexingDisputeCreated(bytes32,address,address,uint256,address)', [0, 1, 2])
}

import { QueryDisputeCreated as DQueryDisputeCreatedLog } from '../src/types/DisputeManager/DisputeManager'
export function DQueryDisputeCreated(index: i32 = 1): DQueryDisputeCreatedLog {
  return eventWith<DQueryDisputeCreatedLog>(
    [
      new ethereum.EventParam('disputeID', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam('subgraphDeploymentID', ethereum.Value.fromFixedBytes(DEPLOYMENT)),
      new ethereum.EventParam('attestation', ethereum.Value.fromBytes(HASH)),
    ],
    index,
    Address.fromString(addresses.disputeManager),
  )
}
export function DQueryDisputeCreatedReceipt(event: DQueryDisputeCreatedLog): ethereum.Log {
  return asLog(
    event,
    'QueryDisputeCreated(bytes32,address,address,uint256,bytes32,bytes)',
    [0, 1, 2],
  )
}

import { DisputeAccepted as HDisputeAcceptedLog } from '../src/types/HorizonDisputeManager/HorizonDisputeManager'
export function HDisputeAccepted(index: i32 = 1): HDisputeAcceptedLog {
  return eventWith<HDisputeAcceptedLog>(
    [
      new ethereum.EventParam('disputeId', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    index,
    Address.fromString(addresses.horizonDisputeManager),
  )
}
export function HDisputeAcceptedReceipt(event: HDisputeAcceptedLog): ethereum.Log {
  return asLog(event, 'DisputeAccepted(bytes32,address,address,uint256)', [0, 1, 2])
}

import { DisputeCancelled as HDisputeCancelledLog } from '../src/types/HorizonDisputeManager/HorizonDisputeManager'
export function HDisputeCancelled(index: i32 = 1): HDisputeCancelledLog {
  return eventWith<HDisputeCancelledLog>(
    [
      new ethereum.EventParam('disputeId', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    index,
    Address.fromString(addresses.horizonDisputeManager),
  )
}
export function HDisputeCancelledReceipt(event: HDisputeCancelledLog): ethereum.Log {
  return asLog(event, 'DisputeCancelled(bytes32,address,address,uint256)', [0, 1, 2])
}

import { DisputeDrawn as HDisputeDrawnLog } from '../src/types/HorizonDisputeManager/HorizonDisputeManager'
export function HDisputeDrawn(index: i32 = 1): HDisputeDrawnLog {
  return eventWith<HDisputeDrawnLog>(
    [
      new ethereum.EventParam('disputeId', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    index,
    Address.fromString(addresses.horizonDisputeManager),
  )
}
export function HDisputeDrawnReceipt(event: HDisputeDrawnLog): ethereum.Log {
  return asLog(event, 'DisputeDrawn(bytes32,address,address,uint256)', [0, 1, 2])
}

import { DisputeLinked as HDisputeLinkedLog } from '../src/types/HorizonDisputeManager/HorizonDisputeManager'
export function HDisputeLinked(index: i32 = 1): HDisputeLinkedLog {
  return eventWith<HDisputeLinkedLog>(
    [
      new ethereum.EventParam('disputeId1', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('disputeId2', ethereum.Value.fromFixedBytes(SECOND_DISPUTE_ID)),
    ],
    index,
    Address.fromString(addresses.horizonDisputeManager),
  )
}
export function HDisputeLinkedReceipt(event: HDisputeLinkedLog): ethereum.Log {
  return asLog(event, 'DisputeLinked(bytes32,bytes32)', [0, 1])
}

import { DisputeRejected as HDisputeRejectedLog } from '../src/types/HorizonDisputeManager/HorizonDisputeManager'
export function HDisputeRejected(index: i32 = 1): HDisputeRejectedLog {
  return eventWith<HDisputeRejectedLog>(
    [
      new ethereum.EventParam('disputeId', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    index,
    Address.fromString(addresses.horizonDisputeManager),
  )
}
export function HDisputeRejectedReceipt(event: HDisputeRejectedLog): ethereum.Log {
  return asLog(event, 'DisputeRejected(bytes32,address,address,uint256)', [0, 1, 2])
}

import { IndexingDisputeCreated as HIndexingDisputeCreatedLog } from '../src/types/HorizonDisputeManager/HorizonDisputeManager'
export function HIndexingDisputeCreated(index: i32 = 1): HIndexingDisputeCreatedLog {
  return eventWith<HIndexingDisputeCreatedLog>(
    [
      new ethereum.EventParam('disputeId', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam('allocationId', ethereum.Value.fromAddress(ALLOCATION)),
      new ethereum.EventParam('poi', ethereum.Value.fromFixedBytes(HASH)),
      new ethereum.EventParam(
        'blockNumber',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100)),
      ),
      new ethereum.EventParam(
        'stakeSnapshot',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(500)),
      ),
      new ethereum.EventParam(
        'cancellableAt',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000)),
      ),
    ],
    index,
    Address.fromString(addresses.horizonDisputeManager),
  )
}
export function HIndexingDisputeCreatedReceipt(event: HIndexingDisputeCreatedLog): ethereum.Log {
  return asLog(
    event,
    'IndexingDisputeCreated(bytes32,address,address,uint256,address,bytes32,uint256,uint256,uint256)',
    [0, 1, 2],
  )
}

import { LegacyDisputeCreated as HLegacyDisputeCreatedLog } from '../src/types/HorizonDisputeManager/HorizonDisputeManager'
export function HLegacyDisputeCreated(index: i32 = 1): HLegacyDisputeCreatedLog {
  return eventWith<HLegacyDisputeCreatedLog>(
    [
      new ethereum.EventParam('disputeId', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('allocationId', ethereum.Value.fromAddress(ALLOCATION)),
      new ethereum.EventParam('tokensSlash', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(80))),
      new ethereum.EventParam(
        'tokensRewards',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(8)),
      ),
    ],
    index,
    Address.fromString(addresses.horizonDisputeManager),
  )
}
export function HLegacyDisputeCreatedReceipt(event: HLegacyDisputeCreatedLog): ethereum.Log {
  return asLog(
    event,
    'LegacyDisputeCreated(bytes32,address,address,address,uint256,uint256)',
    [0, 1, 2],
  )
}

import { QueryDisputeCreated as HQueryDisputeCreatedLog } from '../src/types/HorizonDisputeManager/HorizonDisputeManager'
export function HQueryDisputeCreated(index: i32 = 1): HQueryDisputeCreatedLog {
  return eventWith<HQueryDisputeCreatedLog>(
    [
      new ethereum.EventParam('disputeId', ethereum.Value.fromFixedBytes(DISPUTE_ID)),
      new ethereum.EventParam('indexer', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('fisherman', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam('subgraphDeploymentId', ethereum.Value.fromFixedBytes(DEPLOYMENT)),
      new ethereum.EventParam('attestation', ethereum.Value.fromBytes(HASH)),
      new ethereum.EventParam(
        'stakeSnapshot',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(500)),
      ),
      new ethereum.EventParam(
        'cancellableAt',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000)),
      ),
    ],
    index,
    Address.fromString(addresses.horizonDisputeManager),
  )
}
export function HQueryDisputeCreatedReceipt(event: HQueryDisputeCreatedLog): ethereum.Log {
  return asLog(
    event,
    'QueryDisputeCreated(bytes32,address,address,uint256,bytes32,bytes,uint256,uint256)',
    [0, 1, 2],
  )
}

import { CancelThaw as ECancelThawLog } from '../src/types/PaymentsEscrow/PaymentsEscrow'
export function ECancelThaw(index: i32 = 1): ECancelThawLog {
  return eventWith<ECancelThawLog>(
    [
      new ethereum.EventParam('payer', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('collector', ethereum.Value.fromAddress(tally())),
      new ethereum.EventParam('receiver', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam(
        'tokensThawing',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100)),
      ),
      new ethereum.EventParam(
        'thawEndTimestamp',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2000)),
      ),
    ],
    index,
    Address.fromString(addresses.paymentsEscrow),
  )
}
export function ECancelThawReceipt(event: ECancelThawLog): ethereum.Log {
  return asLog(event, 'CancelThaw(address,address,address,uint256,uint256)', [0, 1, 2])
}

import { Deposit as EDepositLog } from '../src/types/PaymentsEscrow/PaymentsEscrow'
export function EDeposit(index: i32 = 1): EDepositLog {
  return eventWith<EDepositLog>(
    [
      new ethereum.EventParam('payer', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('collector', ethereum.Value.fromAddress(tally())),
      new ethereum.EventParam('receiver', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    index,
    Address.fromString(addresses.paymentsEscrow),
  )
}
export function EDepositReceipt(event: EDepositLog): ethereum.Log {
  return asLog(event, 'Deposit(address,address,address,uint256)', [0, 1, 2])
}

import { EscrowCollected as EEscrowCollectedLog } from '../src/types/PaymentsEscrow/PaymentsEscrow'
export function EEscrowCollected(index: i32 = 1): EEscrowCollectedLog {
  return eventWith<EEscrowCollectedLog>(
    [
      new ethereum.EventParam('paymentType', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))),
      new ethereum.EventParam('payer', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('collector', ethereum.Value.fromAddress(tally())),
      new ethereum.EventParam('receiver', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam('receiverDestination', ethereum.Value.fromAddress(OPERATOR)),
    ],
    index,
    Address.fromString(addresses.paymentsEscrow),
  )
}
export function EEscrowCollectedReceipt(event: EEscrowCollectedLog): ethereum.Log {
  return asLog(event, 'EscrowCollected(uint8,address,address,address,uint256,address)', [0, 1, 2])
}

import { Thaw as EThawLog } from '../src/types/PaymentsEscrow/PaymentsEscrow'
export function EThaw(index: i32 = 1): EThawLog {
  return eventWith<EThawLog>(
    [
      new ethereum.EventParam('payer', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('collector', ethereum.Value.fromAddress(tally())),
      new ethereum.EventParam('receiver', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam(
        'thawEndTimestamp',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2000)),
      ),
    ],
    index,
    Address.fromString(addresses.paymentsEscrow),
  )
}
export function EThawReceipt(event: EThawLog): ethereum.Log {
  return asLog(event, 'Thaw(address,address,address,uint256,uint256)', [0, 1, 2])
}

import { Withdraw as EWithdrawLog } from '../src/types/PaymentsEscrow/PaymentsEscrow'
export function EWithdraw(index: i32 = 1): EWithdrawLog {
  return eventWith<EWithdrawLog>(
    [
      new ethereum.EventParam('payer', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('collector', ethereum.Value.fromAddress(tally())),
      new ethereum.EventParam('receiver', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    index,
    Address.fromString(addresses.paymentsEscrow),
  )
}
export function EWithdrawReceipt(event: EWithdrawLog): ethereum.Log {
  return asLog(event, 'Withdraw(address,address,address,uint256)', [0, 1, 2])
}

import { PaymentCollected as TPaymentCollectedLog } from '../src/types/GraphTallyCollector/GraphTallyCollector'
export function TPaymentCollected(index: i32 = 1): TPaymentCollectedLog {
  return eventWith<TPaymentCollectedLog>(
    [
      new ethereum.EventParam('paymentType', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))),
      new ethereum.EventParam('collectionId', ethereum.Value.fromFixedBytes(COLLECTION_ID)),
      new ethereum.EventParam('payer', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('receiver', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('dataService', ethereum.Value.fromAddress(service())),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
    ],
    index,
    Address.fromString(addresses.graphTallyCollector),
  )
}
export function TPaymentCollectedReceipt(event: TPaymentCollectedLog): ethereum.Log {
  return asLog(event, 'PaymentCollected(uint8,bytes32,address,address,address,uint256)', [1, 2, 4])
}

import { SignerAuthorized as TSignerAuthorizedLog } from '../src/types/GraphTallyCollector/GraphTallyCollector'
export function TSignerAuthorized(index: i32 = 1): TSignerAuthorizedLog {
  return eventWith<TSignerAuthorizedLog>(
    [
      new ethereum.EventParam('authorizer', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('signer', ethereum.Value.fromAddress(OPERATOR)),
    ],
    index,
    Address.fromString(addresses.graphTallyCollector),
  )
}
export function TSignerAuthorizedReceipt(event: TSignerAuthorizedLog): ethereum.Log {
  return asLog(event, 'SignerAuthorized(address,address)', [0, 1])
}

import { SignerRevoked as TSignerRevokedLog } from '../src/types/GraphTallyCollector/GraphTallyCollector'
export function TSignerRevoked(index: i32 = 1): TSignerRevokedLog {
  return eventWith<TSignerRevokedLog>(
    [
      new ethereum.EventParam('authorizer', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('signer', ethereum.Value.fromAddress(OPERATOR)),
    ],
    index,
    Address.fromString(addresses.graphTallyCollector),
  )
}
export function TSignerRevokedReceipt(event: TSignerRevokedLog): ethereum.Log {
  return asLog(event, 'SignerRevoked(address,address)', [0, 1])
}

import { SignerThawCanceled as TSignerThawCanceledLog } from '../src/types/GraphTallyCollector/GraphTallyCollector'
export function TSignerThawCanceled(index: i32 = 1): TSignerThawCanceledLog {
  return eventWith<TSignerThawCanceledLog>(
    [
      new ethereum.EventParam('authorizer', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('signer', ethereum.Value.fromAddress(OPERATOR)),
      new ethereum.EventParam(
        'thawEndTimestamp',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2000)),
      ),
    ],
    index,
    Address.fromString(addresses.graphTallyCollector),
  )
}
export function TSignerThawCanceledReceipt(event: TSignerThawCanceledLog): ethereum.Log {
  return asLog(event, 'SignerThawCanceled(address,address,uint256)', [0, 1])
}

import { SignerThawing as TSignerThawingLog } from '../src/types/GraphTallyCollector/GraphTallyCollector'
export function TSignerThawing(index: i32 = 1): TSignerThawingLog {
  return eventWith<TSignerThawingLog>(
    [
      new ethereum.EventParam('authorizer', ethereum.Value.fromAddress(PAYER)),
      new ethereum.EventParam('signer', ethereum.Value.fromAddress(OPERATOR)),
      new ethereum.EventParam(
        'thawEndTimestamp',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2000)),
      ),
    ],
    index,
    Address.fromString(addresses.graphTallyCollector),
  )
}
export function TSignerThawingReceipt(event: TSignerThawingLog): ethereum.Log {
  return asLog(event, 'SignerThawing(address,address,uint256)', [0, 1])
}

import { GraphPaymentCollected as GGraphPaymentCollectedLog } from '../src/types/GraphPayments/GraphPayments'
export function GGraphPaymentCollected(index: i32 = 1): GGraphPaymentCollectedLog {
  return eventWith<GGraphPaymentCollectedLog>(
    [
      new ethereum.EventParam('paymentType', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))),
      new ethereum.EventParam('payer', ethereum.Value.fromAddress(escrow())),
      new ethereum.EventParam('receiver', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('dataService', ethereum.Value.fromAddress(service())),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam(
        'tokensProtocol',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)),
      ),
      new ethereum.EventParam(
        'tokensDataService',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2)),
      ),
      new ethereum.EventParam(
        'tokensDelegationPool',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(3)),
      ),
      new ethereum.EventParam(
        'tokensReceiver',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(94)),
      ),
    ],
    index,
    Address.fromString(addresses.graphPayments),
  )
}
export function GGraphPaymentCollectedReceipt(event: GGraphPaymentCollectedLog): ethereum.Log {
  return asLog(
    event,
    'GraphPaymentCollected(uint8,address,address,address,uint256,uint256,uint256,uint256,uint256)',
    [0, 1, 3],
  )
}

import { GraphPaymentCollected1 as GGraphPaymentCollected1Log } from '../src/types/GraphPayments/GraphPayments'
export function GGraphPaymentCollected1(index: i32 = 1): GGraphPaymentCollected1Log {
  return eventWith<GGraphPaymentCollected1Log>(
    [
      new ethereum.EventParam('paymentType', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(0))),
      new ethereum.EventParam('payer', ethereum.Value.fromAddress(escrow())),
      new ethereum.EventParam('receiver', ethereum.Value.fromAddress(INDEXER)),
      new ethereum.EventParam('dataService', ethereum.Value.fromAddress(service())),
      new ethereum.EventParam('tokens', ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(100))),
      new ethereum.EventParam(
        'tokensProtocol',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1)),
      ),
      new ethereum.EventParam(
        'tokensDataService',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(2)),
      ),
      new ethereum.EventParam(
        'tokensDelegationPool',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(3)),
      ),
      new ethereum.EventParam(
        'tokensReceiver',
        ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(94)),
      ),
      new ethereum.EventParam('receiverDestination', ethereum.Value.fromAddress(OPERATOR)),
    ],
    index,
    Address.fromString(addresses.graphPayments),
  )
}
export function GGraphPaymentCollected1Receipt(event: GGraphPaymentCollected1Log): ethereum.Log {
  return asLog(
    event,
    'GraphPaymentCollected(uint8,address,address,address,uint256,uint256,uint256,uint256,uint256,address)',
    [0, 1, 3],
  )
}

export function asLog(event: ethereum.Event, signature: string, indexed: i32[]): ethereum.Log {
  let topics: Bytes[] = [Bytes.fromByteArray(crypto.keccak256(ByteArray.fromUTF8(signature)))]
  let data = new ethereum.Tuple()
  for (let i = 0; i < event.parameters.length; i++) {
    let value = event.parameters[i].value
    if (indexed.indexOf(i) >= 0) topics.push(ethereum.encode(value)!)
    else data.push(value)
  }
  return new ethereum.Log(
    event.address,
    topics,
    ethereum.encode(ethereum.Value.fromTuple(data))!,
    HASH,
    HASH,
    HASH,
    BigInt.zero(),
    event.logIndex,
    event.logIndex,
    '',
    null,
  )
}

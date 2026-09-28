import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { addresses } from '../../config/addresses'
import { isLog, topicAddress, wordAddress, wordBytes, wordInt } from './receiptLogs'

export const DISTRIBUTION: i32 = 1
export const ESCROW: i32 = 2
export const TALLY: i32 = 3
export const QUERY_FEES: i32 = 4
const ZERO = Address.zero()

// Receipt context only: this is not persisted state and never needs earlier blocks.
export class PaymentLog {
  kind: i32
  logIndex: BigInt
  paymentType: i32 = 0
  payer: Address = ZERO
  receiver: Address = ZERO
  service: Address = ZERO
  collector: Address = ZERO
  tokens: BigInt = BigInt.zero()
  collectionId: Bytes | null = null
  deployment: Bytes | null = null
  destination: Address | null = null
  protocol: BigInt | null = null
  serviceTokens: BigInt | null = null
  delegation: BigInt | null = null
  receiverTokens: BigInt | null = null
  constructor(kind: i32, logIndex: BigInt) {
    this.kind = kind
    this.logIndex = logIndex
  }
}

export function paymentLogs(event: ethereum.Event, own: PaymentLog): PaymentLog[] {
  let result: PaymentLog[] = []
  if (event.receipt !== null) {
    let logs = event.receipt!.logs
    for (let i = 0; i < logs.length; i++) {
      let log = logs[i]
      if (log.logIndex.equals(own.logIndex)) continue
      let item: PaymentLog | null = null
      let distribution = isLog(
        log,
        addresses.graphPayments,
        'GraphPaymentCollected(uint8,address,address,address,uint256,uint256,uint256,uint256,uint256)',
        4,
        6,
      )
      let withDestination = isLog(
        log,
        addresses.graphPayments,
        'GraphPaymentCollected(uint8,address,address,address,uint256,uint256,uint256,uint256,uint256,address)',
        4,
        7,
      )
      if (distribution || withDestination) {
        item = new PaymentLog(DISTRIBUTION, log.logIndex)
        item.paymentType = BigInt.fromUnsignedBytes(
          changetype<Bytes>(log.topics[1].slice(0).reverse()),
        ).toI32()
        item.payer = topicAddress(log, 2)
        item.service = topicAddress(log, 3)
        item.receiver = wordAddress(log, 0)
        item.tokens = wordInt(log, 1)
        item.protocol = wordInt(log, 2)
        item.serviceTokens = wordInt(log, 3)
        item.delegation = wordInt(log, 4)
        item.receiverTokens = wordInt(log, 5)
        if (withDestination) item.destination = wordAddress(log, 6)
      } else if (
        isLog(
          log,
          addresses.paymentsEscrow,
          'EscrowCollected(uint8,address,address,address,uint256,address)',
          4,
          3,
        )
      ) {
        item = new PaymentLog(ESCROW, log.logIndex)
        item.paymentType = BigInt.fromUnsignedBytes(
          changetype<Bytes>(log.topics[1].slice(0).reverse()),
        ).toI32()
        item.payer = topicAddress(log, 2)
        item.collector = topicAddress(log, 3)
        item.receiver = wordAddress(log, 0)
        item.tokens = wordInt(log, 1)
        item.destination = wordAddress(log, 2)
      } else if (
        isLog(
          log,
          addresses.graphTallyCollector,
          'PaymentCollected(uint8,bytes32,address,address,address,uint256)',
          4,
          3,
        )
      ) {
        item = new PaymentLog(TALLY, log.logIndex)
        item.paymentType = wordInt(log, 0).toI32()
        item.collectionId = log.topics[1]
        item.payer = topicAddress(log, 2)
        item.service = topicAddress(log, 3)
        item.receiver = wordAddress(log, 1)
        item.tokens = wordInt(log, 2)
        item.collector = log.address
      } else if (
        isLog(
          log,
          addresses.subgraphService,
          'QueryFeesCollected(address,address,address,bytes32,uint256,uint256)',
          4,
          3,
        )
      ) {
        item = new PaymentLog(QUERY_FEES, log.logIndex)
        item.receiver = topicAddress(log, 1)
        item.payer = topicAddress(log, 2)
        item.collectionId = log.topics[3]
        item.service = log.address
        item.deployment = wordBytes(log, 0)
        item.tokens = wordInt(log, 1)
      }
      if (item !== null) result.push(item)
    }
  }
  result.push(own)
  return result
}

// Pair adjacent layers reciprocally. In a batch, two identical amounts still
// belong to distinct operations; never deduplicate by transaction/amount alone.
function adjacent(
  logs: PaymentLog[],
  own: PaymentLog,
  kind: i32,
  after: boolean,
): PaymentLog | null {
  let found: PaymentLog | null = null
  for (let i = 0; i < logs.length; i++) {
    let item = logs[i]
    if (
      item.kind != kind ||
      (after ? item.logIndex.le(own.logIndex) : item.logIndex.ge(own.logIndex))
    )
      continue
    if (
      found === null ||
      (after ? item.logIndex.lt(found.logIndex) : item.logIndex.gt(found.logIndex))
    )
      found = item
  }
  return found
}

function samePayment(a: PaymentLog, b: PaymentLog): boolean {
  return (
    a.paymentType == b.paymentType && a.receiver.equals(b.receiver) && a.tokens.equals(b.tokens)
  )
}

export function escrowForDistribution(graph: PaymentLog, logs: PaymentLog[]): PaymentLog | null {
  if (graph.payer.toHexString() != addresses.paymentsEscrow.toLowerCase()) return null
  let escrow = adjacent(logs, graph, ESCROW, true)
  if (escrow === null || !samePayment(graph, escrow)) return null
  let previous = adjacent(logs, escrow, DISTRIBUTION, false)
  if (previous === null || !previous.logIndex.equals(graph.logIndex)) return null
  if (
    graph.destination !== null &&
    escrow.destination !== null &&
    !graph.destination!.equals(escrow.destination!)
  )
    return null
  return escrow
}

export function distributionForEscrow(escrow: PaymentLog, logs: PaymentLog[]): PaymentLog | null {
  let graph = adjacent(logs, escrow, DISTRIBUTION, false)
  if (graph === null) return null
  let match = escrowForDistribution(graph, logs)
  return match !== null && match.logIndex.equals(escrow.logIndex) ? graph : null
}

export function tallyForEscrow(escrow: PaymentLog, logs: PaymentLog[]): PaymentLog | null {
  if (escrow.collector.toHexString() != addresses.graphTallyCollector.toLowerCase()) return null
  let tally = adjacent(logs, escrow, TALLY, true)
  if (tally === null || !samePayment(escrow, tally) || !escrow.payer.equals(tally.payer))
    return null
  let previous = adjacent(logs, tally, ESCROW, false)
  if (previous === null || !previous.logIndex.equals(escrow.logIndex)) return null
  let graph = distributionForEscrow(escrow, logs)
  if (graph !== null && !graph.service.equals(tally.service)) return null
  return tally
}

export function escrowForTally(tally: PaymentLog, logs: PaymentLog[]): PaymentLog | null {
  let escrow = adjacent(logs, tally, ESCROW, false)
  if (escrow === null) return null
  let match = tallyForEscrow(escrow, logs)
  return match !== null && match.logIndex.equals(tally.logIndex) ? escrow : null
}

export function queryFeesForTally(tally: PaymentLog, logs: PaymentLog[]): PaymentLog | null {
  if (
    tally.service.toHexString() != addresses.subgraphService.toLowerCase() ||
    tally.paymentType != 0
  )
    return null
  let fees = adjacent(logs, tally, QUERY_FEES, true)
  if (
    fees === null ||
    !samePayment(tally, fees) ||
    !fees.payer.equals(tally.payer) ||
    tally.collectionId === null ||
    fees.collectionId === null ||
    !tally.collectionId!.equals(fees.collectionId!)
  )
    return null
  let previous = adjacent(logs, fees, TALLY, false)
  return previous !== null && previous.logIndex.equals(tally.logIndex) ? fees : null
}

export function tallyForQueryFees(fees: PaymentLog, logs: PaymentLog[]): PaymentLog | null {
  let tally = adjacent(logs, fees, TALLY, false)
  if (tally === null) return null
  let match = queryFeesForTally(tally, logs)
  return match !== null && match.logIndex.equals(fees.logIndex) ? tally : null
}

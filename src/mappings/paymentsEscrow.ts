import {
  Deposit,
  Withdraw,
  Thaw,
  CancelThaw,
  EscrowCollected,
} from '../types/PaymentsEscrow/PaymentsEscrow'
import {
  EscrowDepositedEvent,
  EscrowWithdrawnEvent,
  EscrowThawedEvent,
  EscrowThawCancelledEvent,
} from '../types/schema'
import { activityId, saveActivity, addAccount } from './activity'
import { PaymentLog, ESCROW } from './paymentCorrelation'
import { recordPayment } from './paymentActivity'

export function handleDeposit(event: Deposit): void {
  let record = new EscrowDepositedEvent(activityId(event))
  record.typename = 'EscrowDepositedEvent'
  record.accounts = []
  record.payer = event.params.payer.toHexString()
  record.receiver = event.params.receiver.toHexString()
  record.collector = event.params.collector
  addAccount(record, record.payer)
  addAccount(record, record.receiver)
  addAccount(record, event.params.collector.toHexString())
  record.tokenAmount = event.params.tokens
  saveActivity(record, event)
}

export function handleWithdraw(event: Withdraw): void {
  let record = new EscrowWithdrawnEvent(activityId(event))
  record.typename = 'EscrowWithdrawnEvent'
  record.accounts = []
  record.payer = event.params.payer.toHexString()
  record.receiver = event.params.receiver.toHexString()
  record.collector = event.params.collector
  addAccount(record, record.payer)
  addAccount(record, record.receiver)
  addAccount(record, event.params.collector.toHexString())
  record.tokenAmount = event.params.tokens
  saveActivity(record, event)
}

export function handleThaw(event: Thaw): void {
  let record = new EscrowThawedEvent(activityId(event))
  record.typename = 'EscrowThawedEvent'
  record.accounts = []
  record.payer = event.params.payer.toHexString()
  record.receiver = event.params.receiver.toHexString()
  record.collector = event.params.collector
  addAccount(record, record.payer)
  addAccount(record, record.receiver)
  addAccount(record, event.params.collector.toHexString())
  record.tokenAmount = event.params.tokens
  record.thawEndTimestamp = event.params.thawEndTimestamp
  saveActivity(record, event)
}

export function handleCancelThaw(event: CancelThaw): void {
  let record = new EscrowThawCancelledEvent(activityId(event))
  record.typename = 'EscrowThawCancelledEvent'
  record.accounts = []
  record.payer = event.params.payer.toHexString()
  record.receiver = event.params.receiver.toHexString()
  record.collector = event.params.collector
  addAccount(record, record.payer)
  addAccount(record, record.receiver)
  addAccount(record, event.params.collector.toHexString())
  record.tokensThawing = event.params.tokensThawing
  record.thawEndTimestamp = event.params.thawEndTimestamp
  saveActivity(record, event)
}

export function handleEscrowCollected(event: EscrowCollected): void {
  let own = new PaymentLog(ESCROW, event.logIndex)
  own.paymentType = event.params.paymentType
  own.payer = event.params.payer
  own.receiver = event.params.receiver
  own.collector = event.params.collector
  own.tokens = event.params.tokens
  own.destination = event.params.receiverDestination
  recordPayment(event, own)
}

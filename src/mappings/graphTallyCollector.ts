import {
  PaymentCollected,
  SignerAuthorized,
  SignerThawing,
  SignerThawCanceled,
  SignerRevoked,
} from '../types/GraphTallyCollector/GraphTallyCollector'
import {
  PayerSignerAuthorizedEvent,
  PayerSignerThawingEvent,
  PayerSignerThawCanceledEvent,
  PayerSignerRevokedEvent,
} from '../types/schema'
import { activityId, saveActivity, addAccount } from './activity'
import { PaymentLog, TALLY } from './paymentCorrelation'
import { recordPayment } from './paymentActivity'

export function handleSignerAuthorized(event: SignerAuthorized): void {
  let record = new PayerSignerAuthorizedEvent(activityId(event))
  record.typename = 'PayerSignerAuthorizedEvent'
  record.accounts = []
  record.payer = event.params.authorizer.toHexString()
  record.signer = event.params.signer.toHexString()
  addAccount(record, record.payer)
  addAccount(record, record.signer)
  saveActivity(record, event)
}

export function handleSignerThawing(event: SignerThawing): void {
  let record = new PayerSignerThawingEvent(activityId(event))
  record.typename = 'PayerSignerThawingEvent'
  record.accounts = []
  record.payer = event.params.authorizer.toHexString()
  record.signer = event.params.signer.toHexString()
  addAccount(record, record.payer)
  addAccount(record, record.signer)
  record.thawEndTimestamp = event.params.thawEndTimestamp
  saveActivity(record, event)
}

export function handleSignerThawCanceled(event: SignerThawCanceled): void {
  let record = new PayerSignerThawCanceledEvent(activityId(event))
  record.typename = 'PayerSignerThawCanceledEvent'
  record.accounts = []
  record.payer = event.params.authorizer.toHexString()
  record.signer = event.params.signer.toHexString()
  addAccount(record, record.payer)
  addAccount(record, record.signer)
  record.thawEndTimestamp = event.params.thawEndTimestamp
  saveActivity(record, event)
}

export function handleSignerRevoked(event: SignerRevoked): void {
  let record = new PayerSignerRevokedEvent(activityId(event))
  record.typename = 'PayerSignerRevokedEvent'
  record.accounts = []
  record.payer = event.params.authorizer.toHexString()
  record.signer = event.params.signer.toHexString()
  addAccount(record, record.payer)
  addAccount(record, record.signer)
  saveActivity(record, event)
}

export function handlePaymentCollected(event: PaymentCollected): void {
  let own = new PaymentLog(TALLY, event.logIndex)
  own.paymentType = event.params.paymentType
  own.payer = event.params.payer
  own.receiver = event.params.receiver
  own.service = event.params.dataService
  own.collectionId = event.params.collectionId
  own.tokens = event.params.tokens
  own.collector = event.address
  recordPayment(event, own)
}

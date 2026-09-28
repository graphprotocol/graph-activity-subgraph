import { GraphPaymentCollected, GraphPaymentCollected1 } from '../types/GraphPayments/GraphPayments'
import { PaymentLog, DISTRIBUTION } from './paymentCorrelation'
import { recordPayment } from './paymentActivity'

export function handleGraphPaymentCollected(event: GraphPaymentCollected): void {
  let own = new PaymentLog(DISTRIBUTION, event.logIndex)
  own.paymentType = event.params.paymentType
  own.payer = event.params.payer
  own.receiver = event.params.receiver
  own.service = event.params.dataService
  own.tokens = event.params.tokens
  own.protocol = event.params.tokensProtocol
  own.serviceTokens = event.params.tokensDataService
  own.delegation = event.params.tokensDelegationPool
  own.receiverTokens = event.params.tokensReceiver
  recordPayment(event, own)
}

export function handleGraphPaymentCollectedWithDestination(event: GraphPaymentCollected1): void {
  let own = new PaymentLog(DISTRIBUTION, event.logIndex)
  own.paymentType = event.params.paymentType
  own.payer = event.params.payer
  own.receiver = event.params.receiver
  own.service = event.params.dataService
  own.tokens = event.params.tokens
  own.protocol = event.params.tokensProtocol
  own.serviceTokens = event.params.tokensDataService
  own.delegation = event.params.tokensDelegationPool
  own.receiverTokens = event.params.tokensReceiver
  own.destination = event.params.receiverDestination
  recordPayment(event, own)
}

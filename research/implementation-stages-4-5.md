# Stages 4–5 implementation

Stages 4–5 add L2 dispute lifecycle, payer funding, signer security, and payment collection activity. They follow the independent-event model from [stages 1–3](implementation-stages-1-3.md); no financial history reconstruction or contract calls are required. The [inventory](implemented-events-stages-4-5.csv) maps subscriptions to concrete types, interfaces, counters, and supporting-only cases.

## Coverage

Added 26 L2 subscriptions:

- Six legacy DisputeManager lifecycle signatures.
- Eight HorizonDisputeManager lifecycle signatures, including legacy-allocation creation and cancellation.
- Five PaymentsEscrow signatures: deposit, withdrawal, thaw, cancellation, collection.
- Five GraphTallyCollector signatures: payment collection and four signer lifecycle changes.
- Two GraphPayments collection signatures: the network subgraph ABI's original signature and the later signature adding `receiverDestination`.

The four new sources use the network subgraph's address-book keys. They and the newly enabled legacy dispute handlers are gated by `{{^isL1}}`. Ethereum mainnet and Sepolia keep their previous subscriptions; Arbitrum One and Arbitrum Sepolia enable stages 4–5.

The schema adds 42 concrete types and the `DisputeEvent` interface, bringing the totals to 113 concrete activity types and 10 interfaces. Every concrete type and interface has a schema-derived global counter. The number of types exceeds subscriptions because required interface relationships must remain valid when context is missing.

## Disputes

`ActivityDispute` is minimal, optional enrichment context, keyed by `<dispute-manager-address>-<dispute-id>`. It prevents the legacy and Horizon managers from sharing context accidentally. It exposes its heterogeneous lifecycle through `DisputeEvent`; it does not replace or repurpose the existing `Dispute` schema type.

Creation records preserve raw attestation, allocation, POI, disputed block, deposited tokens, snapshots/timestamps where unambiguous, and the legacy slash/reward payload. Outcomes preserve their raw token amount: it may include a returned deposit, so it is not labelled as a calculated reward or loss.

Type selection follows reliably known relationships:

- Creation/outcome records retain the indexer and fisherman even without earlier activity.
- Deployment-enriched types implement `SubgraphDeploymentEvent`; `Unresolved…` types omit it. Allocation enrichment checks the provider identity before attributing a deployment.
- Modern query/indexing disputes identify the SubgraphService provision directly from their contract semantics. Outcome logs alone cannot establish whether a dispute concerns a modern provision or a legacy allocation, so they gain provision/service interfaces only when that context is known.
- Legacy-manager and Horizon legacy-allocation disputes never acquire a fabricated provision.
- Linking emits two activity observations, suffixed `-0` and `-1`, one for each dispute. Each side independently selects its supported interfaces, which permits conflicting disputes involving different indexers. Completely unknown sides use only `Event` and `DisputeEvent`. Both observations have counters; two participants in one record do not multiply counts.
- Accepted outcomes include related slash activity IDs from the same transaction, matched by staking emitter, provider, and service where emitted, within the segment after the previous acceptance for that provider. These are related loss observations, not an inferred amount or a unique causal join: slash logs carry no dispute ID. Slashing remains separately recorded.
- Context appearing later enriches later activity. Earlier immutable fallback records are not rewritten, and a linked dispute's inferred rejection is not fabricated as a new emitted rejection event.

### Query-dispute ABI ambiguity

The copied Horizon ABI names its last two query-creation values `stakeSnapshot`, then `cancellableAt`. The inspected contracts checkout's `DisputeManager._createQueryDisputeWithAttestation` emits `cancellableAt`, then `stakeSnapshot`, despite declaring the ABI order. Both are `uint256`, so the signature cannot distinguish them.

`HorizonQueryDisputeCreatedEvent.queryContextValues` therefore preserves the two values in wire order. It does not expose guessed semantic `stakeSnapshot`/`cancellableAt` fields for this event. Indexing-dispute creation uses its unambiguous named fields. Resolving deployed release boundaries would allow a later normalization without risking false timestamp/stake values now.

## Funding, signer changes, and payments

Funding/withdrawal records retain payer, collector, receiver, tokens, and emitted thaw/cancellation timestamps. Signer records retain authorizer-as-payer, signer, and the emitted timestamp where present. They implement `GraphAccountEvent`; funding an escrow does not create an indexer or provision identity by itself.

Payment collection uses a receipt-based hierarchy:

1. A matching tally `PaymentCollected` owns the payment record and the actual payer/collection ID.
2. Without a matching tally, `EscrowCollected` owns a fallback record. A matching distribution adds service/provision interfaces through `ServiceEscrowCollectedEvent`.
3. Without a matching escrow, `GraphPaymentCollected` owns a standalone distribution record. Its `paymentSource` is the immediate token source; an escrow contract is never presented as an inferred end-user payer.

Paired lower-layer logs supply protocol, service, delegation-pool, and receiver splits plus receiver destination and source log indices. They do not increment activity counters independently. Pairing checks configured emitters, reciprocal adjacent log order, payment type, amount, receiver, and the payer/collector/service/destination relationships available at each layer. Repeated identical payments remain distinct records. Missing or mismatched receipt context leaves fallback activity visible. Receipt decoding copies bytes before changing endianness; it never mutates receipt data.

Collection IDs remain opaque for other services and payment types. Only SubgraphService query-fee collections with zero-padded address IDs acquire an allocation address. A matched query-fee log or matching stored allocation context supplies the deployment and selects `SubgraphPaymentCollectedEvent`.

`QueryFeesCollectedEvent` remains a separate service-specific fee/curation fact. Its optional `paymentEventId` links to the canonical tally payment. Likewise, delegation-pool additions remain their own activity facts. Clients should not sum their amounts with canonical payment totals as if they were additional payments.

## Validation and remaining scope

Tests cover every new signature against an empty store, dispute enrichment/fallbacks and links, legacy/Horizon identity separation, slash correlation, escrow/signer lifecycles, full and partial payment receipts, both distribution signatures, multiple identical payments, malformed/mismatched receipt logs, missing allocation context, and immutable receipt decoding. All 99 tests pass. Every scenario reconciles all concrete/interface counters against stored records.

Run `yarn prepare:arbitrum && yarn build`, `yarn test`, and `yarn lint`. Preparation/build validation also covers Arbitrum Sepolia, Ethereum mainnet, and Sepolia, including address validity, L2 gating, ABI/event signatures, and receipts.

No deployment, live chain replay, or live GraphQL verification has been performed. The optional stage 6 remains outside this implementation. This implements the selected stage 4–5 inventory; it does not claim exhaustive coverage of every event added to newer contract releases.

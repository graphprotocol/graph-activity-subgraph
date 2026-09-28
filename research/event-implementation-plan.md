# Staged event coverage plan

Proposal dated 2026-09-25, incorporating the L2, counter, interface, Provision, and independent event-processing requirements. Stages 1–5 are implemented in the working tree; see the [stages 1–3 notes](implementation-stages-1-3.md) and [stages 4–5 notes](implementation-stages-4-5.md). Stage 6 remains optional and planned. It builds on [the coverage research](event-coverage-gap.md) and [the subscription inventory](event-inventory.csv).

## Scope and design decisions

- Target new contract integrations and event coverage at L2, initially Arbitrum and the corresponding supported test deployment. Preserve existing L1 behavior and historical handlers, but do not expand L1 coverage as part of this work. Shared correctness fixes can benefit both configurations.
- Preserve pre-Horizon history on L2. L2-only development does not mean dropping legacy staking, allocations, or the transition-period reward paths.
- Make generic Horizon activity service-aware across data services. Implement SubgraphService-specific activity for the subgraph indexing service. Do not require a handler for every data service before recording its staking/provision activity.
- Keep existing event interfaces and their query behavior. Add new concrete types and interfaces where necessary rather than forcing all historical events into a service-specific model.
- Count persisted activity records. A contract log, a transaction, an activity record, and a user operation are different things. Grouping multiple records for display must not change counter semantics.
- Maintain only the supporting state needed to produce and query correct activity. Full financial balances, analytics snapshots, and network accounting remain outside this plan unless a specific activity requires them.
- Treat each supported event as an independently useful record enriched from its payload and available context. Earlier staking, provisioning, allocation, or other lifecycle events need not have been handled first. The stages express delivery priorities, not dependencies on reconstructing historical protocol state.
- Follow the network subgraph's ABI approach for new integrations: copy its stitched ABIs or use the same contract-package ABIs as appropriate. Match the selected source and signature; a separate ABI redesign or exhaustive contract-history investigation is not a prerequisite.

## Entity and query model

| Entity / interface | Proposed responsibility |
| --- | --- |
| `Indexer` | Provider identity across services; continue to support the complete indexer activity feed |
| `DataService` | Identity of a verifier/data service, with minimal metadata where available |
| `Provision` | An indexer's position for one service, identified by indexer address + service address within a chain deployment; relates to both `Indexer` and `DataService` |
| `ProvisionEvent` | New interface with a required provision relation, supporting one provision's heterogeneous activity feed |
| `DataServiceEvent` | New interface with a required service relation, supporting activity across provisions for one service |
| Existing `Event`, `IndexerEvent`, `DelegatorEvent`, `CuratorEvent`, `GraphAccountEvent`, `SubgraphEvent`, `SubgraphDeploymentEvent` | Retain as query surfaces; implement the applicable interfaces on every new concrete activity type |
| Allocation context | Retain allocation identity, indexer, deployment, protocol era, and provision when applicable; use this to attribute later rewards and disputes |
| Thaw-request context | Retain request identity, owner, request type, provision, and timing so fulfillment events can be attributed correctly |
| Delegation context | Keep legacy delegator/indexer identity stable; add a service-specific relation keyed by delegator + provision for Horizon |

A delegation into a provision should appear in the general event feed, the indexer's feed, the delegator's feed, the provision's feed, the service's feed, and the relevant accounts' feed. It is **one stored activity record implementing several interfaces**.

A provider's general stake deposit belongs to `IndexerEvent` and `GraphAccountEvent`; it should not be assigned to an arbitrary provision. Legacy events also must not acquire a fabricated provision. A pool-wide slash belongs to the indexer/provision/service feeds but should not claim a particular delegator or produce one record per delegator without reliable individual attribution.

Create minimal identity entities lazily from addresses and IDs carried by each event. For example, an allocation event can create its indexer, service, and provision references without a previous `ProvisionCreated` handler having run. Supporting context is enrichment, not a reconstructed financial position. When a log omits context (such as a thaw fulfillment carrying only a request ID), preserve its available facts even if the earlier request was not indexed. Optional lookups or related logs may enrich it; absence of enrichment must not cause the event to be dropped or indexing to fail. Design concrete types and interface nullability around what is reliably available, without fabricating required relations. Interface membership is a schema property, not something a handler can toggle per record.

Recommended concrete-type policy:

- Reuse an existing concrete event type when the action and field meanings are equivalent, such as a simple own-stake deposit/withdrawal, and preserve source/era context.
- Prefer new concrete Horizon types for service-specific delegation, operators, fee cuts, and other actions with different semantics. They can implement the same existing interfaces as their legacy equivalents and also implement `ProvisionEvent`/`DataServiceEvent` with non-null relations.
- Do not add `ProvisionEvent` with a required provision field to a concrete type that also represents legacy or global activity. This would make its historical records invalid.
- Use separate concrete types where different participants are required. For example, a delegation thaw can implement `DelegatorEvent`; a provider's provision thaw cannot unless there is an actual delegator.
- Keep legacy field meanings and IDs stable. Expose timing units and raw fee-cut semantics explicitly for new types. Existing interface queries will include the new types, but clients with exhaustive concrete-type fragments/discriminators will need corresponding updates.

Concrete type names and any further interfaces such as `AllocationEvent` or `DisputeEvent` should be settled in each stage's schema review. The two required new query dimensions for the initial work are provision and data service.

## Counter contract for every stage

Keep the existing singleton `CounterEntity` and all existing counter fields. Add a global counter for **each new concrete activity entity type**, plus `provisionEventCount` and `dataServiceEventCount` for the new interfaces. Reusing an existing concrete type increments its existing type counter; another ABI signature alone does not require another activity-type counter.

For each newly persisted activity record:

1. Increment `eventCount` once.
2. Increment exactly one concrete-type counter once.
3. Increment each interface counter that the record implements once.

An event involving two accounts increments `graphAccountEventCount` once, because one record is returned by that interface. An activity implementing both `IndexerEvent` and `ProvisionEvent` increments both interface counters, but its global count is still one. An ignored log or a supporting-state-only write increments no activity counters. A handler intentionally producing two activity records increments the appropriate counters for both records.

Use shared event construction and counter helpers so handlers do not independently maintain long, repeated counter lists. The exact AssemblyScript implementation should remain simple; a central mapping of concrete types to interface memberships can drive validation even if typed helpers handle production writes.

Required validation rules:

- `eventCount` equals the sum of all concrete activity-type counters.
- Each interface counter equals the sum of concrete-type counters for types implementing that interface. Interface totals overlap and must not be summed to derive `eventCount`.
- Every concrete activity type has a counter and every counter is initialized. A schema/coverage check must fail if a new type or interface membership is added without corresponding counter support.
- Handler sequence tests assert stored records, IDs, memberships, and counters together, including zero-record and multiple-record cases. Integration queries compare actual type/interface results with the global counters on a bounded replay dataset.
- Test newly supported events against an empty store or missing earlier lifecycle context. Verify that the activity and its counters are still written correctly; sequence tests validate enrichment and correlation rather than establish a historical-state prerequisite.
- Canonicalization of overlapping reward/payment logs happens before recording/counting the chosen activity. Distinct actions in a transaction remain distinct records. Related-log enrichment must not count an already represented activity again.

These are global counts for each deployment, not per-indexer/per-provision filtered counts. Additional scoped counters can be added later if a concrete query requirement needs them; they are not necessary to preserve the current global-counter model.

## Stage 1 — Establish correctness and the L2 foundation

**Priority: first recommended delivery batch.** Establish reliable IDs, query membership, and counts. This is engineering groundwork, not a requirement to process earlier protocol events before supporting newer ones; shared pieces can also be delivered alongside a new event family.

Deliverables:

- Audit all existing active handlers against schema interface memberships and global counters; correct missing/wrong increments and initialize new counters consistently.
- Fix GNS publication version ID reuse, unassigned version numbers, legacy publish/version classification, and counters when a version update creates two records. Keep existing publishing, curation, and migration event coverage.
- Add the minimal Provision/DataService model and their query interfaces, plus common source/era/log context needed by new events. Specify service-specific delegation and allocation/request relations without importing the network subgraph's complete accounting model.
- Reuse the network subgraph's L2 ABI/source configuration, including stitched or package ABIs as appropriate, and check the addresses, signatures, and start blocks for the integrations being added. Resolve a contract-checkout naming difference only where it affects that integration's chosen coverage.
- Update ABI/codegen/address preparation and gate new integrations to the intended L2 configurations. Preserve required receipts for activity gas fields.
- Add meaningful counter and publication regression checks. Keep these changes reviewable separately from the new event families.

Completion criteria: existing activity passes the counter rules; initial publication and successive versions retain distinct stable version identities; existing interface queries continue working; L2 preparation/build passes and existing L1 configuration still prepares/builds without unintended new integrations.

## Stage 2 — Cover stake, provisions, and delegation

**Priority: highest new coverage.** These events explain where users' tokens are committed, released, or lost.

| Event family | Network-baseline event names | Query dimensions |
| --- | --- | --- |
| Global provider stake | `HorizonStakeDeposited`, `HorizonStakeLocked`, `HorizonStakeWithdrawn` | Indexer, accounts |
| Provision lifecycle | `ProvisionCreated`, `ProvisionIncreased`, `ProvisionThawed`, `TokensDeprovisioned` | Indexer, provision, service, relevant accounts |
| Delegation lifecycle | `TokensDelegated`, `TokensUndelegated`, `DelegatedTokensWithdrawn` | Delegator, indexer, provision, service, accounts |
| Thaw requests | `ThawRequestCreated`, `ThawRequestFulfilled` | Provision/service/indexer; delegator where the request concerns delegation |
| Losses | `ProvisionSlashed`, `DelegationSlashed` | Indexer, provision, service; do not invent individual delegation losses |
| Terms and permissions | `DelegationFeeCutSet`, `OperatorSet`, `ProvisionParametersStaged`, `ProvisionParametersSet` | Applicable indexer/provision/service/account context |

Record request and position lifecycle facts distinctly, while allowing the UI to group related logs. Enrich fulfillment from the request when available, but still store fulfillment facts when prior request context is absent. Retain multiple concurrent requests and unsuccessful/invalid fulfillment information where emitted. Preserve the distinction between staged and applied provision parameters and between raw delegation fee cuts and legacy indexer-cut presentation.

Completion criteria: one indexer with two services produces correctly separated provision feeds and a complete combined indexer feed. A delegator using both services has correctly attributed activity. Deposit/delegate/undelegate/thaw/withdraw and slash sequences satisfy record and counter invariants. Global stake events remain queryable without a provision.

## Stage 3 — Cover allocations, service registration, and earnings

**Priority: equally central user workflows.** Reuse the shared service/provision identity model, creating references directly from these events as needed; Stage 2's events do not need to have been indexed. This stage can be split into registration/allocations and earnings/POI implementation batches.

| Event family | Network-baseline event names | Purpose |
| --- | --- | --- |
| Registration and destination | `ServiceProviderRegistered`, `RewardsDestinationSet` | Service-specific registration/settings; include other deployed destination variants if release verification requires them |
| Allocations | SubgraphService `AllocationCreated`, `AllocationResized`, `AllocationClosed` | Creation, size changes, and closure, including forced closure |
| POI | `POIPresented` | Capture presentation and condition even when no collection event follows |
| Indexing rewards | `IndexingRewardsCollected`, `RewardsAssigned`, `HorizonRewardsAssigned` | Cover new, pre-Horizon L2, and transition-period legacy allocations |
| Query fees | `QueryFeesCollected` | Allocation/deployment/provider fee collection with service context |
| Delegation-pool additions | `TokensToDelegationPoolAdded` | Pool additions as their own fact where useful; never classify as a user delegation or duplicate collected earnings |

All new allocation-related types must retain applicable `IndexerEvent`, `SubgraphDeploymentEvent`, and account queryability, while service-specific types additionally expose provision/service context. Indexing rewards, POI, query fees, and pool additions are different facts; do not collapse them into one vague payment type.

For rewards, establish which event owns the earnings record for each allocation era. The network uses `HorizonRewardsAssigned` for legacy allocations and `IndexingRewardsCollected` for new allocations. Record POI independently where no earnings occur. Avoid counting the same distribution again through a pool-addition event.

Include `SubgraphUpgraded` curation-movement activity in a small separate batch in this stage: publication already works after Stage 1, but a curated subgraph upgrade should expose what happened to its signal. It should have its own type/counter and retain the existing subgraph query interface; it must not create a second version-publication record. Do not attach a single curator when the log describes pooled signal.

Completion criteria: create/resize/close works through provision, indexer, and deployment feeds. Rewards remain visible for legacy allocations after Horizon. A POI with deferred/no rewards is visible. Overlapping reward logs do not produce duplicate earnings; distinct activities still contribute their own type and interface counts. A curated version upgrade yields one version-publication record plus correctly classified curation details.

## Stage 4 — Add dispute lifecycle activity

**Priority: important exceptional activity.** Slashing is already visible in Stage 2; this stage supplies the dispute context and outcomes.

- Add Horizon `QueryDisputeCreated`, `IndexingDisputeCreated`, `LegacyDisputeCreated`, `DisputeAccepted`, `DisputeRejected`, `DisputeCancelled`, `DisputeDrawn`, and `DisputeLinked`.
- Add legacy dispute signatures needed for historical L2 coverage. This does not expand L1 coverage.
- Resolve indexer, fisherman/participants, allocation/deployment, and provision where the contract/log history supports them. Preserve legacy disputes without fabricated provision relationships.
- Correlate dispute outcomes with slash activity while keeping the dispute decision and token loss as distinct activity facts.

Completion criteria: disputes can be followed from creation through an outcome, including linked cases, through the applicable account/indexer/deployment/provision feeds; every concrete lifecycle type and interface counter reconciles.

## Stage 5 — Add payer funding and payment activity

**Priority: valuable expansion after indexer/delegator/curator workflows.** This stage serves network consumers as well as providers.

- PaymentsEscrow: `Deposit`, `Withdraw`, `Thaw`, `CancelThaw`, `EscrowCollected`.
- GraphTallyCollector: `PaymentCollected`, then `SignerAuthorized`, `SignerThawing`, `SignerThawCanceled`, `SignerRevoked` for payer security history.
- GraphPayments: use `GraphPaymentCollected` where it contributes a meaningful payment breakdown or needed attribution; it need not create a second generic payment record.
- Preserve actual payer, receiver, collector, service, and allocation/collection identity. An escrow contract named as a payer is not automatically the end user.

Keep account query interfaces and attach provision/deployment only where resolvable and semantically correct. If a new payer-specific interface is introduced, add its global interface counter in the same change. Some payment logs may serve as supporting context only; document that choice explicitly in the inventory.

Completion criteria: fund/thaw/cancel/withdraw and payment collection can be followed from both payer and provider perspectives without presenting several layers of one collection as repeated payments. Payment activity counters count the records actually exposed.

## Stage 6 — Selective network/profile activity and deferred scope

**Priority: optional, driven by product demand.** Do not treat closing all 103 subscription gaps as the objective.

Candidates, in suggested order:

1. Material network changes: `TargetAllocationUpdated`, protocol pause/unpause, and selected delegation/slashing/thawing configuration changes. Preserve the already-supported rewards denylist events.
2. Account profile metadata: Graph-specific `DIDAttributeChanged`.
3. Remaining service/dispute configuration events where users benefit from a network-wide history.
4. Legacy GNS signal/claim history only where applicable to desired L2 history: `NameSignalUpgrade`, `NameSignalDisabled`, `LegacySubgraphClaimed`.

Defer generic ERC-20 transfers/approvals, epoch bookkeeping, general bridging, vesting wallets, low-level protocol permissions, and new L1 feature work. These can be reconsidered as separate product requirements.

## Delivery and alignment

The recommended first broad coverage milestone is **Stages 1–3**: correct current history and counts, service-aware staking/delegation/provisions, allocations, earnings, POI, and curated upgrades. Each event family can be delivered and used independently before that milestone. Stage 4 adds dispute explanations; Stage 5 broadens the audience to payers.

Each stage should update the coverage inventory with its selected activity type, interfaces, concrete/global interface counters, and any intentionally supporting-only logs. Pair schema additions with handlers, initialized counters, and tests in the same deliverable. Check interface query results as well as individual concrete-type queries.

Index the full history of every supported event. Use each emitting contract’s creation block when address-book metadata provides it, including the proxy’s creation block for upgraded contracts. When that metadata is missing, retain the existing early chain fallback so history is preserved. Deployment/reindexing must populate the complete supported history, while individual handlers remain independent of earlier financial-state reconstruction. Validate isolated events and representative bounded L2 log sequences, including missing earlier context and relevant signature variants, and verify counter reconciliation. New enum/type variants and fixes to previously wrong records should be documented for API consumers.

The main proposed product decisions are: support generic Horizon provisions across services, retain existing cross-type query interfaces, use new service-specific concrete types when required by semantics, and make counters represent stored activity records rather than grouped transactions. These are the assumptions to align on before implementation.

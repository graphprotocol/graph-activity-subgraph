# Activity event coverage compared with the network subgraph

Historical baseline; see [stages 1–3 implementation](implementation-stages-1-3.md) for the subsequent changes.

Research date: 2026-09-24. This is a source-code comparison and a proposed scope for future work; no mappings, schemas, or deployment configuration have been changed.

The main gap is **Horizon staking, delegation, provisioning, allocation, and payment activity**. Publishing and curation already have legacy and GNS v2 handlers. Two important older omissions are indexing rewards and disputes. There are also correctness issues inside existing publication handlers that adding subscriptions would not fix.

## Baseline and method

| Repository | Local commit inspected | Commit date |
| --- | --- | --- |
| Activity | `bb88cdc19f3102000dd859591821a0bce3686b7a` | 2024-06-30 |
| Network | `bbc312511049bcc152e3c819a936cc53484f05bb` | 2026-09-16 |
| Analytics Horizon | `a5b3509e73eb339d2893f09426fe276bf8a23c96` | 2026-09-16 |

Compared the checked-out `subgraph.template.yaml` files, then traced relevant handlers and activity entity writes. Network and analytics templates are byte-for-byte identical at these checkouts. Analytics is therefore a useful cross-check of subscriptions, not a separate set of event gaps. Their mapping behavior was not exhaustively compared. Existing uncommitted network documentation/research files were left untouched; the templates and mappings used for this comparison were unmodified.

An event is identified by **data source + full event signature, including indexed parameter layout + template branch**. Names alone are insufficient: the two contracts' `AllocationCreated` events are different, and several unrelated contracts emit `Transfer` or `ParameterUpdated`.

Counts include both mutually exclusive L1/L2 branches and optional/dynamic Ethereum sources. They exclude comments, IPFS handlers, and events merely present in an ABI. These are subscription counts, not transaction counts, feature-completeness percentages, or proof that a deployed instance is indexing correctly. No remote branch freshness, deployed manifests, RPC logs, or production queries were checked.

- Activity: **52 subscriptions**, across 12 source definitions, and **41 activity event entity types** in the schema.
- Network and analytics: **155 subscriptions** each, including 6 in the dynamic token-lock-wallet template (149 static subscriptions).
- **103 network subscriptions are absent from activity.** Every activity subscription has an exact network counterpart.
- Of activity's 52 subscriptions, **51 handlers contain activity entity writes**; `handleSubgraphUpgraded` does not. A handler can emit multiple records, so this is not a count of resulting records.

The complete, reproducible comparison is [event-inventory.csv](event-inventory.csv). It includes exact signatures, scope, address/start-block placeholders, manifest lines, mapping files, and handler lines for all three repositories. Regenerate with `python3 research/inventory_events.py`; sibling locations can be overridden with `--network` and `--analytics`. The extractor verifies that every subscribed handler has an exported function, but does not validate its runtime behavior or deployed address.

## What activity already records

| Activity area | Subscriptions | Existing behavior |
| --- | ---: | --- |
| GNS | 17 | Legacy and v2 publication, deprecation, metadata, name signal mint/burn, GRT withdrawal, default name, parameter changes, version updates; `SubgraphUpgraded` is a no-op |
| Subgraph NFT | 1 | Ownership transfers, including mint/burn transfers without special filtering |
| Curation | 3 | Deployment signal mint/burn and parameter changes |
| Staking | 15 | Stake deposit/lock/withdraw/slash, delegation deposit/lock/withdraw, delegation settings, allocation create/collect/close, rebates, operators |
| Staking extension | 1 | Parameter changes |
| Service registry | 2 | Register/unregister indexer service |
| L1/L2 GNS migration | 6 | Send/receive subgraph and curator balances, finalize migration, return curator balance |
| L1/L2 staking migration | 4 | Transfer indexer stake/delegation, unlock delegation after migration, return transferred delegation |
| Rewards manager | 2 | Rewards denylist and parameter changes; no indexing reward activity |
| Dispute manager | 1 | Parameter changes only; no dispute lifecycle activity |
| **Total** | **52** | |

The Staking count includes **both historical `AllocationClosed` signatures**, `RebateClaimed`, and `RebateCollected`. The latter was already added in the latest activity commit; it is not a missing event.

The distinction between named-subgraph and deployment curation is already represented: GNS v1 `NSignalMinted`/`NSignalBurned` and v2 `SignalMinted`/`SignalBurned` produce `NSignalMintedEvent`/`NSignalBurnedEvent`; Curation `Signalled`/`Burned` produce `SignalMintedEvent`/`SignalBurnedEvent`.

Sources: [activity manifest](../subgraph.template.yaml), [activity schema](../schema.graphql), [GNS mappings](../src/mappings/gns.ts), [staking mappings](../src/mappings/staking.ts), [curation mappings](../src/mappings/curation.ts).

## Missing subscriptions by source

This accounts for all 103 missing subscriptions. Priority reflects the activity product's scope, rather than a requirement to match the network subgraph completely.

| Source | Activity / network subscriptions | Gap | Suggested treatment |
| --- | ---: | ---: | --- |
| HorizonStaking | 0 / 23 | 23 | Core user actions first; global configuration separately |
| SubgraphService | 0 / 15 | 15 | Core allocations, rewards, fees, POI, and registration first |
| HorizonDisputeManager | 0 / 12 | 12 | Dispute lifecycle valuable; global configuration optional |
| DisputeManager | 1 / 7 | 6 | Historical dispute lifecycle |
| GraphTokenLockManager | 0 / 6 | 6 | Optional vesting/locked-wallet scope |
| GraphTokenLockWallet (dynamic) | 0 / 6 | 6 | Optional vesting/locked-wallet scope |
| Controller | 0 / 5 | 5 | Optional protocol status/governance feed |
| PaymentsEscrow | 0 / 5 | 5 | Valuable if payer activity belongs in the product |
| GraphTallyCollector | 0 / 5 | 5 | Payment context and optional payer signer activity |
| GNS | 17 / 20 | 3 | Historical claim/curation details; no new v2 publication signature missing |
| L1GraphTokenGateway | 0 / 3 | 3 | Optional general GRT bridging |
| Staking | 15 / 17 | 2 | Slasher and asset-holder permissions; low priority |
| RewardsManager | 2 / 4 | 2 | Important reward history, including transition period |
| GraphToken | 0 / 2 | 2 | Generic token activity; usually omit |
| EpochManager | 0 / 2 | 2 | Network bookkeeping/configuration; usually omit |
| L2GraphTokenGateway | 0 / 2 | 2 | Optional general GRT bridging |
| IssuanceAllocator | 0 / 1 | 1 | Material network rewards configuration; optional network feed |
| EthereumDIDRegistry | 0 / 1 | 1 | Optional account profile activity |
| ArbRetryableTx | 0 / 1 | 1 | Bridge transaction tracking infrastructure |
| **Total missing** | | **103** | |

## Highest-value additions

### Horizon stake, delegation, and provisions

All 23 events in the network's [HorizonStaking source](../../graph-network-subgraph/subgraph.template.yaml) are absent here. The [mapping](../../graph-network-subgraph/src/mappings/horizonStaking.ts) distinguishes service providers, verifiers/data services, provisions, and individual thaw requests.

| User action | Existing legacy event | Missing Horizon event(s) | Activity implications |
| --- | --- | --- | --- |
| Deposit/lock/withdraw own stake | `StakeDeposited`, `StakeLocked`, `StakeWithdrawn` | `HorizonStakeDeposited`, `HorizonStakeLocked`, `HorizonStakeWithdrawn` | Preserve the familiar stake activity categories while identifying the protocol era |
| Delegate | `StakeDelegated` | `TokensDelegated` | Adds verifier/data-service context to the indexer/delegator pair |
| Undelegate | `StakeDelegatedLocked` | `TokensUndelegated` | Track the undelegation and its associated thaw information |
| Withdraw delegation | `StakeDelegatedWithdrawn` | `DelegatedTokensWithdrawn` | Preserve the actual service-specific withdrawal |
| Commit/release stake for a data service | No equivalent activity | `ProvisionCreated`, `ProvisionIncreased`, `ProvisionThawed`, `TokensDeprovisioned` | New first-class activity: provisioned stake is distinct from deposited stake and allocated stake |
| Create/complete a thaw request | Legacy lock events contain the deadline | `ThawRequestCreated`, `ThawRequestFulfilled` | Retain request ID, owner, request type, maturity, shares/tokens, and fulfillment validity |
| Slash stake/delegation | `StakeSlashed` | `ProvisionSlashed`, `DelegationSlashed` | Distinguish provider loss from delegation-pool loss; a pool event does not identify every affected delegator |
| Change reward/fee cuts | `DelegationParametersUpdated` | `DelegationFeeCutSet` | Preserve verifier and payment type; fee-cut meaning differs from legacy |
| Authorize/revoke operator | `SetOperator` | `OperatorSet` | New authorization is scoped to a verifier as well as the provider |
| Change provision terms | None | `ProvisionParametersStaged`, `ProvisionParametersSet` | Distinguish proposed terms from applied terms |
| Add earnings/tokens to delegation pool | No direct activity equivalent | `TokensToDelegationPoolAdded` | Useful supporting evidence; do not label this as a new user delegation |

The four remaining HorizonStaking gaps are global configuration: `MaxThawingPeriodSet`, `ThawingPeriodCleared`, `DelegationSlashingEnabled`, and `AllowedLockedVerifierSet`. They can be omitted from account timelines or exposed in a separate network configuration feed.

Two details matter for an eventual implementation:

- The network handler explicitly inverts `DelegationFeeCutSet.feeCut` with `1_000_000 - feeCut` to preserve the older indexer-cut presentation. Copying the raw value into the current activity fields would reverse its meaning. Keep raw semantics explicit and record `paymentType` (the mapping uses 0=query fees, 1=indexing fees, 2=indexing rewards).
- `TokensUndelegated` alone lacks the old event's `until` field. `ThawRequestCreated` supplies timing and distinguishes provision from delegation thawing. A `ThawRequestFulfilled` log contains the request ID rather than the provider/delegator context; retain a small request entity to resolve it. Do not collapse several requests into one legacy lock deadline or assume all legacy and Horizon deadlines use the same unit.

### Allocations, service registration, query fees, and indexing rewards

The new source is [SubgraphService](../../graph-network-subgraph/src/mappings/subgraphService.ts), at its own configured address. Simply adding ABI entries to the old Staking source would not cover it.

| Missing event | User-facing meaning |
| --- | --- |
| `ServiceProviderRegistered` | Service registration/update; the network decodes URL, geohash, and rewards destination from the event's bytes payload |
| `RewardsDestinationSet` | Change where the indexer's rewards are sent |
| `AllocationCreated` | Create an allocation using the new signature/contract |
| `AllocationResized` | Change an existing allocation's size; there is no legacy activity equivalent |
| `AllocationClosed` | Close an allocation using the new signature/contract, including forced closure |
| `IndexingRewardsCollected` | Collect indexing rewards, with total, indexer, and delegation amounts plus POI context |
| `POIPresented` | Submit POI and record its rewards condition, including cases where no rewards are collected |
| `QueryFeesCollected` | Collect query fees for an allocation/deployment under the new payment flow |

Exact signatures that are easy to confuse:

```text
Staking.AllocationCreated(indexed address,indexed bytes32,uint256,uint256,indexed address,bytes32)
SubgraphService.AllocationCreated(indexed address,indexed address,indexed bytes32,uint256,uint256)

Staking.AllocationClosed(indexed address,indexed bytes32,uint256,uint256,indexed address,uint256,address,bytes32,bool)
Staking.AllocationClosed(indexed address,indexed bytes32,uint256,uint256,indexed address,address,bytes32,bool)
SubgraphService.AllocationClosed(indexed address,indexed address,indexed bytes32,uint256,bool)
```

The seven remaining SubgraphService gaps are configuration: `DelegationRatioSet`, `CurationCutSet`, `MaxPOIStalenessSet`, `StakeToFeesRatioSet`, `ProvisionTokensRangeSet`, `VerifierCutRangeSet`, and `ThawingPeriodRangeSet`. These do not need individual account-feed entries.

Reward coverage needs **three historical paths**, not just a new event:

1. `RewardsManager.RewardsAssigned` is commented out in activity, and its local function body is commented out too. There is no existing indexing-rewards activity entity. `RebateCollected` covers query rebates, not indexing issuance.
2. `RewardsManager.HorizonRewardsAssigned` is also absent. The network [handler](../../graph-network-subgraph/src/mappings/rewardsManager.ts) processes it only for legacy allocations; it skips new allocations to avoid overlapping with SubgraphService reward processing.
3. `SubgraphService.IndexingRewardsCollected` handles the new allocation path. Its handler also accounts for the later `POIPresented` event: some POI conditions produce no collection event. Listening only for rewards would miss those presentations.

For an activity feed, select or link these records by allocation era and operation. Do not report several layers of the same reward distribution as separate earnings. Likewise, POI submission and reward collection are distinct facts that may be grouped in one transaction view.

### Publishing and curation: keep existing coverage, repair behavior

There is **no additional v2 publish/version/curate event signature in the network manifest that activity lacks**. The three missing GNS subscriptions are `NameSignalUpgrade`, `NameSignalDisabled`, and `LegacySubgraphClaimed`. Their local handler stubs do not produce activity. They concern legacy signal migration/disablement and claiming a legacy subgraph; useful for complete historical narratives, but less urgent than Horizon user actions.

`SubgraphUpgraded` is a different case: it is subscribed, but [the handler](../src/mappings/gns.ts) only calculates IDs and saves nothing. Its curation movement details are lost. This does **not** mean all new versions are invisible: `SubgraphVersionUpdated` creates `NewSubgraphVersionPublishedEvent` and version metadata activity. The local [GNS contract](../../contracts/packages/contracts/contracts/discovery/GNS.sol), inspected at `1c9eefde0d91ac5217053cc4d340ed6f56832c29`, emits `SubgraphUpgraded` when signal is moved and then emits `SubgraphVersionUpdated`. Adding two independent “new version” records would duplicate one user action.

Static inspection also found existing publication problems worth fixing before relying on this history:

- **V2 version ID reuse:** `handleSubgraphPublishedV2` writes version `subgraph-0` without incrementing `versionCount`. The initializing `SubgraphVersionUpdated` only clears the flag. The next update computes the same ID, increments the count, and then loads and overwrites `subgraph-0`. Earlier publication activity can then resolve to the newer deployment through its version relation.
- **Unassigned version numbers:** the publication functions declare `versionNumber` without assigning it before saving `SubgraphVersion.version`. The network handlers explicitly derive it from the version counter.
- **Legacy publication classification:** the legacy handler routes the first version (`versionCount == 1`) through `changetype<NewSubgraphVersionPublishedEvent>`, while later versions retain `NewSubgraphPublishedEvent`. Its counters are opposite to the intended first-publish/new-version categories, and the `typename` string remains the publication type. Confirm generated `save()` behavior as part of fixing this cast.
- **V2 counters undercount:** a non-initializing version update writes both a version-publication event and a metadata event, but increments `eventCount`, `subgraphEventCount`, and `subgraphDeploymentEventCount` only once. The account counter is incremented twice.

These are findings from source tracing, not replay-tested production incidents. See [activity GNS handlers](../src/mappings/gns.ts) versus [network GNS handlers](../../graph-network-subgraph/src/mappings/gns.ts). Existing NFT transfer handling also labels mint/burn transfers as `SubgraphTransferredEvent`; an eventual product cleanup should distinguish these from owner-to-owner transfers.

## Valuable scope additions after core coverage

**Disputes:** activity has a `Dispute` schema entity, but its manifest only activates `ParameterUpdated`; the lifecycle functions are commented stubs. Missing legacy events are `QueryDisputeCreated`, `IndexingDisputeCreated`, `DisputeAccepted`, `DisputeRejected`, `DisputeDrawn`, and `DisputeLinked`. Horizon adds its own signatures for those six plus `LegacyDisputeCreated` and `DisputeCancelled`. Creation signatures changed, and even unchanged result signatures must be captured at the new contract address. These are useful account/deployment milestones. The four other Horizon events—`ArbitratorSet`, `FishermanRewardCutSet`, `MaxSlashingCutSet`, `DisputePeriodSet`—are configuration. Sources: [activity dispute stubs](../src/mappings/disputeManager.ts), [network Horizon disputes](../../graph-network-subgraph/src/mappings/horizonDisputeManager.ts).

**Payer payments:** `PaymentsEscrow.Deposit`, `Withdraw`, `Thaw`, and `CancelThaw` are meaningful funding/withdrawal actions if the product includes consumers of the network. `EscrowCollected`, `GraphTallyCollector.PaymentCollected`, `GraphPayments.GraphPaymentCollected`, and `SubgraphService.QueryFeesCollected` describe different stages/aspects of payment collection. Preserve payer, receiver/provider, collector, service, allocation/collection ID, and payment type where available; correlate related logs rather than presenting every layer as another payment. The network's GraphPayments handler notes that its payer is often the escrow contract, so this field is not automatically the end user. `SignerAuthorized`, `SignerThawing`, `SignerThawCanceled`, and `SignerRevoked` are optional payer security activity. Sources: [escrow](../../graph-network-subgraph/src/mappings/paymentsEscrow.ts), [tally collector](../../graph-network-subgraph/src/mappings/graphTallyCollector.ts), [payments](../../graph-network-subgraph/src/mappings/graphPayments.ts).

**Profiles:** `EthereumDIDRegistry.DIDAttributeChanged` can support profile metadata activity. Filter for the Graph-specific attribute as the [network mapping](../../graph-network-subgraph/src/mappings/ethereumDIDRegistry.ts) does. Existing `SetDefaultName` is not a substitute for profile metadata changes.

**Material network changes:** `IssuanceAllocator.TargetAllocationUpdated` is worth considering alongside rewards denylisting. The [network handler](../../graph-network-subgraph/src/mappings/issuanceAllocator.ts) filters for the RewardsManager target and updates its issuance rate. The activity subgraph's old RewardsManager `ParameterUpdated` subscription cannot capture this different contract/event. Protocol pauses (`PauseChanged`, `PartialPauseChanged`) may also be useful in a network-wide feed.

## Gaps that do not justify full parity by default

| Category | Remaining events | Why they can stay outside the core activity scope |
| --- | --- | --- |
| Token transfers/allowances | GraphToken `Transfer`, `Approval` | Generic wallet/ERC-20 traffic; staking/delegation actions already have domain events |
| Epoch tracking | `EpochRun`, `EpochLengthUpdate` | Bookkeeping and protocol configuration rather than individual user actions |
| Controller administration | `SetContractProxy`, `NewOwnership`, `NewPauseGuardian` | Governance/infrastructure; separate from the pause events discussed above |
| Legacy staking permissions | `SlasherUpdate`, `AssetHolderUpdate` | Protocol permissions rather than stake/delegation activity |
| General GRT bridge | L1 `DepositInitiated`, `WithdrawalFinalized`, `TokensMintedFromL2`; L2 `WithdrawalInitiated`, `DepositFinalized`; `ArbRetryableTx.RedeemScheduled` | Broader than network-position migration; migration-specific stake/delegation/subgraph events are already covered |
| Token-lock manager | `MasterCopyUpdated`, `TokenLockCreated`, `TokensDeposited`, `TokensWithdrawn`, `FunctionCallAuth`, `TokenDestinationAllowed` | Add if vesting/locked-wallet history becomes a product requirement; source is conditional |
| Token-lock wallet template | `TokensReleased`, `TokensWithdrawn`, `TokensRevoked`, `ManagerUpdated`, `ApproveTokenDestinations`, `RevokeTokenDestinations` | Dynamic wallet lifecycle; requires creation/discovery support, not just six subscriptions |

IPFS metadata templates are outside the Ethereum event counts. Activity already has subgraph and version metadata ingestion. Network additionally has deployment manifest/schema and account metadata templates. Manifest/schema ingestion is enrichment rather than a missing on-chain activity type.

Neither manifest actively subscribes to `Curation.Collected` or the commented implementation-update events. They are not part of the 103-event delta. Matching network also does not establish full contract coverage: for example, the separately inspected contracts checkout names a `PaymentsDestinationSet` event while the network ABI/manifest uses `RewardsDestinationSet`. Resolving contract-release and deployment compatibility is a separate follow-up before implementation; this report does not assume the contracts checkout equals deployed bytecode.

## Refactoring implications and proposed sequence

**First, preserve and repair the existing activity model.** Keep historical signatures. Fix version identity/classification/counters, and establish how related logs become one user operation. Add tests around initial publication, successive versions, NFT mint/transfer, and multiple activity records from one log. Raw log identity (`tx hash + log index`, plus a suffix for multiple records) and transaction grouping are both useful; never deduplicate solely by transaction hash because a transaction can contain several real actions.

**Then implement the core Horizon paths.** Add stake/delegation, provision/thaw, allocation create/resize/close, registration, cuts/operators, POI, rewards, and query-fee activity. Use small supporting entities for service/provision, allocation era, and thaw requests where later logs need context. The current activity schema has no data-service/provision model; `DelegatedStake` is only delegator+indexer, and allocation activity stores its allocation as a string. Network helpers and financial aggregates should not be copied wholesale just to produce a timeline. Source: [activity schema](../schema.graphql), [activity helpers](../src/mappings/helpers.ts).

**Next add dispute history and selected payer activity.** Keep protocol administration, generic ERC-20, general bridging, and vesting optional. Decide whether the product includes every Horizon data service or only SubgraphService; retaining the verifier/service address makes either choice possible.

Implementation needs an ABI/address preparation update as well as mapping additions. Activity uses `@graphprotocol/contracts` 6.2.0 and its address file; the network's [Arbitrum configuration](../../graph-network-subgraph/config/mainnetArbitrumAddressScript.ts) combines Horizon, SubgraphService, and issuance address books and distinguishes legacy contracts. Existing and Horizon staking subscriptions share the staking proxy address in the network manifest. Preserve historical sources and verify each chain's configured addresses/start blocks; the presence of a source in the unrendered template is not proof of a contract deployment on every chain.

Every existing activity handler that writes an event dereferences `event.receipt!` for gas fields, and the activity manifest enables receipts. Most new network handlers do not request receipts. Reusing that manifest configuration unchanged would be incompatible with these activity fields. Also add source contract, service context, and explicit timing semantics to new activity records; current `ParameterUpdatedEvent` stores only the parameter name, so different contracts' changes are indistinguishable without inspecting the transaction.

Before deployment, validate representative logs across legacy, migration, Horizon, and the newer POI flow. Particularly useful cases are a legacy allocation receiving `HorizonRewardsAssigned`, a new allocation collecting rewards without closing, a resize, a deferred POI with no reward collection, multiple thaw requests, a correlated payment flow, and slashing that affects both provision and delegation. Historical backfill requires replay/reindexing from appropriate start blocks. This research did not run a subgraph build or chain replay because it changes only research artifacts.

# Stages 1–3 implementation

Implemented in the working tree on 2026-09-28. No deployment has been performed. The [initial research](event-coverage-gap.md) remains a historical baseline; [implemented-events.csv](implemented-events.csv) lists the new event-to-entity mappings, interfaces, and counters.

## Coverage and schema

Added 29 L2 event subscriptions: 19 HorizonStaking, 8 SubgraphService, and 2 RewardsManager signatures. The existing `SubgraphUpgraded` subscription now produces curation-movement activity on L2. Arbitrum One and Arbitrum Sepolia enable these integrations through the existing `{{^isL1}}` manifest sections; Ethereum mainnet and Sepolia retain their existing L1 subscriptions. These are the four supported environments. The Horizon and SubgraphService address books contain deployments for the two Arbitrum chains; no separate Horizon feature flag is needed.

The schema now has 71 concrete activity types and 9 query interfaces. All existing interfaces remain. New `ProvisionEvent` and `DataServiceEvent` interfaces support service-specific feeds, alongside the existing indexer, delegator, account, and deployment interfaces. The 30 new concrete types each have a global counter; the two new interfaces have global counters too.

- `Provision` is identified by `<indexer-address>-<verifier-address>` and relates to the global `Indexer` and a `DataService`.
- `ProvisionDelegation` is identified by `<delegator-address>-<provision-id>`.
- These entities are created lazily from event payloads. Their presence records an observed relationship, not proof that a prior provision-creation event was indexed or that a financial position is currently active.
- `ActivityAllocation` and `ActivityThawRequest` hold optional enrichment context. They do not reconstruct stake, reward totals, or allocation balances.
- All activity interfaces/types now expose `contractAddress` and `logIndex` in addition to the existing transaction, block, timestamp, and gas fields. Existing event IDs remain transaction hash plus log index, with existing suffixes where one log produces multiple records.
- Own-stake Horizon deposit/lock/withdraw events reuse the existing `IndexerStake*Event` types and counters, with a `horizon` boolean identifying the source variant. Global own-stake activity does not create a provision.
- New service-specific delegation events retain `tokenAmount`/`shareAmount`, matching the existing schema's vocabulary. Thaw-request times are explicit timestamps; provision thawing periods are seconds. `delegatorFeeCut` preserves the raw parts-per-million share for delegators rather than silently interpreting it as the legacy indexer cut.

## Incomplete context and related events

Required interface relationships are never fabricated to make an event fit an interface:

- A known thaw request produces either `ProvisionThawRequestFulfilledEvent` or `DelegationThawRequestFulfilledEvent`, with the applicable provision/service/indexer/account and delegator interfaces. Without request context, `UnresolvedThawRequestFulfilledEvent` preserves request ID/type, tokens, shares, maturity, validity, and common log metadata through the global `Event` interface.
- Legacy/transition reward assignments with known deployment context produce `IndexingRewardsAssignedEvent`, including `SubgraphDeploymentEvent`. Without that context, `UnresolvedIndexingRewardsAssignedEvent` still exposes the known indexer, accounts, allocation ID, amount, source variant, and optional epoch through the applicable interfaces.
- These records are immutable. An unresolved record is not rewritten if enrichment becomes available later; the source IDs remain available for correlation.
- `HorizonRewardsAssigned` is suppressed when the same receipt contains a subsequent `SubgraphService.IndexingRewardsCollected` log for the same indexer, allocation, and reward amount at the configured service address. The service log owns the richer earnings record. This does not depend on earlier allocation history or on which of the two handlers runs first.
- `POIPresented` is recorded independently of reward collection, preserving the raw condition bytes. Deferred/unknown conditions therefore remain visible.
- `TokensToDelegationPoolAdded` is its own pool-addition fact. It is not recorded as a new delegation or another indexing reward.
- Service registration always retains its raw payload; URL, geohash, and rewards destination are decoded when the expected tuple is available.
- `SubgraphUpgradedEvent` describes pooled curation movement and implements the subgraph/deployment/account interfaces. It does not create another version-publication record or attribute pooled signal to one curator.

## Counter and publication corrections

All active activity handlers now use `saveActivity`. It writes common metadata and increments the concrete-type counter and each implemented interface counter exactly once for a newly stored record. Multiple participants do not multiply interface counts. Duplicate writes to the same type/ID do not inflate counts.

`scripts/generate-event-counters.cjs` derives counter membership and test assertions from `schema.graphql`. It checks that every concrete activity type and interface has a counter and that no obsolete counter fields remain. `yarn build` and `yarn test` check that the generated files match the schema. To change the schema, update `CounterEntity`, run `yarn generate:events`, then codegen/build/test.

This replaces the existing repeated manual increments, including incorrect interface attribution for legacy subgraph metadata and undercounting of version-publication plus metadata records from one log. Publication fixes also give successive GNS v2 versions distinct IDs, assign version numbers, distinguish initial versus later legacy publication, and scope the initialization flag to its publication transaction.

## Validation and development

Use Node 20.18.1 or newer, as required by the Graph CLI version shared with the network subgraph. Dependencies and lockfile pin the Graph CLI/graph-ts, address book, and Matchstick tooling used here. HorizonStaking, SubgraphService, and RewardsManager stitched ABIs were copied from the network subgraph; L2 address preparation follows its Horizon/SubgraphService address books.

```sh
yarn install --frozen-lockfile
yarn prepare:arbitrum
yarn build
yarn test
yarn lint
```

Validation covers isolated handling of every newly subscribed signature, multi-service identities, known/missing thaw context, pool slashing/additions, allocation resizing/closure, registration decoding, POI without rewards, reward receipt correlation, and publication regressions. After every test scenario, all type/interface counters are reconciled against actual stored entity counts, including zero counts. The suite contains 49 passing tests.

Preparation/build checks cover mainnet, Sepolia, Arbitrum One, and Arbitrum Sepolia. Rendered manifest checks verify new integrations are L2-only and that activity subscriptions request receipts. Lint passes with warnings for existing unused code and the non-null assertion style used by the mappings/tests. There has been no production chain replay or live GraphQL endpoint verification.

Stages 4–6 (disputes, payer/payment infrastructure, and optional network/profile activity) remain outside this implementation. Indexing start blocks remain the configured chain start blocks; choosing a shorter activity window or backfilling older records is a deployment/coverage decision, not a prerequisite for these handlers to process later events.

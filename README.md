# Graph Activity Subgraph

This repository contains the code for the Graph Activity Subgraph.

See the [Horizon activity implementation notes](research/implementation-stages-1-3.md) and [dispute/payment implementation notes](research/implementation-stages-4-5.md) for event coverage, schema/interface conventions, counters, and current build/test commands.

# Contributing to the repository

Contributions are always welcome! Likely you will want to create a PR against `mainnet-staging`. If you are unsure you can always reach out to us on discord.
## Submitting bugs

Please submit bugs as an issue in this repository.
## Maintaining the repository

This repository supports Ethereum mainnet, Sepolia, Arbitrum One, and Arbitrum Sepolia.
Use `yarn prepare:mainnet`, `yarn prepare:sepolia`, `yarn prepare:arbitrum`, or
`yarn prepare:arbitrum-sepolia` to render the Mustache manifest and generate mapping types,
then run `yarn build`.

The existing `isL1` setting selects L1/L2 sources. Horizon and SubgraphService activity
is enabled on the two Arbitrum networks. L1 addresses come from `@graphprotocol/contracts`;
L2 addresses come from `@graphprotocol/address-book`.

Indexing covers the full history of every supported event. Address preparation fills
`startBlocks.<contract>` in `config/generatedAddresses.json` from the emitting address's
creation metadata: `proxyDeployment.blockNumber` for proxies, or `deployment.blockNumber`
for contracts without a proxy. Every manifest source uses its corresponding value;
legacy and Horizon sources on the same staking proxy share its creation block.

When creation metadata is unavailable, preparation retains the existing early chain
start block. Implementation upgrade blocks are never used as a substitute. The installed
address books currently lack creation blocks for the active sources, so those sources
still use the chain fallbacks. Populating creation metadata in the address books will
automatically select exact blocks on the next prepare. `startBlockSources` in the generated
JSON records whether each value came from creation metadata or the chain fallback.

`yarn test:config` validates start-block selection and both L1/L2 manifest branches;
it also runs as part of `yarn test`.


The setup for each branch is:

```
master -            The code on master will always match the subgraph deployed to
                    graph-network-mainnet in the explorer, as well as the version of the subgraph
                    the gateway is using. All code must be reviewed before merging to master.
                    The front end team should also confirm mainnet-staging works before the
                    master branch can be updated.
                    When master is updated a hook will automatically deploy the subgraph to the
                    hosted service.

mainnet-staging -   This branch will be where mainnet subgraph updates are tested. We will let the
                    subgraph sync here, and confirm it works, before merging into master.

testnet -           This branch will contain the testnet subgraph. Development work can be done
                    here first, and then the commits brought into mainnet-staging. In general
                    it is likely this branch will be used more for new features that might not work
                    on mainnet-staging, such as contract upgrades. Then the new work would have
                    to be merged into mainnet-staging when it is appropriate to do so.

```

### Versioning

Everytime a new release is merged into `master` there will be a new github release, following semantic versioning.

# Deploying the subgraph

The npm scripts are set up to deploy the subgraphs in one command. Mainnet is connected to a hook
where it will be deployed automatically when the `master` branch is updated. Therefore, we never
have to use npm scripts to directly deploy to `graph-network-mainnet`.
### Mainnet Staging
```
yarn deploy-mainnet-staging
```

### Testnet
```
yarn deploy-testnet
```

### Testing the subgraph

If you need to test the subgraph on your personal account for the explorer (which you will have
to do if you are not part of the `graphprotocol` organization) you can run the following script:
```
yarn deploy-testing
```
Note that you will have to fill in your own subgraph name in the npm script, where it says
`<INSERT_SUBGRAPH_NAME>`. Depending if you are deploying to rinkeby or mainnet, you will also
have to fill in `prepare:rinkeby` or `prepare:mainnet` where it has `<INSERT_MAINNET_OR_RINKEBY>`.

## Documentation

For documentation on the subgraph, please see [DOCUMENTATION.md](./DOCUMENTATION.md).

This will outline nuances of the subgraph, and help shed light on some of the fields and types in
the schema.

## Copyright

Copyright &copy; 2020 The Graph Foundation.

Licensed under the [MIT license](./LICENSE).

import * as fs from 'fs'
import * as mustache from 'mustache'
// address-book package exports are resolved by Node, matching the network subgraph.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const horizonAddresses = require('@graphprotocol/address-book/horizon/addresses.json')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAddresses = require('@graphprotocol/address-book/subgraph-service/addresses.json')
const networkAddresses = { '42161': { ...horizonAddresses['42161'], ...serviceAddresses['42161'] } }
import { Addresses } from './addresses.template'

// mustache doesn't like numbered object keys
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let renameAddresses: any = networkAddresses
renameAddresses['arbitrum'] = networkAddresses['42161']

export let addresses: Addresses = {
  controller: '{{arbitrum.Controller.address}}',
  graphToken: '{{arbitrum.L2GraphToken.address}}',
  epochManager: '{{arbitrum.EpochManager.address}}',
  disputeManager: '{{arbitrum.LegacyDisputeManager.address}}',
  staking: '{{arbitrum.HorizonStaking.address}}',
  curation: '{{arbitrum.L2Curation.address}}',
  rewardsManager: '{{arbitrum.RewardsManager.address}}',
  serviceRegistry: '{{arbitrum.LegacyServiceRegistry.address}}',
  gns: '{{arbitrum.L2GNS.address}}',
  ens: '{{arbitrum.IENS.address}}',
  ensPublicResolver: '{{arbitrum.IPublicResolver.address}}',
  blockNumber: '',
  bridgeBlockNumber: '',
  network: '',
  tokenLockManager: '',
  subgraphNFT: '{{arbitrum.SubgraphNFT.address}}',
  l1GraphTokenGateway: '',
  l2GraphTokenGateway: '{{arbitrum.L2GraphTokenGateway.address}}',
  ethereumDIDRegistry: '{{arbitrum.IEthereumDIDRegistry.address}}',
  subgraphService: '{{arbitrum.SubgraphService.address}}',
  isL1: false,
}

const main = (): void => {
  try {
    let output = JSON.parse(mustache.render(JSON.stringify(addresses), renameAddresses))
    output.blockNumber = '42440000' // Hardcoded a few thousand blocks before 1st contract deployed
    output.network = 'arbitrum-one'
    output.bridgeBlockNumber = '42449749' // Bridge deployment block on L2
    output.tokenLockManager = '0xFCf78AC094288D7200cfdB367A8CD07108dFa128'
    output.useTokenLockManager = false
    if (output.ethereumDIDRegistry == '') {
      output.ethereumDIDRegistry = '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B' // since the package doens't have it yet
    }
    if (!output.staking || !output.subgraphService)
      throw new Error('Missing Horizon addresses for the selected chain')
    fs.writeFileSync(__dirname + '/generatedAddresses.json', JSON.stringify(output, null, 2))
  } catch (e) {
    throw e
  }
}

main()

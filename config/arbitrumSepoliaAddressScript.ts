import * as fs from 'fs'
import * as mustache from 'mustache'
// address-book package exports are resolved by Node, matching the network subgraph.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const horizonAddresses = require('@graphprotocol/address-book/horizon/addresses.json')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAddresses = require('@graphprotocol/address-book/subgraph-service/addresses.json')
const networkAddresses = {
  '421614': { ...horizonAddresses['421614'], ...serviceAddresses['421614'] },
}
import { Addresses } from './addresses.template'

// mustache doesn't like numbered object keys
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let renameAddresses: any = networkAddresses
renameAddresses['arbsep'] = networkAddresses['421614']

export let addresses: Addresses = {
  controller: '{{arbsep.Controller.address}}',
  graphToken: '{{arbsep.L2GraphToken.address}}',
  epochManager: '{{arbsep.EpochManager.address}}',
  disputeManager: '{{arbsep.LegacyDisputeManager.address}}',
  staking: '{{arbsep.HorizonStaking.address}}',
  curation: '{{arbsep.L2Curation.address}}',
  rewardsManager: '{{arbsep.RewardsManager.address}}',
  serviceRegistry: '{{arbsep.LegacyServiceRegistry.address}}',
  gns: '{{arbsep.L2GNS.address}}',
  ens: '{{arbsep.IENS.address}}',
  ensPublicResolver: '{{arbsep.IPublicResolver.address}}',
  blockNumber: '',
  bridgeBlockNumber: '',
  network: '',
  tokenLockManager: '',
  subgraphNFT: '{{arbsep.SubgraphNFT.address}}',
  l1GraphTokenGateway: '',
  l2GraphTokenGateway: '{{arbsep.L2GraphTokenGateway.address}}',
  ethereumDIDRegistry: '{{arbsep.EthereumDIDRegistry.address}}',
  subgraphService: '{{arbsep.SubgraphService.address}}',
  horizonDisputeManager: '{{arbsep.DisputeManager.address}}',
  paymentsEscrow: '{{arbsep.PaymentsEscrow.address}}',
  graphTallyCollector: '{{arbsep.GraphTallyCollector.address}}',
  graphPayments: '{{arbsep.GraphPayments.address}}',
  isL1: false,
}

const main = (): void => {
  try {
    let output = JSON.parse(mustache.render(JSON.stringify(addresses), renameAddresses))
    output.blockNumber = '570450'
    output.bridgeBlockNumber = '570450'
    output.network = 'arbitrum-sepolia'
    output.useTokenLockManager = false
    if (output.ens == '') {
      output.ens = '0x0000000000000000000000000000000000000000' // to avoid crashes due to bad config
    }
    if (output.ethereumDIDRegistry == '') {
      output.ethereumDIDRegistry = '0x0000000000000000000000000000000000000000' // to avoid crashes due to bad config
    }
    if (
      !output.staking ||
      !output.subgraphService ||
      !output.horizonDisputeManager ||
      !output.paymentsEscrow ||
      !output.graphTallyCollector ||
      !output.graphPayments
    )
      throw new Error('Missing Horizon addresses for the selected chain')
    fs.writeFileSync(__dirname + '/generatedAddresses.json', JSON.stringify(output, null, 2))
  } catch (e) {
    throw e
  }
}

main()

// Node-only preparation helper. Start blocks belong to the emitting address,
// which is the proxy for upgraded contracts, not its current implementation.
interface DeploymentMetadata {
  blockNumber?: unknown
}

interface AddressBookEntry {
  address: string
  proxy?: unknown
  implementation?: unknown
  deployment?: DeploymentMetadata
  proxyDeployment?: DeploymentMetadata
}

type ChainAddressBook = { [name: string]: AddressBookEntry }
type ManifestConfig = { blockNumber: string; [field: string]: unknown }

const contractFields = [
  'gns',
  'subgraphNFT',
  'serviceRegistry',
  'staking',
  'curation',
  'graphToken',
  'rewardsManager',
  'disputeManager',
  'subgraphService',
  'horizonDisputeManager',
  'paymentsEscrow',
  'graphTallyCollector',
  'graphPayments',
]

function blockNumber(value: unknown, label: string): number {
  if (
    (typeof value !== 'number' && typeof value !== 'string') ||
    (typeof value === 'string' && !/^\d+$/.test(value))
  )
    throw new Error(`Invalid creation block for ${label}: ${String(value)}`)
  const block = Number(value)
  if (!Number.isSafeInteger(block) || block < 0)
    throw new Error(`Invalid creation block for ${label}: ${String(value)}`)
  return block
}

export function populateStartBlocks(config: ManifestConfig, books: ChainAddressBook[]): void {
  const fallback = blockNumber(config.blockNumber, 'chain fallback')
  const startBlocks: { [field: string]: number } = {}
  const startBlockSources: { [field: string]: string } = {}

  for (const field of contractFields) {
    const address = config[field]
    // L1 configurations deliberately omit the L2-only contracts.
    if (address === '' || address === undefined) continue
    if (typeof address !== 'string' || !/^0x[0-9a-fA-F]{40}$/.test(address))
      throw new Error(`Invalid contract address for ${field}`)

    // Search each book independently. Shallow-merging the books can discard
    // deployment metadata, and renamed legacy contracts still share an address.
    const matches: AddressBookEntry[] = []
    for (const book of books) {
      for (const name of Object.keys(book)) {
        const entry = book[name]
        if (entry.address.toLowerCase() === address.toLowerCase()) matches.push(entry)
      }
    }
    const proxied = matches.some(
      (entry) => !!entry.proxy || !!entry.implementation || !!entry.proxyDeployment,
    )
    const metadataField = proxied ? 'proxyDeployment' : 'deployment'
    let creation: number | undefined
    for (const entry of matches) {
      const metadata = entry[metadataField]
      if (!metadata || metadata.blockNumber === undefined || metadata.blockNumber === null) continue
      const candidate = blockNumber(metadata.blockNumber, `${field}.${metadataField}`)
      // Retain the earliest creation metadata if several books describe the
      // same emitter. Never clamp an earlier creation to the chain fallback.
      creation = creation === undefined ? candidate : Math.min(creation, candidate)
    }
    startBlocks[field] = creation === undefined ? fallback : creation
    startBlockSources[field] =
      creation === undefined ? 'chainFallback' : `${metadataField}.blockNumber`
  }

  config.startBlocks = startBlocks
  config.startBlockSources = startBlockSources
}

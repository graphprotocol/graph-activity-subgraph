import { Address, BigInt, ByteArray, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts'
import { addresses } from '../../config/addresses'

export function hasServiceRewardCollection(
  event: ethereum.Event,
  indexer: Address,
  allocation: Address,
  amount: BigInt,
): boolean {
  if (event.receipt == null || addresses.subgraphService.length == 0) return false
  let signature = crypto.keccak256(
    ByteArray.fromUTF8(
      'IndexingRewardsCollected(address,address,bytes32,uint256,uint256,uint256,bytes32,bytes,uint256)',
    ),
  )
  let logs = event.receipt!.logs
  for (let i = 0; i < logs.length; i++) {
    let log = logs[i]
    if (
      log.address.toHexString() != addresses.subgraphService.toLowerCase() ||
      log.topics.length != 4
    )
      continue
    if (log.topics[0].toHexString() != signature.toHexString()) continue
    // The first unindexed word is tokensRewards. Matching the amount and log
    // order prevents a different collection in a batched transaction from
    // hiding this assignment merely because it uses the same allocation.
    if (log.data.length < 32 || log.logIndex.le(event.logIndex)) continue
    let rewardBytes = Bytes.fromUint8Array(log.data.subarray(0, 32))
    let rewards = BigInt.fromUnsignedBytes(changetype<Bytes>(rewardBytes.reverse()))
    if (!rewards.equals(amount)) continue
    if (
      log.topics[1].toHexString().slice(26) == indexer.toHexString().slice(2) &&
      log.topics[2].toHexString().slice(26) == allocation.toHexString().slice(2)
    )
      return true
  }
  return false
}

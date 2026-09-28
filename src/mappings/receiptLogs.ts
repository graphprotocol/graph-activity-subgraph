import { Address, BigInt, ByteArray, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts'

export function isLog(
  log: ethereum.Log,
  address: string,
  signature: string,
  topics: i32,
  words: i32,
): boolean {
  if (
    address.length == 0 ||
    log.address.toHexString() != address.toLowerCase() ||
    log.topics.length != topics ||
    log.data.length < words * 32
  )
    return false
  for (let i = 0; i < log.topics.length; i++) if (log.topics[i].length != 32) return false
  return (
    log.topics[0].toHexString() == crypto.keccak256(ByteArray.fromUTF8(signature)).toHexString()
  )
}

export function topicAddress(log: ethereum.Log, index: i32): Address {
  return Address.fromBytes(Bytes.fromUint8Array(log.topics[index].subarray(12)))
}

export function wordBytes(log: ethereum.Log, index: i32): Bytes {
  return Bytes.fromUint8Array(log.data.slice(index * 32, (index + 1) * 32))
}

export function wordInt(log: ethereum.Log, index: i32): BigInt {
  return BigInt.fromUnsignedBytes(changetype<Bytes>(wordBytes(log, index).reverse()))
}

export function wordAddress(log: ethereum.Log, index: i32): Address {
  return Address.fromBytes(Bytes.fromUint8Array(wordBytes(log, index).subarray(12)))
}

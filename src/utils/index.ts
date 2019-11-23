import { providerContainer } from '@lattice/core';
import { RedisClient } from 'redis';

import { sleep } from './sleep.util';

const LOCK_PREFIX = '__lock_';
const LOCK_EXPIRED = 300; // ms

export async function lock(key: string): Promise<void> {
  const client = providerContainer.get(RedisClient);
  const now = Date.now();
  const lockKey = LOCK_PREFIX + key;
  const lastTimestamp = Number(await client.get(lockKey) || 0);
  if (now > lastTimestamp && now > Number(await client.getset(lockKey, now + LOCK_EXPIRED) || 0)) {
    return;
  } else {
    await sleep(50);
    return await lock(key);
  }
}

export function unlock(key: string) {
  const client = providerContainer.get(RedisClient);
  const lockKey = LOCK_PREFIX + key;
  return client.del(lockKey);
}

export async function hasLock(key: string) {
  const client = providerContainer.get(RedisClient);
  const lockKey = LOCK_PREFIX + key;
  return Boolean(await client.get(lockKey) || 0);
}

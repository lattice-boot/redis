import * as core from '@lattice/core';
import { ClientOpts, RedisClient } from 'redis';

describe('RedisClient provider test', () => {
  let registeRecord: any;

  beforeAll(async () => {
    jest.spyOn(core, 'registFactory').mockImplementationOnce(provider => registeRecord = provider);
    await import('@redis/redis.provider');
  });

  it('should be registed factory provider', () => {
    expect(registeRecord).not.toBeUndefined();
  });

  it('should be create redisClient with factory', async () => {
    const redisOption: ClientOpts = { host: process.env.REDIS_HOST };
    const result = await registeRecord.useFactory(redisOption);
    expect(result).toBeInstanceOf(RedisClient);
  });
});

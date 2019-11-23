import * as core from '@lattice/core';
import { RedisClient, ClientOpts } from 'redis';

import { analysisKey } from '@redis/utils/analysis';
import { sleep } from '@redis/utils/sleep.util';
import { lock, unlock, hasLock } from '@redis/utils';

describe('analysisKey Test', () => {
  it('should be return string with key and context', () => {
    const context = {
      param: [{ id: '233' }],
    };
    const result = analysisKey('test_{{param.0.id}}', context);
    expect(result).toBe('test_233');
  });

  it('should be return string with nesting key and context', () => {
    const context = {
      param: [{ id: '233' }],
      filed: 'id',
    };
    const result = analysisKey('test_{{param.0.{{filed}}}}', context);
    expect(result).toBe('test_233');
  });

  it('should be throw error with wrong key', () => {
    const context = {
      param: [{ id: '233' }],
    };
    let err: Error;
    try {
      analysisKey('test_{{param.1.id}}', context);
    } catch (error) {
      err = error;
    }
    expect(err!.message).toBe('Can\'t analysis lock key');
  });

  it('should be return origin string with normal key any context', () => {
    const context = {
      param: [{ id: '233' }],
      filed: 'id',
    };
    const result = analysisKey('test_hhh', context);
    expect(result).toBe('test_hhh');
  });
});

describe('sleep Test', () => {
  it('should sleep timers', async () => {
    const before = Date.now();
    await sleep(1000);
    const after = Date.now();
    expect(after - before).not.toBeLessThan(1000);
  })
});

describe('lock Test', () => {
  let registeRecord: any;
  let valueRecord: number[] = [];

  async function test(value: number) {
    await lock('__test_func');
    await sleep(500);
    valueRecord.push(value);
    await unlock('__test_func');
  }

  beforeAll(async () => {
    jest.spyOn(core, 'registFactory').mockImplementationOnce(provider => registeRecord = provider);
    await import('@redis/redis.provider');
    const redisOption: ClientOpts = { host: process.env.REDIS_HOST };
    const client = await registeRecord.useFactory(redisOption);
    core.providerContainer.bind(RedisClient).toConstantValue(client);
  });

  it('shoud be lock test function', (done) => {
    test(1);
    test(2);
    test(3).then(() => {
      expect(valueRecord).toEqual([1, 2, 3]);
      done();
    });
  })

  it('should be check lock with hasLock', (done) => {
    test(1);
    test(2);
    test(3).then(async () => {
      const result = await hasLock('__test_func');
      expect(result).toBe(true);
      done();
    });
  })
});

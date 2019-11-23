import { registFactory } from '@lattice/core';
import { RedisClient, ClientOpts, createClient } from 'redis';

export const REDIS_OPTION = '__redis_option__';

registFactory({
  provide: RedisClient,
  useFactory: async (redisOptions: ClientOpts) => {
    return createClient(redisOptions);
  },
  inject: [REDIS_OPTION],
});
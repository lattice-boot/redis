import { analysisKey } from '@redis/utils/analysis';
import { lock, unlock } from '@redis/utils';
import { createNamespace } from 'cls-hooked';

const locker = createNamespace('redis_lockable');

export function Lockable(key: string, manually = false) {
  return (target: any, targetKey: string, desc: PropertyDescriptor) => {
    const originFunc = target[targetKey];
    desc.value = function (...args: any[]) {
      const ctx = { prototype: target, method: targetKey, param: args, this: this };
      const lockName = analysisKey(key, ctx);
      const hasLocker = Boolean(locker.get(lockName));
      if (hasLocker) {
        return originFunc.apply(this, args);
      } else {
        return locker.runPromise(async () => {
          locker.set(lockName, true);
          await lock(lockName);
          try {
            const result = await originFunc.apply(this, args);
            !manually && await unlock(lockName);
            return result;
          } catch (error) {
            !manually && await unlock(lockName);
            throw error;
          }
        });
      }
    };
  };
}

import * as utils from '@redis/utils';
import { Lockable } from '@redis/decorators';

describe('Lockable Test', () => {
  let lockRecord: string;
  let unlockRecord: string;
  let lockCount = 0;
  let unlockCount = 0;

  jest.spyOn(utils, 'lock').mockImplementation(async (key) => {
    lockRecord = key;
    lockCount++;
  });
  jest.spyOn(utils, 'unlock').mockImplementation(async (key) => {
    unlockRecord = key;
    unlockCount++;
  });
  class Test {

    @Lockable('lock_{{param.0}}')
    async func1(param: string) {
      return param;
    }

    @Lockable('lock_{{param.0}}')
    async func2(param: string) {
      throw ('err');
    }

    @Lockable('lock_{{param.0}}')
    async func3(param: string) {
      return this.func1(param);
    }

    @Lockable('lock_{{param.0}}', true)
    async func4(param: string) {
      return this.func1(param);
    }

  }

  afterAll(() => {
    jest.spyOn(utils, 'lock').mockClear();
    jest.spyOn(utils, 'unlock').mockClear();
  });

  it('should excute function with func1', async () => {
    const instance = new Test();
    const result = await instance.func1('233');
    expect(result);
  });

  it('should be lock lock_233 and unlock lock_233 around func1', () => {
    expect(lockRecord).toEqual('lock_233');
    expect(unlockRecord).toEqual('lock_233');
    lockRecord = '';
    unlockRecord = '';
  });

  it('should throw error with func2', async () => {
    const instance = new Test();
    let exception: any;
    try {
      await instance.func2('244');
    } catch (error) {
      exception = error;
    }
    expect(exception).not.toBeUndefined();
  })

  it('should be lock lock_244 and unlock lock_244 around func2', () => {
    expect(lockRecord).toEqual('lock_244');
    expect(unlockRecord).toEqual('lock_244');
    lockRecord = '';
    unlockRecord = '';
  });

  it('should not lock twice when lock function nesting', async () => {
    lockCount = 0;
    const instance = new Test();
    await instance.func3('266');
    expect(lockCount).toBe(1);
  });

  it('should not unlock with manually', async () => {
    let oldUnlockCount = unlockCount;
    const instance = new Test();
    await instance.func4('266');
    expect(oldUnlockCount - unlockCount).toBe(0);
  });
});
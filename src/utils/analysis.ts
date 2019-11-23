
export function analysisKey(key: string, context: any): string {
  const regx = /.*\{\{(.*?)\}\}.*/;
  if (regx.test(key)) {
    const index = regx.exec(key)![1];
    const value = index.split('.').reduce((target, path) => target ? target[path] : target, context);
    if (!value) throw new Error('Can\'t analysis lock key');
    const result = key.replace(new RegExp(`{{${index}}}`, 'g'), value);
    return regx.test(result) ? analysisKey(result, context) : result;
  } else {
    return key;
  }
}

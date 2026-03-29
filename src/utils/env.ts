import * as process from 'node:process';

export type BaseType = number | string | boolean | undefined | null;

const formatValue = <T extends BaseType = string>(
  key: string,
  defaultValue: T,
  parsed?: (value: string) => T,
): T => {
  const value: string | undefined = process.env[key];
  if (typeof value === 'undefined') return defaultValue;
  if (!parsed) return value as unknown as T;
  return parsed(value);
};

const envStr = (key: string, defaultValue: string = ''): string => {
  return formatValue(key, defaultValue);
};

const envNumb = (key: string, defaultValue: number = 0): number => {
  return formatValue(key, defaultValue, (value) => {
    try {
      return Number(value);
    } catch {
      return defaultValue;
    }
  });
};

const envBool = (key: string, defaultValue: boolean = false): boolean => {
  return formatValue(key, defaultValue, (value) => {
    try {
      return Boolean(JSON.parse(value));
    } catch {
      return defaultValue;
    }
  });
};

export const env = {
  str: envStr,
  numb: envNumb,
  bool: envBool,
};

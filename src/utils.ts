import { DynamicBuffer } from './dynamicBuffer';

export const rangeCheck = (field: string, value: number, min?: number, max?: number) => {
  if (min !== undefined && value < min) {
    throw RangeError(`The value of '${field}' is out of range. It must be >= ${min}. Received ${value}`);
  }

  if (max !== undefined && value > max) {
    throw RangeError(`The value of '${field}' is out of range. It must be <= ${max}. Received ${value}`);
  }
};

/**
 * Returns true if obj is a DynamicBuffer, false otherwise.
 *
 * ```js
 * import { isDynamicBuffer } from 'dynamic-buffer';
 *
 * const buf1 = new DynamicBuffer();
 * isDynamicBuffer(buf1); // true
 * const buf2 = Buffer.from('');
 * isDynamicBuffer(buf2); // false
 * ```
 */
export const isDynamicBuffer = (val: any) => val instanceof DynamicBuffer;

/**
 * Swap two element in the buffer.
 */
export const swap = (buf: Buffer, i: number, j: number) => {
  const t = buf[i];
  // eslint-disable-next-line no-param-reassign
  buf[i] = buf[j];
  // eslint-disable-next-line no-param-reassign
  buf[j] = t;
};

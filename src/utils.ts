import { DynamicBuffer } from './dynamicBuffer';

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
 * Check the value is greater or equals to the minimum value, and less or equals to the maximum
 * value. It'll throw an error if the value is not in the range.
 *
 * @param field The field name.
 * @param value The value to check.
 * @param min The allowed minimum value (included) of this value.
 * @param max The allowed maximum value (included) of this value.
 */
export const checkBounds = (field: string, value: number, min: number, max: number) => {
  if (value < min || value > max) {
    throw new RangeError(`${field} is out of bounds`);
  }
};

/**
 * Check the value in the required range, and throw an error if not satisfy the range requirement.
 *
 * @param field The field name.
 * @param value The value to check.
 * @param min The allowed minimum value (included) of this value.
 * @param max The allowed maximum value (included) of this value.
 */
export const checkRange = (field: string, value: number, min?: number, max?: number) => {
  if (min !== undefined && value < min) {
    throw new RangeError(`The value of '${field}' is out of range. It must be >= ${min}. Received ${value}`);
  }

  if (max !== undefined && value > max) {
    throw new RangeError(`The value of '${field}' is out of range. It must be <= ${max}. Received ${value}`);
  }
};

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

import { constants } from 'buffer';

import { DynamicBufferIterator } from './iterator';
import { checkBounds, checkRange, swap } from './utils';

/**
 * The character encoding that is supported by Node.js, copy from Node.js Buffer module.
 */
type BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2'
  | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex';

export interface DynamicBufferOptions {
  /**
   * Character encoding for `fill` if `fill` is a string, default 'utf8'.
   */
  encoding?: BufferEncoding;

  /**
   * The factor value for buffer resizing. By default, the `resize` method will increase the
   * buffer size with the product of the current size and this factor value.
   */
  factor?: number;

  /**
   * A value to pre-fill the new buffer with, default 0.
   */
  fill?: string | Buffer | number;

  /**
   * The initial size of the buffer, default 16.
   */
  size?: number;
}

/**
 * The `DynamicBuffer` class is a type for dealing with binary data directly, and it'll handle
 * storage size automatically.
 *
 * ```js
 * const buf = new DynamicBuffer();
 *
 * console.log(buf.append("hello world"));
 * // 11
 *
 * console.log(buf.toString());
 * // Hello world
 * ```
 */
export class DynamicBuffer {
  /**
   * The default size of the buffer, if `size` in the options is not specified.
   */
  private readonly DefaultInitialSize: number = 16;

  /**
   * The default factor value for buffer resizing.
   */
  private readonly DefaultResizeFactor: number = 0.75;

  /**
   * Internal buffer to stores data.
   */
  private buffer?: Buffer;

  /**
   * Character encoding for `fill` if `fill` is a string.
   */
  private encoding?: BufferEncoding;

  /**
   * The factor value for buffer resizing.
   */
  private factor: number;

  /**
   * A value to pre-fill the new buffer with.
   */
  private fillVal?: string | Buffer | number;

  /**
   * The current size of the buffer.
   */
  private size: number;

  /**
   * The number of bytes that used in the buffer.
   */
  private used: number;

  // eslint-disable-next-line no-undef
  [index: number]: number | undefined;

  /**
   * Create a DynamicBuffer with default settings.
   *
   * ```js
   * const buffer = new DynamicBuffer();
   *
   * // ...
   * ```
   */
  constructor();

  /**
   * Create a DynamicBuffer with the specific settings.
   *
   * ```js
   * const buffer = new DynamicBuffer({ size: 32, factor: 1 });
   * // set initial size to 32, and resize factor to 1.
   *
   * // ...
   * ```
   *
   * @param options Buffer settings.
   */
  constructor(options: DynamicBufferOptions);

  /**
   * Create a DynamicBuffer with the initial data and default settings.
   *
   * ```js
   * const buffer = new DynamicBuffer('Hello world');
   *
   * console.log(buffer.toString());
   * // Hello world
   *
   * // ...
   * ```
   *
   * @param data Initial data in the buffer.
   */
  constructor(data: string);

  /**
   * Create a DynamicBuffer with initial data and the specific settings.
   *
   * ```js
   * const buffer = new DynamicBuffer('Hello world', { size: 32 });
   * // set initial size to 32, and initial data is 'Hello world'.
   *
   * console.log(buffer.toString());
   * // Hello world
   *
   * // ...
   * ```
   *
   * @param data Initial data in the buffer.
   * @param options Buffer settings.
   */
  constructor(data: string, options: DynamicBufferOptions);

  constructor(
    data?: string | DynamicBufferOptions,
    options?: DynamicBufferOptions,
  ) {
    if (typeof data !== 'string') {
      // eslint-disable-next-line no-param-reassign
      options = data;
      // eslint-disable-next-line no-param-reassign
      data = undefined;
    }

    if (options?.size !== undefined) {
      this.size = options.size;
    } else {
      this.size = this.DefaultInitialSize;
    }

    if (data && data.length > this.size) {
      this.size = data.length;
    }

    if (this.size < 0 || this.size > constants.MAX_LENGTH) {
      throw new Error('Invalid buffer size');
    }

    this.used = 0;
    this.fillVal = options?.fill || 0;
    this.encoding = options?.encoding || 'utf8';
    this.factor = options?.factor || this.DefaultResizeFactor;

    if (this.factor <= 0 || Number.isNaN(this.factor)) {
      throw new Error('Invalid factor');
    }

    if (this.size > 0) {
      this.buffer = Buffer.alloc(this.size, this.fillVal, this.encoding);
    }

    if (data) {
      this.append(data);
    }

    // eslint-disable-next-line no-constructor-return
    return new Proxy(this, {
      get: (target: this, p: string | symbol, receiver: any) => {
        if (Reflect.has(target, p)) {
          return Reflect.get(target, p, receiver);
        }
        if (Number(p) >= 0) {
          return Reflect.apply(Reflect.get(target, 'read', receiver), target, [Number(p)]);
        }

        return Reflect.get(target, p, receiver);
      },
      set: (target: this, p: string | symbol, newValue: any, receiver: any) => {
        if (Reflect.has(target, p)) {
          return Reflect.set(target, p, newValue, receiver);
        }
        if (Number(p) >= 0) {
          Reflect.apply(Reflect.get(target, 'writeByte', receiver), target, [newValue, Number(p)]);
          return true;
        }

        return Reflect.set(target, p, newValue, receiver);
      },
    });
  }

  /**
   * Returns the number of the used bytes in this buffer.
   *
   * ```js
   * buf.append('Hello');
   * console.log(buf.length);
   * // 5
   * ```
   */
  get length() {
    return this.used;
  }

  /**
   * Appends string to this buffer according to the character encoding.
   *
   * ```js
   * buf.append('Hello ');
   * buf.append('world!');
   * console.log(buf.toString());
   * // Hello world!
   * ```
   *
   * @param data String to write to buffer.
   * @param length Maximum number of bytes to write, default the length of string.
   * @param encoding The character encoding to use, default from buffer encoding.
   * @returns The number of bytes written.
   */
  append(
    data: string,
    length?: number,
    encoding?: BufferEncoding,
  ): number {
    const count = this.writeData(data, this.used, length, encoding);
    this.used += count;

    return count;
  }

  /**
   * Takes an integer value and returns the item at that index, allowing for positive and negative
   * integers. Negative integers count back from the last item in the array. Takes an integer value
   * and returns the item at the index.
   *
   * ```js
   * buf.append('Hello world');
   * console.log(buf.at(0));
   * // 72
   *
   * @param index Zero-based index of the byte in the buffer to be returned.
   * @returns The byte at the position in the buffer.
   */
  at(index: number): number | undefined {
    if (!this.buffer || index >= this.used) {
      return undefined;
    }
    if (index >= 0) {
      return this.buffer[index];
    }
    if (typeof this.buffer.at === 'function') {
      return this.buffer.at(index - (this.size - this.length));
    }

    // For Node 14 and lower versions.
    if (index + this.length < 0) {
      return undefined;
    }

    return this.buffer[index + this.length];
  }

  /**
   * Compares this buffer with target and returns a number to indicate whether comes before, after
   * or they are the same in sort order.
   *
   * ```js
   * buf1.append('ABC');
   * buf2.append('BCD');
   * console.log(buf1.compare(buf2));
   * // -1
   * ```
   *
   * @param target A buffer (`DynamicBuffer` or builtin `Buffer`) or `Uint8Array` with which to
   * compare this buffer.
   * @param targetStart The offset within `target` at which to begin comparison, default `0`.
   * @param targetEnd the offset within `target` at which to end comparison (not inclusive),
   * default `target.length`.
   * @param sourceStart The offset within this buffer at which to begin comparison, default `0`.
   * @param sourceEnd the offset within this buffer at which to end comparison (not inclusive),
   * default `target.length`.
   * @returns `0` if `target` is the same as this buffer; `1` if `target` should come before this
   * buffer when sorted; `-1` if `target` should come after this buffer when sorted.
   */
  compare(
    target: DynamicBuffer | Buffer | Uint8Array,
    targetStart: number = 0,
    targetEnd: number = target.length,
    sourceStart: number = 0,
    sourceEnd: number = this.length,
  ): number {
    const otherBuf = target instanceof DynamicBuffer ? (target.buffer || ([] as number[])) : target;
    const thisBuf = this.buffer || ([] as number[]);

    let i = targetStart;
    let j = sourceStart;

    while (i < targetEnd && j < sourceEnd && i < target.length && j < this.length) {
      if (thisBuf[j] !== otherBuf[i]) {
        return thisBuf[j] > otherBuf[i] ? 1 : -1;
      }

      i += 1;
      j += 1;
    }

    if (i < targetEnd || (i < target.length && target.length < targetEnd)) {
      return -1;
    }
    if (j < sourceEnd || (j < this.length && this.length < sourceEnd)) {
      return 1;
    }

    return 0;
  }

  /**
   * Copies data from a region of `buf` to a region in `target`.
   *
   * @param target A buffer to copy into.
   * @param targetStart The offset within `target` at which to be begin writing, default 0.
   * @param sourceStart The offset within `buf` from which to begin copying, default 0.
   * @param sourceEnd The offset within `buf` at which to stop copying (not inclusive),
   * default `buf.length`.
   * @returns The number of bytes copied.
   */
  copy(
    target: DynamicBuffer | Buffer | Uint8Array,
    targetStart: number = 0,
    sourceStart: number = 0,
    sourceEnd: number = this.length,
  ): number {
    checkRange('targetStart', targetStart, 0);
    checkRange('sourceStart', sourceStart, 0);
    if (sourceEnd > this.length) {
      // eslint-disable-next-line no-param-reassign
      sourceEnd = this.length;
    }

    if (target instanceof DynamicBuffer) {
      return target.write(this.toString(this.encoding, sourceStart, sourceEnd), targetStart);
    }

    if (!this.buffer || this.length === 0) {
      return 0;
    }

    return this.buffer.copy(target, targetStart, sourceStart, sourceEnd);
  }

  /**
   * Returns the this buffer after copying a section of the buffer identified by start and end
   * to the same buffer starting at position target.
   *
   * @param target If target is negative, it is treated as length+target where length is the
   * length of the array.
   * @param start If start is negative, it is treated as length+start. If end is negative, it
   * is treated as length+end.
   * @param end If not specified, length of the this object is used as its default value.
   */
  copyWithin(target: number, start: number, end: number = this.length): DynamicBuffer {
    if (!this.buffer || this.length === 0) {
      return this;
    }

    this.buffer.subarray(0, this.length).copyWithin(target, start, end);

    return this;
  }

  /**
   * Creates and returns an iterator of key(index) and value(byte) pairs from this buffer.
   *
   * ```js
   * buf.append('Hello');
   *
   * for (const pair of buf.entries()) {
   *   console.log(pair);
   * }
   * // [0, 72]
   * // [1, 101]
   * // [2, 108]
   * // [3, 108]
   * // [4, 111]
   *
   * @returns Iterator of index and byte pairs from this buffer.
   * ```
   */
  entries(): IterableIterator<[number, number]> {
    return new class extends DynamicBufferIterator<[number, number]> {
      next(): IteratorResult<[number, number], any> {
        if (!this.buf.buffer || this.buf.used === this.index) {
          return {
            done: true,
            value: undefined,
          };
        }

        const i = this.index;
        const value = this.buf.buffer[this.index];
        this.index += 1;

        return {
          done: false,
          value: [i, value],
        };
      }
    }(this);
  }

  /**
   * Compare this buffer with another buffer (`DynamicBuffer` or `Buffer`) or an `Uint8Array`, and
   * returns true if they are equal, and false if not.
   *
   * This method is equivalent to `buf.compare(otherBuffer) === 0`.
   *
   * ```js
   * const buf1 = new DynamicBuffer();
   * buf1.append('Hello world');
   * const buf2 = Buffer.from('Hello world');
   *
   * console.log(buf1.equals(buf2));
   * // true
   * ```
   *
   * @param otherBuffer A buffer (`DynamicBuffer` or builtin `Buffer`) or `Uint8Array` with which
   * to compare this buffer.
   * @returns `true` if two buffers have exactly the same bytes, `false` otherwise.
   */
  equals(otherBuffer: DynamicBuffer | Buffer | Uint8Array): boolean {
    return this.compare(otherBuffer, 0, otherBuffer.length, 0, this.length) === 0;
  }

  /**
   * Determines whether all the bytes of the buffer satisfy the specified test.
   *
   * @param predicate A function that accepts up to three arguments. The every method calls the
   * predicate function for each byte in the buffer until the predicate returns a value which is
   * coercible to the Boolean value false, or until the end of the buffer.
   * @param thisArg An object to which the this keyword can refer in the predicate function. If
   * thisArg is omitted, undefined is used as the this value.
   */
  every(
    predicate: (value: number, index: number, array: Uint8Array) => unknown,
    thisArg?: any,
  ): boolean {
    if (!this.buffer || this.length <= 0) {
      return true;
    }

    return this.buffer.subarray(0, this.length).every(predicate, thisArg);
  }

  /**
   * Fills this buffer with the specified value, and the entire buffer will be filled if the offset
   * and end are not given.
   *
   * ```js
   * const buf = new DynamicBuffer('hello');
   * buf.fill('x');
   * console.log(buf.toString());
   * // xxxxx
   * ```
   *
   * @param value The value with which to be fill this buffer.
   * @param offset Number of bytes to skip before starting to fill this buffer, default 0.
   * @param end Where to stop filling this buffer (not inclusive), default `buf.length`.
   * @param encoding The encoding for value if value is a string, default `'utf8'`.
   * @returns A reference to this buffer.
   */
  fill(
    value: string | Buffer | Uint8Array | number,
    offset: number = 0,
    end: number = this.length,
    encoding: BufferEncoding = 'utf8',
  ): DynamicBuffer {
    if (!this.buffer || this.length === 0 || end - offset <= 0) {
      return this;
    }

    checkRange('offset', offset, 0, this.length - 1);
    checkRange('end', end, 0, this.length);

    this.buffer.fill(value, offset, end, encoding);

    return this;
  }

  /**
   * Returns the bytes of an array that meet the condition specified in a callback function.
   *
   * @param predicate A function that accepts up to three arguments. The filter method calls
   * the predicate function one time for each byte in the buffer.
   * @param thisArg An object to which the this keyword can refer in the predicate function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  filter(
    predicate: (value: number, index: number, array: Uint8Array) => any,
    thisArg?: any,
  ): Uint8Array {
    if (!this.buffer || this.length === 0) {
      return new Uint8Array(0);
    }

    return this.buffer.subarray(0, this.length).filter(predicate, thisArg);
  }

  /**
   * Returns the value of the first byte in the buffer where predicate is true, and undefined
   * otherwise.
   *
   * @param predicate find calls predicate once for each byte of the buffer, in ascending order,
   * until it finds one where predicate returns true. If such a byte is found, find immediately
   * returns that byte. Otherwise, find returns undefined.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  find(
    predicate: (value: number, index: number, obj: Uint8Array) => boolean,
    thisArg?: any,
  ): number | undefined {
    if (!this.buffer || this.length === 0) {
      return undefined;
    }

    return this.buffer.subarray(0, this.length).find(predicate, thisArg);
  }

  /**
   * Returns the index of the first byte in the buffer where predicate is true, and -1 otherwise.
   *
   * @param predicate find calls predicate once for each byte of the buffer, in ascending order,
   * until it finds one where predicate returns true. If such a byte is found, findIndex
   * immediately returns that byte position. Otherwise, findIndex returns -1.
   * @param thisArg If provided, it will be used as the this value for each invocation of
   * predicate. If it is not provided, undefined is used instead.
   */
  findIndex(
    predicate: (value: number, index: number, obj: Uint8Array) => boolean,
    thisArg?: any,
  ): number {
    if (!this.buffer || this.length === 0) {
      return -1;
    }

    return this.buffer.subarray(0, this.length).findIndex(predicate, thisArg);
  }

  /**
   * Performs the specified action for each byte in the buffer.
   *
   * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn
   * function one time for each byte in the buffer.
   * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If
   * thisArg is omitted, undefined is used as the this value.
   */
  forEach(
    callbackfn: (value: number, index: number, array: Uint8Array) => void,
    thisArg?: any,
  ): void {
    if (!this.buffer || this.length === 0) {
      return;
    }

    this.buffer.subarray(0, this.length).forEach(callbackfn, thisArg);
  }

  /**
   * Returns a boolean value to indicate whether this buffer includes a certain value among it.
   *
   * ```js
   * buf.append('Hello world');
   * console.log(buf.includes('world'));
   * // true
   * console.log(buf.includes('not in buffer'));
   * // false
   * ```
   *
   * @param value The value what to search for.
   * @param byteOffset Where to begin searching in the buffer, and it'll be calculated from the
   * end of buffer if it's negative. Default `0`.
   * @param encoding The character encoding if the value is a string, default 'utf8'.
   * @returns `true` if `value` was found in this buffer, `false` otherwise.
   */
  includes(
    value: string | Buffer | Uint8Array | number | DynamicBuffer,
    byteOffset: number = 0,
    encoding: BufferEncoding = 'utf8',
  ): boolean {
    return this.indexOf(value, byteOffset, encoding) !== -1;
  }

  /**
   * Gets the first index at which the given value can be found in the buffer, or `-1` if it is
   * not present.
   *
   * ```js
   * buf.append('ABCABCABC');
   * console.log(buf.indexOf('ABC'));
   * // 0
   * console.log(buf.indexOf('abc'));
   * // -1
   * ```
   *
   * @param value The value what to search for.
   * @param byteOffset Where to begin searching in the buffer, and it'll be calculated from the
   * end of buffer if it's negative. Default `0`.
   * @param encoding The character encoding if the value is a string, default 'utf8'.
   * @returns The index of first occurrence of value in the buffer, and `-1` if the buffer does
   * not contain this value.
   */
  indexOf(
    value: string | Buffer | Uint8Array | number | DynamicBuffer,
    byteOffset: number = 0,
    encoding: BufferEncoding = 'utf8',
  ): number {
    return this.indexOfWithDir(true, value, byteOffset, encoding);
  }

  /**
   * Adds all the bytes of the buffer separated by the specified separator string.
   *
   * @param separator A string used to separate one byte of the buffer from the next in the
   * resulting String. If omitted, the bytes are separated with a comma.
   */
  join(separator?: string): string {
    if (!this.buffer || this.length === 0) {
      return '';
    }

    return this.buffer.subarray(0, this.length).join(separator);
  }

  /**
   * Creates and returns an iterator for keys(indices) in this buffer.
   *
   * ```js
   * buf.append('Hello');
   *
   * for (const key of buf.keys()) {
   *   console.log(key);
   * }
   * // 0
   * // 1
   * // 2
   * // 3
   * // 4
   *
   * @returns Iterator of buffer keys.
   * ```
   */
  keys(): IterableIterator<number> {
    return new class extends DynamicBufferIterator<number> {
      next(): IteratorResult<number, any> {
        if (!this.buf.buffer || this.buf.used === this.index) {
          return {
            done: true,
            value: undefined,
          };
        }

        const value = this.index;
        this.index += 1;

        return {
          done: false,
          value,
        };
      }
    }(this);
  }

  /**
   * Gets the last index at which the given value can be found in the buffer, or `-1` if it is
   * not present.
   *
   * ```js
   * buf.append('ABCABCABC');
   * console.log(buf.indexOf('ABC'));
   * // 6
   * console.log(buf.indexOf('abc'));
   * // -1
   * ```
   *
   * @param value The value what to search for.
   * @param byteOffset Where to begin searching in the buffer, and it'll be calculated from the
   * end of buffer if it's negative. Default `this.length`.
   * @param encoding The character encoding if the value is a string, default 'utf8'.
   * @returns The index of last occurrence of value in the buffer, and `-1` if the buffer does
   * not contain this value.
   */
  lastIndexOf(
    value: string | Buffer | Uint8Array | number | DynamicBuffer,
    byteOffset: number = this.length,
    encoding: BufferEncoding = 'utf8',
  ): number {
    return this.indexOfWithDir(false, value, byteOffset, encoding);
  }

  /**
   * Calls a defined callback function on each byte of the buffer, and returns an array that
   * contains the results.
   *
   * @param callbackfn A function that accepts up to three arguments. The map method calls the
   * callbackfn function one time for each byte in the buffer.
   * @param thisArg An object to which the this keyword can refer in the callbackfn function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  map(
    callbackfn: (value: number, index: number, array: Uint8Array) => number,
    thisArg?: any,
  ): Uint8Array {
    if (!this.buffer || this.length === 0) {
      return new Uint8Array(0);
    }

    return this.buffer.subarray(0, this.length).map(callbackfn, thisArg);
  }

  /**
   * Reads and returns a byte at the position `offset` in this buffer.
   *
   * ```js
   * buf.append('Hello world');
   * console.log(buf.read(0));
   * // 72
   * ```
   *
   * @param offset Number of bytes to skip before starting to read, default `0`.
   * @returns The byte at the position in the buffer.
   */
  read(offset: number = 0): number | undefined {
    if (!this.buffer || offset < 0 || offset >= this.used) {
      return undefined;
    }

    return this.buffer[offset];
  }

  /**
   * Calls the specified callback function for all the bytes in an buffer. The return value of
   * the callback function is the accumulated result, and is provided as an argument in the next
   * call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduce method calls the
   * callbackfn function one time for each byte in the buffer.
   * @param initialValue If initialValue is specified, it is used as the initial value to start
   * the accumulation. The first call to the callbackfn function provides this value as an argument
   * instead of a byte value.
   */
  reduce(
    callbackfn: (
      previousValue: number,
      currentValue: number,
      currentIndex: number,
      array: Uint8Array,
    ) => number,
  ): number;

  reduce(
    callbackfn: (
      previousValue: number,
      currentValue: number,
      currentIndex: number,
      array: Uint8Array,
    ) => number,
    initialValue: number,
  ): number;

  reduce<T>(
    callbackfn: (
      previousValue: T,
      currentValue: number,
      currentIndex: number,
      array: Uint8Array,
    ) => T,
    initialValue: T,
  ): T;

  reduce(
    callbackfn: (
      previousValue: any,
      currentValue: number,
      currentIndex: number,
      array: Uint8Array,
    ) => any,
    initialValue?: any,
  ): any {
    if (!this.buffer || this.length <= 0) {
      if (initialValue === undefined) {
        throw new TypeError('Reduce of empty buffer with no initial value');
      }

      return initialValue;
    }

    if (initialValue !== undefined) {
      return this.buffer.subarray(0, this.length).reduce(callbackfn, initialValue);
    }
    return this.buffer.subarray(0, this.length).reduce(callbackfn);
  }

  /**
   * Calls the specified callback function for all the bytes in the buffer, in descending order.
   * The return value of the callback function is the accumulated result, and is provided as an
   * argument in the next call to the callback function.
   *
   * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls
   * the callbackfn function one time for each byte in the buffer.
   * @param initialValue If initialValue is specified, it is used as the initial value to start
   * the accumulation. The first call to the callbackfn function provides this value as an
   * argument instead of a byte value.
   */
  reduceRight(
    callbackfn: (
      previousValue: number,
      currentValue: number,
      currentIndex: number,
      array: Uint8Array,
    ) => number,
  ): number;

  reduceRight(
    callbackfn: (
      previousValue: number,
      currentValue: number,
      currentIndex: number,
      array: Uint8Array,
    ) => number,
    initialValue: number,
  ): number;

  reduceRight<T>(
    callbackfn: (
      previousValue: T,
      currentValue: number,
      currentIndex: number,
      array: Uint8Array,
    ) => T,
    initialValue: T,
  ): T;

  reduceRight(
    callbackfn: (
      previousValue: any,
      currentValue: number,
      currentIndex: number,
      array: Uint8Array,
    ) => any,
    initialValue?: any,
  ): any {
    if (!this.buffer || this.length <= 0) {
      if (initialValue === undefined) {
        throw new TypeError('ReduceRight of empty buffer with no initial value');
      }

      return initialValue;
    }

    if (initialValue !== undefined) {
      return this.buffer.subarray(0, this.length).reduceRight(callbackfn, initialValue);
    }
    return this.buffer.subarray(0, this.length).reduceRight(callbackfn);
  }

  /**
   * Reverses the buffer in place and returns the reference to the buffer. The first byte in the
   * buffer now becoming the last, and the last byte in the buffer becoming the first.
   *
   * ```js
   * const buf = new DynamicBuffer('ABC');
   * console.log(buf.reverse().toString());
   * // CBA
   * console.log(buf.toString());
   * // CBA
   * ```
   *
   * @returns The reference to this buffer.
   */
  reverse(): DynamicBuffer {
    if (!this.buffer || this.length === 0) {
      return this;
    }

    this.buffer.subarray(0, this.length).reverse();

    return this;
  }

  /**
   * Sets a value or an array of values.
   *
   * @param array A typed or untyped array of values to set.
   * @param offset The index in the current array at which the values are to be written.
   */
  set(array: ArrayLike<number>, offset: number = 0): void {
    if (array.length > 0) {
      checkBounds('offset', offset, 0, this.length - array.length);
    }

    if (!this.buffer || this.length <= 0) {
      return;
    }

    this.subarray(0, this.length).set(array, offset);
  }

  /**
   * Determines whether the specified callback function returns true for any byte of the buffer.
   *
   * @param predicate A function that accepts up to three arguments. The some method calls the
   * predicate function for each byte in the buffer until the predicate returns a value which is
   * coercible to the Boolean value true, or until the end of the buffer.
   * @param thisArg An object to which the this keyword can refer in the predicate function.
   * If thisArg is omitted, undefined is used as the this value.
   */
  some(
    predicate: (value: number, index: number, array: Uint8Array) => unknown,
    thisArg?: any,
  ): boolean {
    if (!this.buffer || this.length === 0) {
      return false;
    }

    return this.buffer.subarray(0, this.length).some(predicate, thisArg);
  }

  /**
   * Sorts all bytes in the buffer.
   *
   * ```js
   * const buf = new DynamicBuffer('cba');
   * buf.sort();
   * console.log(buf.toString());
   * // abc
   * ```
   *
   * @param compareFn Function used to determine the order of the elements. It is expected to
   * return a negative value if first argument is less than second argument, zero if they're
   * equal and a positive value otherwise. If omitted, the elements are sorted in ascending order.
   * @returns The reference of this buffer.
   */
  sort(compareFn?: (a: number, b: number) => number): this {
    if (this.buffer && this.length > 0) {
      this.buffer.subarray(0, this.length).sort(compareFn);
    }

    return this;
  }

  /**
   * Returns a new Buffer that references the same memory as the original, but offset and cropped
   * by the start and end indices.
   *
   * ```ts
   * const buf = new DynamicBuffer('ABCD');
   * const sub = buf.subarray(1, 3);
   * sub[0] = 67;
   * sub[1] = 66;
   * console.log(buf.toString());
   * // ACBD
   * ```
   *
   * @param start Where the new `Buffer` will start, default 0.
   * @param end Where the new `Buffer` will end (not inclusive), default the length of this buffer.
   * @returns The new buffer.
   */
  subarray(start: number = 0, end: number = this.length): Buffer {
    const { startOffset, endOffset } = this.calculateOffsets(start, end);

    if (!this.buffer || this.length === 0) {
      return Buffer.alloc(0);
    }

    return this.buffer?.subarray(startOffset, endOffset);
  }

  /**
   * Interprets buf as an array of unsigned 16-bit integers and swaps the byte order in-place.
   *
   * ```ts
   * const buf = new DynamicBuffer('ABCDEFGH');
   * buf.swap16();
   * console.log(buf.toString());
   * // BADCFEHG
   * ```
   *
   * @returns A reference to this buffer.
   */
  swap16(): DynamicBuffer {
    if (this.length % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 2');
    }

    if (this.length === 0 || !this.buffer) {
      return this;
    }

    if (this.length < 128 || typeof this.buffer.swap16 !== 'function') {
      for (let i = 0; i < this.length; i += 2) {
        swap(this.buffer, i, i + 1);
      }
    } else {
      this.buffer.subarray(0, this.length).swap16();
    }

    return this;
  }

  /**
   * Interprets buf as an array of unsigned 32-bit integers and swaps the byte order in-place.
   *
   * ```ts
   * const buf = new DynamicBuffer('ABCDEFGH');
   * buf.swap32();
   * console.log(buf.toString());
   * // DCBAHGFE
   * ```
   *
   * @returns A reference to this buffer.
   */
  swap32(): DynamicBuffer {
    if (this.length % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 4');
    }

    if (this.length === 0 || !this.buffer) {
      return this;
    }

    if (this.length < 192 || typeof this.buffer.swap32 !== 'function') {
      for (let i = 0; i < this.length; i += 4) {
        swap(this.buffer, i, i + 3);
        swap(this.buffer, i + 1, i + 2);
      }
    } else {
      this.buffer.subarray(0, this.length).swap32();
    }

    return this;
  }

  /**
   * Interprets buf as an array of unsigned 64-bit integers and swaps the byte order in-place.
   *
   * ```ts
   * const buf = new DynamicBuffer('ABCDEFGH');
   * buf.swap64();
   * console.log(buf.toString());
   * // HGFEDCBA
   * ```
   *
   * @returns A reference to this buffer.
   */
  swap64(): DynamicBuffer {
    if (this.length % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 8');
    }

    if (this.length === 0 || !this.buffer) {
      return this;
    }

    if (this.length < 192 || typeof this.buffer.swap32 !== 'function') {
      for (let i = 0; i < this.length; i += 8) {
        swap(this.buffer, i, i + 7);
        swap(this.buffer, i + 1, i + 6);
        swap(this.buffer, i + 2, i + 5);
        swap(this.buffer, i + 3, i + 4);
      }
    } else {
      this.buffer.subarray(0, this.length).swap64();
    }

    return this;
  }

  /**
   * Copies the buffer data onto a new `Buffer` instance without unused parts.
   *
   * ```js
   * buf.append('Hello');
   * console.log(buf.toBuffer());
   * // <Buffer 48 65 6c 6c 6f>
   * ```
   *
   * @param start The byte offset to start coping at, default 0.
   * @param end The byte offset to stop coping at (not inclusive), default used bytes offset.
   * @returns The new buffer contains the written data in this buffer.
   */
  toBuffer(start: number = 0, end: number = this.used): Buffer {
    if (!this.buffer || this.used === 0) {
      return Buffer.alloc(0);
    }

    const { startOffset, endOffset } = this.calculateOffsets(start, end);
    if (endOffset - startOffset === 0) {
      return Buffer.alloc(0);
    }

    const newBuffer = Buffer.alloc(endOffset - startOffset, this.fillVal, this.encoding);
    this.buffer.copy(newBuffer, 0, startOffset, endOffset);

    return newBuffer;
  }

  /**
   * Returns a JSON representation of this buffer.
   *
   * ```js
   * const buf = new DynamicBuffer();
   * buf.append("Hello");
   * console.log(JSON.stringify(buf));
   * // {"type":"Buffer","data":[72,101,108,108,111]}
   * ```
   */
  toJSON(): { type: string, data: number[] } {
    const data: number[] = [];

    if (this.buffer && this.used > 0) {
      // eslint-disable-next-line no-restricted-syntax
      for (const pair of this.buffer.entries()) {
        if (pair[0] >= this.used) {
          break;
        }

        data.push(pair[1]);
      }
    }

    return {
      type: 'Buffer',
      data,
    };
  }

  /**
   * Decodes buffer to a string with the specified character encoding and range. It's an alias of
   * toString().
   *
   * ```js
   * const buf = new DynamicBuffer('hello');
   * console.log(buf.toLocaleString());
   * // hello
   * ```
   *
   * @returns The string decodes from buffer
   */
  toLocaleString() {
    return this.toString();
  }

  /**
   * Decodes buffer to a string with the specified character encoding and range.
   *
   * ```js
   * buf.append('Hello');
   * console.log(buf.toString());
   * // Hello
   * ```
   *
   * @param encoding The character encoding to use, default from buffer encoding.
   * @param start The byte offset to start decoding at, default 0.
   * @param end The byte offset to stop decoding at (not inclusive), default used bytes offset.
   * @returns The string decodes from buffer with the specified range.
   */
  toString(
    encoding: BufferEncoding | undefined = this.encoding,
    start: number = 0,
    end: number = this.used,
  ): string {
    if (!this.buffer || this.used === 0) {
      return '';
    }

    const { startOffset, endOffset } = this.calculateOffsets(start, end);
    if (endOffset - startOffset === 0) {
      return '';
    }

    return this.buffer.toString(encoding, startOffset, endOffset);
  }

  /**
   * Creates and returns an iterator for values(bytes) in this buffer.
   *
   * ```js
   * buf.append('Hello');
   * for (const value of buf.values()) {
   *   console.log(value);
   * }
   * // 72
   * // 101
   * // 108
   * // 108
   * // 111
   *
   * @returns Iterator of buffer values.
   * ```
   */
  values(): IterableIterator<number> {
    return new class extends DynamicBufferIterator<number> {
      next(): IteratorResult<number, any> {
        if (!this.buf.buffer || this.buf.used === this.index) {
          return {
            done: true,
            value: undefined,
          };
        }

        const value = this.buf.buffer[this.index];
        this.index += 1;

        return {
          done: false,
          value,
        };
      }
    }(this);
  }

  /**
   * Writes data to this buffer at offset according to the specific character encoding.
   *
   * ```js
   * buf.write('Hello!');
   * console.log(buf.toString());
   * // Hello!
   * buf.write(' world!', 5);
   * console.log(buf.toString());
   * // Hello world!
   * ```
   *
   * @param data String to write to buffer.
   * @param offset Number of bytes to skip before starting to write data, default 0.
   * @param length Maximum number of bytes to write, default the length of string.
   * @param encoding The character encoding to use, default from buffer encoding.
   * @returns Number of bytes written.
   */
  write(
    data: string,
    offset: number = 0,
    length: number = data.length,
    encoding: BufferEncoding | undefined = this.encoding,
  ): number {
    if (offset < 0) {
      checkRange('offset', offset, 0);
    }

    const count = this.writeData(data, offset, length, encoding);
    this.used = offset + count;

    return count;
  }

  /**
   * Calculate start and end offsets by optional parameters.
   *
   * @param start The start byte offset, default 0.
   * @param end The end byte offset, default used bytes offset.
   * @returns The start and end byte offsets.
   */
  private calculateOffsets(
    start?: number,
    end?: number,
  ): {
    startOffset: number,
    endOffset: number,
  } {
    let startOffset = start;
    let endOffset = end;

    if (!startOffset || startOffset < 0) {
      startOffset = 0;
    } else if (startOffset > this.used) {
      startOffset = this.used;
    }

    if (endOffset === undefined || endOffset > this.used) {
      endOffset = this.used;
    }

    return {
      startOffset,
      endOffset,
    };
  }

  /**
   * Ensures the buffer size is at least equal to the expect size.
   *
   * @param expectSize The number of bytes that minimum size is expected.
   */
  private ensureSize(expectSize: number): void {
    if (this.size >= expectSize) {
      return;
    }

    if (expectSize > constants.MAX_LENGTH) {
      throw new Error('Buffer size is overflow');
    }

    const sizeWithFactor = Math.ceil(this.size * (1 + this.factor));
    let newSize = expectSize > sizeWithFactor ? expectSize : sizeWithFactor;

    if (newSize > constants.MAX_LENGTH) {
      newSize = constants.MAX_LENGTH;
    }

    this.resize(newSize);
  }

  /**
   * Gets the first or last index at which the given value can be found in the buffer, or `-1`
   * if it is not present.
   *
   * @param isFirst A boolean value to indicate the expected index is the first or last occurrence.
   * @param value The value what to search for.
   * @param byteOffset here to begin searching in the buffer.
   * @param encoding The character encoding if the value is a string
   * @returns The index of first or last occurrence of value in the buffer, and `-1` if the buffer
   * does not contain this value.
   */
  private indexOfWithDir(
    isFirst: boolean,
    value: string | Buffer | Uint8Array | number | DynamicBuffer,
    byteOffset: number,
    encoding: BufferEncoding,
  ): number {
    let search: string | Buffer | Uint8Array | number;
    if (value instanceof DynamicBuffer) {
      search = value.buffer?.subarray(0, value.length) || '';
    } else {
      search = value;
    }

    if (!this.buffer || this.length === 0) {
      return (typeof search === 'object' || typeof search === 'string') && search.length === 0
        ? 0
        : -1;
    }

    let start = byteOffset >= 0 ? byteOffset : this.length + byteOffset;
    if (start >= this.length) {
      start = this.length;
    }

    if (isFirst) {
      return this.buffer.subarray(0, this.length).indexOf(search, start, encoding);
    }

    return this.buffer.subarray(0, this.length).lastIndexOf(search, start, encoding);
  }

  /**
   * Allocates a new buffer with the new size, and copies data from the old buffer to the new
   * buffer if the old buffer is not empty.
   *
   * @param newSize The size of new buffer.
   */
  private resize(newSize: number): void {
    const newBuffer = Buffer.alloc(newSize, this.fillVal, this.encoding);

    if (this.buffer && this.used > 0) {
      this.buffer.copy(newBuffer, 0, 0, this.used);
    }

    this.buffer = newBuffer;
    this.size = newSize;
  }

  /**
   * Writes data to the specified position in the buffer, and skip if out of used range.
   *
   * @param data Data to write to buffer.
   * @param offset The position to write data.
   */
  private writeByte(data: any, offset: number) {
    if (!this.buffer || this.length === 0 || offset >= this.length) {
      return;
    }

    this.buffer[offset] = data;
  }

  /**
   * Write data into internal buffer with the specified offset.
   *
   * @param data String to write to buffer.
   * @param offset Number of bytes to skip before starting to write data.
   * @param length Maximum number of bytes to write, default the length of string.
   * @param encoding The character encoding to use, default from buffer encoding.
   * @returns Number of bytes written.
   */
  private writeData(
    data: string,
    offset: number,
    length?: number,
    encoding?: BufferEncoding,
  ): number {
    if (typeof data !== 'string') {
      throw new TypeError('argument must be a string');
    }

    let lengthToWrite = data.length || 0;
    if (length !== undefined && length >= 0 && length <= data.length) {
      lengthToWrite = length;
    }

    if (lengthToWrite === 0) {
      return 0;
    }

    this.ensureSize(lengthToWrite + offset);

    const count = this.buffer?.write(data, offset, lengthToWrite, encoding || this.encoding);

    return count || 0;
  }
}

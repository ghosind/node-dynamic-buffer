import { constants } from 'buffer';

import { DynamicBufferIterator } from './iterator';

/**
 * The character encoding that is supported by Node.js, copy from Node.js Buffer module.
 */
type BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2'
  | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex';

export interface DynamicBufferOptions {
  /**
   * The initial size of the buffer, default 16.
   */
  size?: number;

  /**
   * A value to pre-fill the new buffer with, default 0.
   */
  fill?: string | Buffer | number;

  /**
   * Character encoding for `fill` if `fill` is a string, default 'utf8'.
   */
  encoding?: BufferEncoding;

  factor?: number;
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

  private readonly DefaultResizeFactor: number = 0.75;

  /**
   * Internal buffer to stores data.
   */
  private buffer?: Buffer;

  /**
   * The number of bytes that used in the buffer.
   */
  private used: number;

  /**
   * The current size of the buffer.
   */
  private size: number;

  /**
   * A value to pre-fill the new buffer with.
   */
  private fill?: string | Buffer | number;

  /**
   * Character encoding for `fill` if `fill` is a string.
   */
  private encoding?: BufferEncoding;

  private factor: number;

  constructor(options?: DynamicBufferOptions) {
    if (options?.size !== undefined) {
      this.size = options.size;
    } else {
      this.size = this.DefaultInitialSize;
    }

    if (this.size < 0 || this.size > constants.MAX_LENGTH) {
      throw new Error('Invalid buffer size');
    }

    this.used = 0;
    this.fill = options?.fill || 0;
    this.encoding = options?.encoding || 'utf8';
    this.factor = options?.factor || this.DefaultResizeFactor;

    if (this.factor <= 0 || Number.isNaN(this.factor)) {
      throw new TypeError('Invalid factor');
    }

    if (this.size > 0) {
      this.buffer = Buffer.alloc(this.size, this.fill, this.encoding);
    }
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
  append(data: string, length?: number, encoding?: BufferEncoding): number;

  /**
   * Appends string to this buffer according to the character encoding.
   *
   * @param data String to write to buffer.
   * @param encoding The character encoding to use, default from buffer encoding.
   * @param length Maximum number of bytes to write, default the length of string.
   * @returns The number of bytes written.
   * @deprecated
   */
  append(data: string, encoding?: BufferEncoding, length?: number): number;

  append(
    data: string,
    lengthParam?: number | BufferEncoding,
    encodingParam?: BufferEncoding | number,
  ): number {
    let length: number | undefined;
    let encoding: BufferEncoding | undefined;

    if (typeof lengthParam === 'number' || typeof encodingParam === 'string') {
      // @ts-ignore
      length = lengthParam;
      // @ts-ignore
      encoding = encodingParam;
    } else {
      encoding = lengthParam;
      length = encodingParam;
    }

    const count = this.writeData(data, this.used, length, encoding);
    this.used += count;

    return count;
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
      throw new RangeError('The value of "offset" is out of range.');
    }

    const count = this.writeData(data, offset, length, encoding);
    this.used = offset + count;

    return count;
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
   * @param offset Number of bytes to skip before starting to read, and the offset must satisfy
   * between 0 and `this.length - `, default `0`.
   * @returns The byte at the position in the buffer.
   */
  read(offset: number = 0): number {
    if (!this.buffer || offset < 0 || offset >= this.used) {
      throw new RangeError(`The value of "offset" is out of range. It must be >= 0 and <= ${
        this.used - 1
      }. Received ${
        offset
      }`);
    }

    return this.buffer[offset];
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

    const newBuffer = Buffer.alloc(endOffset - startOffset, this.fill, this.encoding);
    this.buffer.copy(newBuffer, 0, startOffset, endOffset);

    return newBuffer;
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
   * Allocates a new buffer with the new size, and copies data from the old buffer to the new
   * buffer if the old buffer is not empty.
   *
   * @param newSize The size of new buffer.
   */
  private resize(newSize: number): void {
    const newBuffer = Buffer.alloc(newSize, this.fill, this.encoding);

    if (this.buffer && this.used > 0) {
      this.buffer.copy(newBuffer, 0, 0, this.used);
    }

    this.buffer = newBuffer;
    this.size = newSize;
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
}

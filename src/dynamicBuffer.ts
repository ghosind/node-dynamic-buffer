import { constants } from 'buffer';

import { DynamicBufferIterator } from './iterator';

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

    if (this.size > 0) {
      this.buffer = Buffer.alloc(this.size, this.fill, this.encoding);
    }
  }

  /**
   * Returns the number of the used bytes in this buffer.
   */
  get length() {
    return this.used;
  }

  /**
   * Appends string to this buffer according to the character encoding.
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
  ) {
    if (typeof data !== 'string') {
      throw new TypeError('argument must be a string');
    }

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

    let lengthToWrite = data.length || 0;
    if (length !== undefined && length >= 0 && length <= data.length) {
      lengthToWrite = length;
    }

    if (lengthToWrite === 0) {
      return 0;
    }

    this.ensureSize(lengthToWrite + this.used);

    const count = this.buffer?.write(data, this.used, lengthToWrite, encoding || this.encoding);
    this.used += count || 0;

    return count;
  }

  /**
   * Copies the buffer data onto a new `Buffer` instance without unused parts.
   *
   * @param start The byte offset to start coping at, default 0.
   * @param end The byte offset to stop coping at (not inclusive), default used bytes offset.
   * @returns The new buffer contains the written data in this buffer.
   */
  toBuffer(start?: number, end?: number) {
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
   * @param encoding The character encoding to use, default from buffer encoding.
   * @param start The byte offset to start decoding at, default 0.
   * @param end The byte offset to stop decoding at (not inclusive), default used bytes offset.
   * @returns The string decodes from buffer with the specified range.
   */
  toString(encoding?: BufferEncoding, start?: number, end?: number) {
    if (!this.buffer || this.used === 0) {
      return '';
    }

    const { startOffset, endOffset } = this.calculateOffsets(start, end);
    if (endOffset - startOffset === 0) {
      return '';
    }

    return this.buffer.toString(encoding || this.encoding, startOffset, endOffset);
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
  toJSON() {
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
   * Ensures the buffer size is at least equal to the expect size.
   *
   * @param expectSize The number of bytes that minimum size is expected.
   */
  private ensureSize(expectSize: number) {
    if (this.size >= expectSize) {
      return;
    }

    if (expectSize > constants.MAX_LENGTH) {
      throw new Error('Buffer size is overflow');
    }

    let newSize = this.size ? this.size * 2 : expectSize;
    while (newSize < expectSize) {
      newSize *= 2;
    }

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
  private resize(newSize: number) {
    const newBuffer = Buffer.alloc(newSize, this.fill, this.encoding);

    if (this.buffer && this.used > 0) {
      this.buffer.copy(newBuffer, 0, 0, this.used);
    }

    this.buffer = newBuffer;
    this.size = newSize;
  }

  /**
   * Calculate start and end offsets by optional parameters.
   *
   * @param start The start byte offset, default 0.
   * @param end The end byte offset, default used bytes offset.
   * @returns The start and end byte offsets.
   */
  private calculateOffsets(start?: number, end?: number) {
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

import { constants } from 'buffer';

export interface DynamicBufferOptions {
  /**
   * The initial size of the buffer, default 256.
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
  private readonly DefaultInitialSize: number = 1 << 8;

  /**
   * Internal buffer to stores data.
   */
  private buffer: Buffer;

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
    this.size = options?.size || this.DefaultInitialSize;
    if (this.size <= 0 || this.size > constants.MAX_LENGTH) {
      throw new Error('Invalid buffer size');
    }

    this.used = 0;
    this.fill = options?.fill || 0;
    this.encoding = options?.encoding || 'utf8';

    this.buffer = Buffer.alloc(this.size, this.fill, this.encoding);
  }

  /**
   * Appends string to this buffer according to the character encoding.
   * 
   * @param data String to write to buffer.
   * @param encoding The character encoding to use, default from buffer encoding.
   * @param length Maximum number of bytes to write, default the length of string.
   * @returns The number of bytes written.
   */
  append(data: string, encoding?: BufferEncoding, length?: number) {
    let lengthToWrite = data?.length || 0;
    if (length !== undefined && length >= 0 && length <= data.length) {
      lengthToWrite = length;
    }

    if (lengthToWrite === 0) {
      return 0;
    }

    if (lengthToWrite + this.used > this.size) {
      this.resize();
    }

    const count = this.buffer.write(data, this.used, lengthToWrite, encoding || this.encoding);
    this.used += count;

    return count;
  }

  /**
   * Copies the buffer data onto a new `Buffer` instance without unused parts.
   * 
   * @returns The new buffer contains the written data in this buffer.
   */
  toBuffer() {
    return Buffer.from(this.buffer, 0, this.used);
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

    return this.buffer.toString(encoding || this.encoding, startOffset, endOffset);
  }

  private resize() {
    const newBuffer = Buffer.alloc(this.size * 2, this.fill, this.encoding);
    this.buffer.copy(newBuffer, 0, 0, this.used);

    this.buffer = newBuffer;
  }
}

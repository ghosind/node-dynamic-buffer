import { constants } from 'buffer';

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
    this.size = options?.size || this.DefaultInitialSize;
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

    const { startOffset, endOffset } = this.calculateOffsets(start, end) ;
    if (endOffset - startOffset === 0) {
      return Buffer.alloc(0);
    }

    return Buffer.from(this.buffer, startOffset, endOffset);
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

    const { startOffset, endOffset } = this.calculateOffsets(start, end) ;
    if (endOffset - startOffset === 0) {
      return '';
    }

    return this.buffer.toString(encoding || this.encoding, startOffset, endOffset);
  }

  /**
   * Ensures the buffer size is at least equal to the expect size.
   *
   * @param expectSize The number of bytes that minimum size is expected.
   */
  private ensureSize(expectSize: number) {
    if (this.used <= expectSize) {
      return;
    }

    if (expectSize > constants.MAX_LENGTH) {
      throw new Error('Buffer size is overflow');
    }

    let newSize = this.used * 2;
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
   * @param newSize
   */
  private resize(newSize: number) {
    const newBuffer = Buffer.alloc(newSize, this.fill, this.encoding);

    if (this.buffer && this.used > 0) {
      this.buffer.copy(newBuffer, 0, this.used);
    }

    this.buffer = newBuffer;
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
    }
  }
}

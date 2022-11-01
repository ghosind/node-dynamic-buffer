import { constants } from 'buffer';

export interface DynamicBufferOptions {
  size?: number;

  fill?: string | Buffer | number;

  encoding?: BufferEncoding;
}

export class DynamicBuffer {
  private buffer: Buffer;

  private used: number;

  private size: number;

  private fill?: string | Buffer | number;

  private encoding?: BufferEncoding;

  private readonly DefaultInitialSize: number = 1 << 8;

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

  append(data: string, encoding?: BufferEncoding) {
    if (data.length + this.used > this.size) {
      this.resize();
    }

    this.used = this.buffer.write(data, this.used, encoding || this.encoding);
    return this.used;
  }

  toBuffer() {
    return Buffer.from(this.buffer, 0, this.used);
  }

  /**
   * Decodes buffer to a string with the specified character encoding and range.
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

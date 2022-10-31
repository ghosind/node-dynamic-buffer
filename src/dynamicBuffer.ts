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

  private resize() {
    const newBuffer = Buffer.alloc(this.size * 2, this.fill, this.encoding);
    this.buffer.copy(newBuffer, 0, 0, this.used);

    this.buffer = newBuffer;
  }
}

import { DynamicBuffer } from '.';

/**
 * Abstract iterator class for DynamicBuffer.
 *
 * ```js
 * class ValueIterator extends DynamicBufferIterator<number> {
 *   next() {
 *     // ...
 *   }
 * }
 * ```
 */
export abstract class DynamicBufferIterator<T> implements IterableIterator<T> {
  protected buf: DynamicBuffer;

  protected index: number;

  constructor(buf: DynamicBuffer) {
    this.buf = buf;
    this.index = 0;
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this;
  }

  abstract next(): IteratorResult<T, any>;
}

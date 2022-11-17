import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Read tests', () => {
  it('Test read without parameter', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world';

    buffer.append(str);

    assert.equal(buffer.read(), str.charCodeAt(0));
  });

  it('Test read with legal ranges', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world';

    buffer.append(str);

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer.read(i), str.charCodeAt(i));
    }
  });

  it('Test read with a negative offset', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.throws(() => {
      buffer.read(-1);
    });
  });

  it('Test read with a offset larger than buffer length', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.throws(() => {
      buffer.read(buffer.length + 1);
    });
  });
});

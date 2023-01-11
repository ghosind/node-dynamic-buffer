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

describe('At tests', () => {
  it('Test at with positive index within buffer\'s length', () => {
    const str = 'Hello world';
    const buffer = new DynamicBuffer(str);

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer.at(i), str.charCodeAt(i));
    }
  });

  it('Test at with positive index greater than buffer\'s length', () => {
    const str = 'Hello world';
    const buffer = new DynamicBuffer(str);

    assert.equal(buffer.at(str.length), undefined);
  });

  it('Test at with a negative index', () => {
    const str = 'Hello world';
    const buffer = new DynamicBuffer(str);

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer.at(0 - str.length + i), str.charCodeAt(i));
    }
  });

  it('Test at with negative index more than buffer\'s length', () => {
    const str = 'Hello world';
    const buffer = new DynamicBuffer(str);

    assert.equal(buffer.at(-str.length - 1), undefined);
  });

  it('Test at with specified buffer size and negative index', () => {
    const str = 'Hello world';
    const buffer = new DynamicBuffer(str, { size: str.length });

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer.at(0 - str.length + i), str.charCodeAt(i));
    }
    assert.equal(buffer.at(-str.length - 1), undefined);
  });
});

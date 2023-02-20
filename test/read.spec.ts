import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Get by index tests', () => {
  it('Test getting by index with valid position', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world';

    buffer.append(str);

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer[i], str.charCodeAt(i));
    }

    assert.equal(buffer[-1], undefined);
    assert.equal(buffer[buffer.length + 1], undefined);
  });
});

describe('Read tests', () => {
  it('Test read', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world';

    buffer.append(str);

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer.read(i), str.charCodeAt(i));
    }

    assert.equal(buffer.read(), str.charCodeAt(0));
    assert.equal(buffer.read(-1), undefined);
    assert.equal(buffer.read(buffer.length + 1), undefined);
  });
});

describe('At tests', () => {
  it('Test at', () => {
    const str = 'Hello world';
    const buffer = new DynamicBuffer(str);

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer.at(i), str.charCodeAt(i));
    }

    assert.equal(buffer.at(str.length), undefined);
    assert.equal(buffer.at(-str.length - 1), undefined);

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer.at(0 - str.length + i), str.charCodeAt(i));
    }
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

import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Swap16 tests', () => {
  it('Test swap16.', () => {
    const buf = new DynamicBuffer('abcd');

    buf.swap16();

    assert.equal(buf.toString(), 'badc');
  });

  it('Test swap16 with empty buffer.', () => {
    const buf = new DynamicBuffer();

    buf.swap16();

    assert.equal(buf.toString(), '');
  });

  it('Test swap16 with invalid length.', () => {
    const buf = new DynamicBuffer('abc');

    assert.throws(() => {
      buf.swap16();
    });
  });

  it('Test swap16 with long string.', () => {
    const buf1 = new DynamicBuffer({ size: 512 });
    const buf2 = new DynamicBuffer({ size: 512 });

    for (let i = 0; i < 512; i += 2) {
      buf1.append('AB');
      buf2.append('BA');
    }

    buf1.swap16();

    assert.equal(buf1.toString(), buf2.toString());
  });
});

describe('Swap32 tests', () => {
  it('Test swap32.', () => {
    const buf = new DynamicBuffer('abcdefgh');

    buf.swap32();

    assert.equal(buf.toString(), 'dcbahgfe');
  });

  it('Test swap32 with empty buffer.', () => {
    const buf = new DynamicBuffer();

    buf.swap32();

    assert.equal(buf.toString(), '');
  });

  it('Test swap32 with invalid length.', () => {
    const buf = new DynamicBuffer('abc');

    assert.throws(() => {
      buf.swap32();
    });
  });

  it('Test swap32 with long string.', () => {
    const buf1 = new DynamicBuffer({ size: 512 });
    const buf2 = new DynamicBuffer({ size: 512 });

    for (let i = 0; i < 512; i += 4) {
      buf1.append('ABCD');
      buf2.append('DCBA');
    }

    buf1.swap32();

    assert.equal(buf1.toString(), buf2.toString());
  });
});

describe('Swap64 tests', () => {
  it('Test swap64.', () => {
    const buf = new DynamicBuffer('abcdefghijklmnop');

    buf.swap64();

    assert.equal(buf.toString(), 'hgfedcbaponmlkji');
  });

  it('Test swap64 with empty buffer.', () => {
    const buf = new DynamicBuffer();

    buf.swap64();

    assert.equal(buf.toString(), '');
  });

  it('Test swap64 with invalid length.', () => {
    const buf = new DynamicBuffer('abc');

    assert.throws(() => {
      buf.swap64();
    });
  });

  it('Test swap64 with long string.', () => {
    const buf1 = new DynamicBuffer({ size: 512 });
    const buf2 = new DynamicBuffer({ size: 512 });

    for (let i = 0; i < 512; i += 8) {
      buf1.append('ABCDEFGH');
      buf2.append('HGFEDCBA');
    }

    buf1.swap64();

    assert.equal(buf1.toString(), buf2.toString());
  });
});

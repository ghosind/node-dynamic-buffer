import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('IndexOf tests', () => {
  it('Test indexOf with empty buffer and empty value.', () => {
    const buf = new DynamicBuffer();

    assert.equal(buf.indexOf('Hello'), -1);
    assert.equal(buf.indexOf(''), 0);
    assert.equal(buf.indexOf(0), -1);
    assert.equal(buf.indexOf(Buffer.alloc(0)), 0);
    assert.equal(buf.indexOf(new Uint8Array()), 0);
    assert.equal(buf.indexOf(new DynamicBuffer()), 0);
  });

  it('Test indexOf with empty value.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.indexOf(''), 0);
    assert.equal(buf.indexOf(0), -1);
    assert.equal(buf.indexOf(Buffer.alloc(0)), 0);
    assert.equal(buf.indexOf(new Uint8Array()), 0);
    assert.equal(buf.indexOf(new DynamicBuffer()), 0);
  });

  it('Test indexOf with string.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.indexOf('Hello'), 0);
    assert.equal(buf.indexOf('world'), 6);
    assert.equal(buf.indexOf('no'), -1);
  });

  it('Test indexOf with number.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.indexOf(72), 0); // H
    assert.equal(buf.indexOf(119), 6); // w
    assert.equal(buf.indexOf(97), -1); // a
  });

  it('Test indexOf with Buffer.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.indexOf(Buffer.from('Hello')), 0);
    assert.equal(buf.indexOf(Buffer.from('world')), 6);
    assert.equal(buf.indexOf(Buffer.from('no')), -1);
  });

  it('Test indexOf with Uint8Array.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.indexOf(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f])), 0);
    assert.equal(buf.indexOf(new Uint8Array([0x77, 0x6f, 0x72, 0x6c, 0x64])), 6);
    assert.equal(buf.indexOf(new Uint8Array([0x6e, 0x6c])), -1);
  });

  it('Test indexOf with DynamicBuffer.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    const buf1 = new DynamicBuffer();
    buf1.append('Hello');
    assert.equal(buf.indexOf(buf1), 0);

    const buf2 = new DynamicBuffer();
    buf2.append('world');
    assert.equal(buf.indexOf(buf2), 6);

    const buf3 = new DynamicBuffer();
    buf3.append('no');
    assert.equal(buf.indexOf(buf3), -1);
  });

  it('Test indexOf with byteOffset parameter.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.indexOf('Hello'), 0);
    assert.equal(buf.indexOf('Hello', 0), 0);
    assert.equal(buf.indexOf('Hello', 1), -1);
    assert.equal(buf.indexOf('Hello', -1), -1);
    assert.equal(buf.indexOf('Hello', -11), 0); // -11 equals 0
    assert.equal(buf.indexOf('Hello', 32), -1);
    assert.equal(buf.indexOf('', 32), 0);
  });
});

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

describe('Includes tests', () => {
  it('Test includes with empty buffer and empty value.', () => {
    const buf = new DynamicBuffer();

    assert.equal(buf.includes('Hello'), false);
    assert.equal(buf.includes(''), true);
    assert.equal(buf.includes(0), false);
    assert.equal(buf.includes(Buffer.alloc(0)), true);
    assert.equal(buf.includes(new Uint8Array()), true);
    assert.equal(buf.includes(new DynamicBuffer()), true);
  });

  it('Test includes with empty value.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.includes(''), true);
    assert.equal(buf.includes(0), false);
    assert.equal(buf.includes(Buffer.alloc(0)), true);
    assert.equal(buf.includes(new Uint8Array()), true);
    assert.equal(buf.includes(new DynamicBuffer()), true);
  });

  it('Test includes with string.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.includes('Hello'), true);
    assert.equal(buf.includes('world'), true);
    assert.equal(buf.includes('no'), false);
  });

  it('Test includes with number.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.includes(72), true); // H
    assert.equal(buf.includes(119), true); // w
    assert.equal(buf.includes(97), false); // a
  });

  it('Test includes with Buffer.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.includes(Buffer.from('Hello')), true);
    assert.equal(buf.includes(Buffer.from('world')), true);
    assert.equal(buf.includes(Buffer.from('no')), false);
  });

  it('Test includes with Uint8Array.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.includes(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f])), true);
    assert.equal(buf.includes(new Uint8Array([0x77, 0x6f, 0x72, 0x6c, 0x64])), true);
    assert.equal(buf.includes(new Uint8Array([0x6e, 0x6c])), false);
  });

  it('Test includes with DynamicBuffer.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    const buf1 = new DynamicBuffer();
    buf1.append('Hello');
    assert.equal(buf.includes(buf1), true);

    const buf2 = new DynamicBuffer();
    buf2.append('world');
    assert.equal(buf.includes(buf2), true);

    const buf3 = new DynamicBuffer();
    buf3.append('no');
    assert.equal(buf.includes(buf3), false);
  });

  it('Test includes with byteOffset parameter.', () => {
    const buf = new DynamicBuffer();
    buf.append('Hello world');

    assert.equal(buf.includes('Hello'), true);
    assert.equal(buf.includes('Hello', 0), true);
    assert.equal(buf.includes('Hello', 1), false);
    assert.equal(buf.includes('Hello', -1), false);
    assert.equal(buf.includes('Hello', -11), true); // -11 equals 0
    assert.equal(buf.includes('Hello', 32), false);
    assert.equal(buf.includes('', 32), true);
  });
});

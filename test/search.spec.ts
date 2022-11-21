import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('IndexOf tests', () => {
  it('Test indexOf with empty buffer and empty value.', () => {
    const buf = new DynamicBuffer();

    assert.equal(buf.indexOf('ABC'), -1);
    assert.equal(buf.indexOf(''), 0);
    assert.equal(buf.indexOf(0), -1);
    assert.equal(buf.indexOf(Buffer.alloc(0)), 0);
    assert.equal(buf.indexOf(new Uint8Array()), 0);
    assert.equal(buf.indexOf(new DynamicBuffer()), 0);
  });

  it('Test indexOf with empty value.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.indexOf(''), 0);
    assert.equal(buf.indexOf(0), -1);
    assert.equal(buf.indexOf(Buffer.alloc(0)), 0);
    assert.equal(buf.indexOf(new Uint8Array()), 0);
    assert.equal(buf.indexOf(new DynamicBuffer()), 0);
  });

  it('Test indexOf with string.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.indexOf('ABC'), 0);
    assert.equal(buf.indexOf('BCA'), 1);
    assert.equal(buf.indexOf('abc'), -1);
  });

  it('Test indexOf with number.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.indexOf(65), 0); // A
    assert.equal(buf.indexOf(67), 2); // C
    assert.equal(buf.indexOf(97), -1); // a
  });

  it('Test indexOf with Buffer.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.indexOf(Buffer.from('ABC')), 0);
    assert.equal(buf.indexOf(Buffer.from('BCA')), 1);
    assert.equal(buf.indexOf(Buffer.from('abc')), -1);
  });

  it('Test indexOf with Uint8Array.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.indexOf(new Uint8Array([0x41, 0x42, 0x43])), 0);
    assert.equal(buf.indexOf(new Uint8Array([0x42, 0x43, 0x41])), 1);
    assert.equal(buf.indexOf(new Uint8Array([0x61, 0x62, 0x63])), -1);
  });

  it('Test indexOf with DynamicBuffer.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    const buf1 = new DynamicBuffer();
    buf1.append('ABC');
    assert.equal(buf.indexOf(buf1), 0);

    const buf2 = new DynamicBuffer();
    buf2.append('BCA');
    assert.equal(buf.indexOf(buf2), 1);

    const buf3 = new DynamicBuffer();
    buf3.append('abc');
    assert.equal(buf.indexOf(buf3), -1);
  });

  it('Test indexOf with byteOffset parameter.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.indexOf('ABC'), 0);
    assert.equal(buf.indexOf('ABC', 0), 0);
    assert.equal(buf.indexOf('ABC', 1), 3);
    assert.equal(buf.indexOf('ABC', -1), -1);
    assert.equal(buf.indexOf('ABC', -9), 0); // -11 equals 0
    assert.equal(buf.indexOf('ABC', 32), -1);
    assert.equal(buf.indexOf('', 32), 9);
  });
});

describe('Includes tests', () => {
  it('Test includes with empty buffer and empty value.', () => {
    const buf = new DynamicBuffer();

    assert.equal(buf.includes('ABC'), false);
    assert.equal(buf.includes(''), true);
    assert.equal(buf.includes(0), false);
    assert.equal(buf.includes(Buffer.alloc(0)), true);
    assert.equal(buf.includes(new Uint8Array()), true);
    assert.equal(buf.includes(new DynamicBuffer()), true);
  });

  it('Test includes with empty value.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.includes(''), true);
    assert.equal(buf.includes(0), false);
    assert.equal(buf.includes(Buffer.alloc(0)), true);
    assert.equal(buf.includes(new Uint8Array()), true);
    assert.equal(buf.includes(new DynamicBuffer()), true);
  });

  it('Test includes with string.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.includes('ABC'), true);
    assert.equal(buf.includes('BCA'), true);
    assert.equal(buf.includes('abc'), false);
  });

  it('Test includes with number.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.includes(65), true); // A
    assert.equal(buf.includes(67), true); // C
    assert.equal(buf.includes(97), false); // a
  });

  it('Test includes with Buffer.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.includes(Buffer.from('ABC')), true);
    assert.equal(buf.includes(Buffer.from('BCA')), true);
    assert.equal(buf.includes(Buffer.from('abc')), false);
  });

  it('Test includes with Uint8Array.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.includes(new Uint8Array([0x41, 0x42, 0x43])), true);
    assert.equal(buf.includes(new Uint8Array([0x42, 0x43, 0x41])), true);
    assert.equal(buf.includes(new Uint8Array([0x61, 0x62, 0x63])), false);
  });

  it('Test includes with DynamicBuffer.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    const buf1 = new DynamicBuffer();
    buf1.append('ABC');
    assert.equal(buf.includes(buf1), true);

    const buf2 = new DynamicBuffer();
    buf2.append('BCA');
    assert.equal(buf.includes(buf2), true);

    const buf3 = new DynamicBuffer();
    buf3.append('abc');
    assert.equal(buf.includes(buf3), false);
  });

  it('Test includes with byteOffset parameter.', () => {
    const buf = new DynamicBuffer();
    buf.append('ABCABCABC');

    assert.equal(buf.includes('ABC'), true);
    assert.equal(buf.includes('ABC', 0), true);
    assert.equal(buf.includes('ABC', 1), true);
    assert.equal(buf.includes('ABC', -1), false);
    assert.equal(buf.includes('ABC', -9), true); // -11 equals 0
    assert.equal(buf.includes('ABC', 32), false);
    assert.equal(buf.includes('', 32), true);
  });
});

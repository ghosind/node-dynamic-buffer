import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Comparison tests', () => {
  it('Compare with other DynamicBuffers', () => {
    const buf1 = new DynamicBuffer();
    const buf2 = new DynamicBuffer();
    const buf3 = new DynamicBuffer();

    buf1.append('ABC');
    buf2.append('BCD');
    buf3.append('ABCD');

    assert.equal(buf1.compare(buf1), 0, 'expected ABC == ABC');
    assert.equal(buf1.compare(buf2), -1, 'expect ABC < BCD');
    assert.equal(buf1.compare(buf3), -1, 'expect ABC < ABCD');
    assert.equal(buf2.compare(buf1), 1, 'expect BCD > ABC');
    assert.equal(buf2.compare(buf3), 1, 'expect BCD > ABCD');
    assert.equal(buf3.compare(buf1), 1, 'expect ABCD > ABC');
    assert.equal(buf3.compare(buf2), -1, 'expect ABCD < BCD');
  });

  it('Compare with other Buffer (1)', () => {
    const buf1 = new DynamicBuffer();
    buf1.append('ABC');

    const buf2 = Buffer.from('BCD');
    const buf3 = Buffer.from('ABCD');

    assert.equal(buf1.compare(buf1), 0, 'expected ABC == ABC');
    assert.equal(buf1.compare(buf2), -1, 'expect ABC < BCD');
    assert.equal(buf1.compare(buf3), -1, 'expect ABC < ABCD');
  });

  it('Compare with other Buffer (2)', () => {
    const buf1 = new DynamicBuffer();
    buf1.append('BCD');

    const buf2 = Buffer.from('ABC');
    const buf3 = Buffer.from('ABCD');

    assert.equal(buf1.compare(buf2), 1, 'expect BCD > ABC');
    assert.equal(buf1.compare(buf3), 1, 'expect BCD > ABCD');
  });

  it('Compare with other Buffer (3)', () => {
    const buf1 = new DynamicBuffer();
    buf1.append('ABCD');

    const buf2 = Buffer.from('ABC');
    const buf3 = Buffer.from('BCD');

    assert.equal(buf1.compare(buf2), 1, 'expect ABCD > ABC');
    assert.equal(buf1.compare(buf3), -1, 'expect ABCD < BCD');
  });

  it('Compare with other Uint8Array (1)', () => {
    const buf1 = new DynamicBuffer();
    buf1.append('ABC');

    const buf2 = new Uint8Array([0x42, 0x43, 0x44]);
    const buf3 = new Uint8Array([0x41, 0x42, 0x43, 0x44]);

    assert.equal(buf1.compare(buf1), 0, 'expected ABC == ABC');
    assert.equal(buf1.compare(buf2), -1, 'expect ABC < BCD');
    assert.equal(buf1.compare(buf3), -1, 'expect ABC < ABCD');
  });

  it('Compare with other Uint8Array (2)', () => {
    const buf1 = new DynamicBuffer();
    buf1.append('BCD');

    const buf2 = new Uint8Array([0x41, 0x42, 0x43]);
    const buf3 = new Uint8Array([0x41, 0x42, 0x43, 0x44]);

    assert.equal(buf1.compare(buf2), 1, 'expect BCD > ABC');
    assert.equal(buf1.compare(buf3), 1, 'expect BCD > ABCD');
  });

  it('Compare with other Uint8Array (3)', () => {
    const buf1 = new DynamicBuffer();
    buf1.append('ABCD');

    const buf2 = new Uint8Array([0x41, 0x42, 0x43]);
    const buf3 = new Uint8Array([0x42, 0x43, 0x44]);

    assert.equal(buf1.compare(buf2), 1, 'expect ABCD > ABC');
    assert.equal(buf1.compare(buf3), -1, 'expect ABCD < BCD');
  });
});

describe('Equality tests', () => {
  it('Compare equals with other DynamicBuffers', () => {
    const buf1 = new DynamicBuffer();
    const buf2 = new DynamicBuffer();
    const buf3 = new DynamicBuffer();
    const buf4 = new DynamicBuffer();

    buf1.append('ABC');
    buf2.append('ABC');
    buf3.append('BCD');
    buf4.append('ABCD');

    assert.equal(buf1.equals(buf1), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf2), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf3), false, 'expected ABC != ABC');
    assert.equal(buf1.equals(buf4), false, 'expected ABC != ABCD');
  });

  it('Compare equals with other Buffer', () => {
    const buf1 = new DynamicBuffer();
    buf1.append('ABC');

    const buf2 = Buffer.from('ABC');
    const buf3 = Buffer.from('BCD');
    const buf4 = Buffer.from('ABCD');

    assert.equal(buf1.equals(buf1), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf2), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf3), false, 'expected ABC != ABC');
    assert.equal(buf1.equals(buf4), false, 'expected ABC != ABCD');
  });

  it('Compare equals with other Uint8Array', () => {
    const buf1 = new DynamicBuffer();
    buf1.append('ABC');

    const buf2 = new Uint8Array([0x41, 0x42, 0x43]);
    const buf3 = new Uint8Array([0x42, 0x43, 0x44]);
    const buf4 = new Uint8Array([0x41, 0x42, 0x43, 0x44]);

    assert.equal(buf1.equals(buf1), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf2), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf3), false, 'expected ABC != ABC');
    assert.equal(buf1.equals(buf4), false, 'expected ABC != ABCD');
  });
});

import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Comparison tests', () => {
  it('Compare with other DynamicBuffers', () => {
    const buf1 = new DynamicBuffer('ABC');
    const buf2 = new DynamicBuffer('BCD');
    const buf3 = new DynamicBuffer('ABCD');

    assert.equal(buf1.compare(buf1), 0, 'expected ABC == ABC');
    assert.equal(buf1.compare(buf2), -1, 'expect ABC < BCD');
    assert.equal(buf1.compare(buf3), -1, 'expect ABC < ABCD');
    assert.equal(buf2.compare(buf1), 1, 'expect BCD > ABC');
    assert.equal(buf2.compare(buf3), 1, 'expect BCD > ABCD');
    assert.equal(buf3.compare(buf1), 1, 'expect ABCD > ABC');
    assert.equal(buf3.compare(buf2), -1, 'expect ABCD < BCD');
  });

  it('Compare with builtin Buffer (1)', () => {
    const buf1 = new DynamicBuffer('ABC');
    const buf2 = Buffer.from('BCD');
    const buf3 = Buffer.from('ABCD');

    assert.equal(buf1.compare(buf1), 0, 'expected ABC == ABC');
    assert.equal(buf1.compare(buf2), -1, 'expect ABC < BCD');
    assert.equal(buf1.compare(buf3), -1, 'expect ABC < ABCD');

    const buf4 = new DynamicBuffer('BCD');
    const buf5 = Buffer.from('ABC');
    const buf6 = Buffer.from('ABCD');

    assert.equal(buf4.compare(buf5), 1, 'expect BCD > ABC');
    assert.equal(buf4.compare(buf6), 1, 'expect BCD > ABCD');

    const buf7 = new DynamicBuffer('ABCD');
    const buf8 = Buffer.from('ABC');
    const buf9 = Buffer.from('BCD');

    assert.equal(buf7.compare(buf8), 1, 'expect ABCD > ABC');
    assert.equal(buf7.compare(buf9), -1, 'expect ABCD < BCD');
  });

  it('Compare with Uint8Array', () => {
    const buf1 = new DynamicBuffer('ABC');
    const buf2 = new Uint8Array([0x42, 0x43, 0x44]);
    const buf3 = new Uint8Array([0x41, 0x42, 0x43, 0x44]);

    assert.equal(buf1.compare(buf1), 0, 'expected ABC == ABC');
    assert.equal(buf1.compare(buf2), -1, 'expect ABC < BCD');
    assert.equal(buf1.compare(buf3), -1, 'expect ABC < ABCD');

    const buf4 = new DynamicBuffer('BCD');
    const buf5 = new Uint8Array([0x41, 0x42, 0x43]);
    const buf6 = new Uint8Array([0x41, 0x42, 0x43, 0x44]);

    assert.equal(buf4.compare(buf5), 1, 'expect BCD > ABC');
    assert.equal(buf4.compare(buf6), 1, 'expect BCD > ABCD');

    const buf7 = new DynamicBuffer('ABCD');
    const buf8 = new Uint8Array([0x41, 0x42, 0x43]);
    const buf9 = new Uint8Array([0x42, 0x43, 0x44]);

    assert.equal(buf7.compare(buf8), 1, 'expect ABCD > ABC');
    assert.equal(buf7.compare(buf9), -1, 'expect ABCD < BCD');
  });
});

describe('Equality tests', () => {
  it('Compare equals with DynamicBuffers', () => {
    const buf1 = new DynamicBuffer('ABC');
    const buf2 = new DynamicBuffer('ABC');
    const buf3 = new DynamicBuffer('BCD');
    const buf4 = new DynamicBuffer('ABCD');

    assert.equal(buf1.equals(buf1), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf2), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf3), false, 'expected ABC != ABC');
    assert.equal(buf1.equals(buf4), false, 'expected ABC != ABCD');
  });

  it('Compare equals with builtin Buffer', () => {
    const buf1 = new DynamicBuffer('ABC');
    const buf2 = Buffer.from('ABC');
    const buf3 = Buffer.from('BCD');
    const buf4 = Buffer.from('ABCD');

    assert.equal(buf1.equals(buf1), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf2), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf3), false, 'expected ABC != ABC');
    assert.equal(buf1.equals(buf4), false, 'expected ABC != ABCD');
  });

  it('Compare equals with Uint8Array', () => {
    const buf1 = new DynamicBuffer('ABC');
    const buf2 = new Uint8Array([0x41, 0x42, 0x43]);
    const buf3 = new Uint8Array([0x42, 0x43, 0x44]);
    const buf4 = new Uint8Array([0x41, 0x42, 0x43, 0x44]);

    assert.equal(buf1.equals(buf1), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf2), true, 'expected ABC == ABC');
    assert.equal(buf1.equals(buf3), false, 'expected ABC != ABC');
    assert.equal(buf1.equals(buf4), false, 'expected ABC != ABCD');
  });
});

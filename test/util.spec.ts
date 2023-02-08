import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';
import { isDynamicBuffer, rangeCheck, swap } from '../src/utils';

describe('Method isDynamicBuffer test', () => {
  it('Test isDynamicBuffer util method', () => {
    assert.equal(isDynamicBuffer(Buffer.from('')), false);
    assert.equal(isDynamicBuffer(new DynamicBuffer()), true);
  });
});

describe('Method rangeCheck test', () => {
  it('Test rangeCheck', () => {
    assert.doesNotThrow(() => {
      rangeCheck('noLimit', 0);
    });

    assert.doesNotThrow(() => {
      rangeCheck('valid', 0, 0, 5);
    });

    assert.throws(() => {
      rangeCheck('less', 0, 5);
    });

    assert.throws(() => {
      rangeCheck('greater', 10, 0, 5);
    });
  });
});

describe('Method swap test', () => {
  it('Test swap', () => {
    const buf = Buffer.alloc(2);
    buf.write('ab');
    swap(buf, 0, 1);
    assert.equal(buf[0], 98);
    assert.equal(buf[1], 97);
  });
});

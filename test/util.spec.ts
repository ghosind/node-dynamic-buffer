import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';
import {
  isDynamicBuffer,
  checkBounds,
  checkRange,
  swap,
} from '../src/utils';

describe('Method isDynamicBuffer test', () => {
  it('Test isDynamicBuffer util method', () => {
    assert.equal(isDynamicBuffer(Buffer.from('')), false);
    assert.equal(isDynamicBuffer(new DynamicBuffer()), true);
  });
});

describe('Method checkBounds test', () => {
  it('Test checkBounds', () => {
    assert.throws(() => {
      // @ts-ignore
      checkBounds('notNumber', 'test', 0, 5);
    });

    assert.doesNotThrow(() => {
      checkBounds('valid', 0, 0, 5);
    });

    assert.throws(() => {
      checkBounds('less', -5, 0, 5);
    });

    assert.throws(() => {
      checkBounds('greater', 10, 0, 5);
    });

    assert.throws(() => {
      checkBounds('NaN', NaN, 0, 5);
    });
  });
});

describe('Method checkRange test', () => {
  it('Test checkRange', () => {
    assert.throws(() => {
      // @ts-ignore
      checkRange('notNum', 'test');
    });

    assert.doesNotThrow(() => {
      checkRange('noLimit', 0);
    });

    assert.doesNotThrow(() => {
      checkRange('valid', 0, 0, 5);
    });

    assert.throws(() => {
      checkRange('less', 0, 5);
    });

    assert.throws(() => {
      checkRange('greater', 10, 0, 5);
    });

    assert.throws(() => {
      checkRange('NaN', NaN, 0, 5);
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

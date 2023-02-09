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
    assert.doesNotThrow(() => {
      checkBounds('valid', 0, 0, 5);
    });

    assert.throws(() => {
      checkBounds('less', -5, 0, 5);
    });

    assert.throws(() => {
      checkBounds('greater', 10, 0, 5);
    });
  });
});

describe('Method checkRange test', () => {
  it('Test checkRange', () => {
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

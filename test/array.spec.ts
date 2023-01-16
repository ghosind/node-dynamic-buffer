import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Reverse tests', () => {
  it('Reverse buffer', () => {
    const buf = new DynamicBuffer('hello');
    const ref = buf.reverse();

    assert.equal(buf.toString(), 'olleh');
    assert.equal(ref.toString(), 'olleh');
  });

  it('Reverse empty buffer', () => {
    const buf = new DynamicBuffer();
    const ref = buf.reverse();

    assert.equal(buf.toString(), '');
    assert.equal(ref.toString(), '');
  });
});

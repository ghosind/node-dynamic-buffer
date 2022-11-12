import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Iteration tests', () => {
  it('Test entries() before writing data', () => {
    const buf = new DynamicBuffer();

    for (const _ of buf.entries()) {
      assert.fail('Should not enter loop');
    }
  });

  it('Test entires()', () => {
    const buf = new DynamicBuffer();
    const str = 'Hello world';

    buf.append(str);

    let index = 0;
    for (const pair of buf.entries()) {
      assert.equal(pair[0], index);
      assert.equal(pair[1], str.charCodeAt(index));
      index += 1;
    }

    assert.equal(buf.length, index);
  });

  it('Test keys() before writing data', () => {
    const buf = new DynamicBuffer();

    for (const _ of buf.keys()) {
      assert.fail('Should not enter loop');
    }
  });

  it('Test keys()', () => {
    const buf = new DynamicBuffer();
    const str = 'Hello world';

    buf.append(str);

    let index = 0;
    for (const key of buf.keys()) {
      assert.equal(key, index);
      index += 1;
    }

    assert.equal(buf.length, index);
  });

  it('Test values() before writing data', () => {
    const buf = new DynamicBuffer();

    for (const _ of buf.values()) {
      assert.fail('Should not enter loop');
    }
  });

  it('Test values()', () => {
    const buf = new DynamicBuffer();
    const str = 'Hello world';

    buf.append(str);

    let index = 0;
    for (const value of buf.values()) {
      assert.equal(value, str.charCodeAt(index));
      index += 1;
    }

    assert.equal(buf.length, index);
  });
});

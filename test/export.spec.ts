import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Export buffer tests', () => {
  it('Test toBuffer() before appending', () => {
    const buffer = new DynamicBuffer();

    assert.equal(buffer.toBuffer().toString(), '');
  });

  it('Test toBuffer() without parameters', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toBuffer().toString(), 'Hello world');
  });

  it('Test toBuffer() with start parameter only', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toBuffer(5).toString(), ' world');
  });

  it('Test toBuffer() with large start parameter only', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toBuffer(20).toString(), '');
  });

  it('Test toBuffer() with same start and end parameters', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toBuffer(0, 0).toString(), '');
  });
});

describe('Export string tests', () => {
  it('Test toString() before appending', () => {
    const buffer = new DynamicBuffer();

    assert.equal(buffer.toString(), '');
  });

  it('Test toString() without parameters', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toString(), 'Hello world');
  });

  it('Test toString() with start parameter only', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toString('utf-8', 5), ' world');
  });

  it('Test toString() with large start parameter only', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toString('utf8', 20).toString(), '');
  });

  it('Test toString() with large end parameter', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toString('utf8', 0, 100).toString(), 'Hello world');
  });

  it('Test toString() with same start and end parameters', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toString('utf-8', 0, 0), '');
  });
});

describe('Exports to JSON object', () => {
  it('Test toJSON() without writes data', () => {
    const buffer = new DynamicBuffer();

    const buf = buffer.toJSON();

    assert.equal(buf.type, 'Buffer');
    assert.deepEqual(buf.data, []);
    assert.equal(JSON.stringify(buf), '{"type":"Buffer","data":[]}');
  });

  it('Test toJSON() with data', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello');
    const buf = buffer.toJSON();

    assert.equal(buf.type, 'Buffer');
    assert.deepEqual(buf.data, [72, 101, 108, 108, 111]);
    assert.equal(JSON.stringify(buf), '{"type":"Buffer","data":[72,101,108,108,111]}');
  });
});

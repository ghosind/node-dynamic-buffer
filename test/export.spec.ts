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
    assert.equal(buffer.toLocaleString(), '');
  });

  it('Test toString() without parameters', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toString(), 'Hello world');
    assert.equal(buffer.toLocaleString(), 'Hello world');
  });

  it('Test toString() with start parameter only', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toString('utf-8', 5), ' world');
  });

  it('Test toString() with large start parameter only', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toString('utf8', 20), '');
  });

  it('Test toString() with large end parameter', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world');

    assert.equal(buffer.toString('utf8', 0, 100), 'Hello world');
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

describe('Copy to another storage', () => {
  it('Test copy()', () => {
    const str = 'hello world';
    const buf1 = new DynamicBuffer(str);
    const buf2 = new DynamicBuffer();

    assert.equal(buf1.copy(buf2), str.length);
    assert.equal(buf2.toString(), 'hello world');
  });

  it('Test copy() with builtin Buffer', () => {
    const str = 'hello world';
    const buf1 = new DynamicBuffer(str);
    const buf2 = Buffer.alloc(15, '.');

    assert.equal(buf1.copy(buf2), str.length);
    assert.equal(buf2.toString(), 'hello world....');
  });

  it('Test copy() with builtin Uint8Array', () => {
    const str = 'hello world';
    const buf1 = new DynamicBuffer(str);
    const buf2 = new Uint8Array(str.length);

    assert.equal(buf1.copy(buf2), str.length);
    for (let i = 0; i < buf2.length; i += 1) {
      assert.equal(buf2[i], str.charCodeAt(i));
    }
  });

  it('Test copy() with invalid target start', () => {
    const buf1 = new DynamicBuffer('hello world');
    const buf2 = new DynamicBuffer();

    assert.throws(() => {
      buf1.copy(buf2, -1);
    });
  });

  it('Test copy() with invalid source start', () => {
    const buf1 = new DynamicBuffer('hello world');
    const buf2 = new DynamicBuffer();

    assert.throws(() => {
      buf1.copy(buf2, 0, -1);
    });
  });

  it('Test copy() with big source end', () => {
    const str = '!hello world';
    const buf1 = new DynamicBuffer(str);
    const buf2 = new DynamicBuffer('...');

    assert.equal(buf1.copy(buf2, 1, 1, 100), str.length - 1);
    assert.equal(buf2.toString(), '.hello world');
  });

  it('Test copy() with empty buffer', () => {
    const buf1 = new DynamicBuffer();
    const buf2 = Buffer.alloc(5, '.');

    assert.equal(buf1.copy(buf2), 0);
    assert.equal(buf2.toString(), '.....');
  });
});

/* eslint-disable no-restricted-syntax */
import assert from 'assert';
import { constants } from 'buffer';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Initialization tests', () => {
  it('Test initializing with default size', () => {
    const buffer = new DynamicBuffer();

    assert.equal(Reflect.get(buffer, 'size'), Reflect.get(buffer, 'DefaultInitialSize'));
    assert.notEqual(Reflect.get(buffer, 'buffer'), undefined);
    assert.equal(buffer.length, 0);
  });

  it('Test initializing with zero size', () => {
    const buffer = new DynamicBuffer({ size: 0 });

    assert.equal(Reflect.get(buffer, 'size'), 0);
    assert.equal(Reflect.get(buffer, 'buffer'), undefined);
  });

  it('Test initializing with specific size', () => {
    const buffer = new DynamicBuffer({ size: 10 });

    assert.equal(Reflect.get(buffer, 'size'), 10);
    assert.notEqual(Reflect.get(buffer, 'buffer'), undefined);
  });

  it('Test initializing with a size large than buffer.constants.MAX_LENGTH', () => {
    assert.throws(() => new DynamicBuffer({ size: constants.MAX_LENGTH + 1 }));
  });
});

describe('Append tests', () => {
  it('Test appending string', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world';

    const count = buffer.append(str);

    assert.equal(count, str.length);
    assert.equal(buffer.toString(), str);
  });

  it('Test appending string twice time', () => {
    const buffer = new DynamicBuffer({ size: 32 });
    let str = 'Hello';
    let count = buffer.append(str);
    assert.equal(count, str.length);
    assert.equal(buffer.toString(), str);

    str = ' world';
    count = buffer.append(str);
    assert.equal(count, str.length);
    assert.equal(buffer.toString(), 'Hello world');
    assert.equal(buffer.length, 'Hello world'.length);
  });

  it('Test appending empty string', () => {
    const buffer = new DynamicBuffer();

    const count = buffer.append('');

    assert.equal(count, 0);
    assert.equal(buffer.toString(), '');
  });

  it('Test appending without parameter', () => {
    const buffer = new DynamicBuffer();

    assert.throws(() => {
      // @ts-ignore
      buffer.append();
    });
  });

  it('Test appending null', () => {
    const buffer = new DynamicBuffer();

    assert.throws(() => {
      // @ts-ignore
      buffer.append(null);
    });
  });

  it('Test appending a number', () => {
    const buffer = new DynamicBuffer();

    assert.throws(() => {
      // @ts-ignore
      buffer.append(65);
    });
  });

  it('Test appending string with small length', () => {
    const buffer = new DynamicBuffer();

    const count = buffer.append('Hello world', 5, 'utf8');

    assert.equal(count, 5);
    assert.equal(buffer.toString(), 'Hello');
  });

  it('Test appending string with large length', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world';

    const count = buffer.append(str, 16, 'utf-8');

    assert.equal(count, str.length);
    assert.equal(buffer.toString(), str);
  });

  it('Test append overload', () => {
    const buffer = new DynamicBuffer();

    const count = buffer.append('Hello world', 'utf8');

    assert.equal(count, 11);
    assert.equal(buffer.toString(), 'Hello world');
  });

  it('Test appending string to zero size buffer', () => {
    const buffer = new DynamicBuffer({ size: 0 });
    const str = 'Hello world';

    const count = buffer.append(str);

    assert.equal(count, str.length);
    assert.equal(Reflect.get(buffer, 'size'), str.length);
    assert.equal(buffer.toBuffer().toString(), str);
  });
});

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

describe('Resize tests', () => {
  it('Test resize()', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world, this is DynamicBuffer';

    buffer.append(str);

    assert.equal(buffer.toString(), str);
  });

  it('Test resize() with small initial size', () => {
    const buffer = new DynamicBuffer({
      size: 2,
    });

    buffer.append('Hello world');

    assert.equal(buffer.toString(), 'Hello world');
  });

  it('Test resize again', () => {
    const buffer = new DynamicBuffer();

    buffer.append('Hello world!\n');
    buffer.append('This is DynamicBuffer.');

    assert.equal(buffer.toString(), 'Hello world!\nThis is DynamicBuffer.');
  });
});

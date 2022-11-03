import assert from 'assert';
import { constants } from 'buffer';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Initialization tests', () => {
  it('Test initializing with default size', () => {
    const buffer = new DynamicBuffer();

    assert.equal(Reflect.get(buffer, 'size'), Reflect.get(buffer, 'DefaultInitialSize'));
    assert.notEqual(Reflect.get(buffer, 'buffer'), undefined);
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
    assert.throws(() => {
      const buffer = new DynamicBuffer({ size: constants.MAX_LENGTH + 1 });
    });
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
  });

  it('Test appending empty string', () => {
    const buffer = new DynamicBuffer();

    const count = buffer.append('');

    assert.equal(count, 0);
    assert.equal(buffer.toString(), '');
  });

  it('Test appending without parameter', () => {
    const buffer = new DynamicBuffer();

    // @ts-ignore
    const count = buffer.append();

    assert.equal(count, 0);
    assert.equal(buffer.toString(), '');
  });

  it('Test appending null', () => {
    const buffer = new DynamicBuffer();

    // @ts-ignore
    const count = buffer.append(null);

    assert.equal(count, 0);
    assert.equal(buffer.toString(), '');
  });

  it('Test appending string with small length', () => {
    const buffer = new DynamicBuffer();

    const count = buffer.append('Hello world', 'utf8', 5);

    assert.equal(count, 5);
    assert.equal(buffer.toString(), 'Hello');
  });

  it('Test appending string with large length', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world';

    const count = buffer.append(str, 'utf-8', 16);

    assert.equal(count, str.length);
    assert.equal(buffer.toString(), str);
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

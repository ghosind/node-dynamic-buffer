import assert from 'assert';
import { constants } from 'buffer';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

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

  it('Test appending string to zero size buffer', () => {
    const buffer = new DynamicBuffer({ size: 0 });
    const str = 'Hello world';

    const count = buffer.append(str);

    assert.equal(count, str.length);
    assert.equal(Reflect.get(buffer, 'size'), str.length);
    assert.equal(buffer.toBuffer().toString(), str);
  });
});

describe('Write tests', () => {
  it('Test writing string without offset', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world';

    const count = buffer.write(str);

    assert.equal(count, str.length);
    assert.equal(buffer.toString(), str);
  });

  it('Test writing string with offset', () => {
    const buffer = new DynamicBuffer({ fill: ' ' });
    const str = 'Hello world';

    const count = buffer.write(str, 5);

    assert.equal(count, str.length);
    assert.equal(buffer.toString(), `     ${str}`);
  });

  it('Test writing string with negative offset', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world';

    assert.throws(() => {
      buffer.write(str, -1);
    });
  });

  it('Test writing string with large offset', () => {
    const buffer = new DynamicBuffer({ fill: ' ' });
    const str = 'Hello world';

    assert.throws(() => {
      buffer.write(str, constants.MAX_LENGTH * 2);
    });
  });

  it('Test writing string without offset twice time', () => {
    const buffer = new DynamicBuffer();
    let str = 'Hello';
    let count = buffer.write(str);
    assert.equal(count, str.length);
    assert.equal(buffer.toString(), str);

    str = 'world';
    count = buffer.write(str);
    assert.equal(count, str.length);
    assert.equal(buffer.toString(), str);
    assert.equal(buffer.length, str.length);
  });

  it('Test writing string with offset twice time', () => {
    const buffer = new DynamicBuffer();
    let str = 'Hello!';
    let count = buffer.write(str);
    assert.equal(count, str.length);
    assert.equal(buffer.toString(), str);

    str = ' world!';
    count = buffer.write(str, 5);
    assert.equal(count, str.length);
    assert.equal(buffer.toString(), 'Hello world!');
    assert.equal(buffer.length, 12);
  });

  it('Test writing empty string without offset', () => {
    const buffer = new DynamicBuffer();

    const count = buffer.write('');

    assert.equal(count, 0);
    assert.equal(buffer.toString(), '');
  });

  it('Test writing string with parameters', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world!!!';

    const count = buffer.write(str, 0, 12, 'utf-8');

    assert.equal(count, 12);
    assert.equal(buffer.toString(), 'Hello world!');
  });

  it('Test writing without parameter', () => {
    const buffer = new DynamicBuffer();

    assert.throws(() => {
      // @ts-ignore
      buffer.write();
    });
  });

  it('Test writing null', () => {
    const buffer = new DynamicBuffer();

    assert.throws(() => {
      // @ts-ignore
      buffer.write(null);
    });
  });

  it('Test writing a number', () => {
    const buffer = new DynamicBuffer();

    assert.throws(() => {
      // @ts-ignore
      buffer.write(65);
    });
  });
});

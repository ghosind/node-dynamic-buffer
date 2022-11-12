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

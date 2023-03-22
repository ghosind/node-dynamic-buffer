import assert from 'assert';
import { constants } from 'buffer';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Set by index tests', () => {
  it('Test set', () => {
    const buffer = new DynamicBuffer('hello world');

    buffer[0] = 72;
    assert.equal(buffer.toString(), 'Hello world');

    buffer[-1] = 33; // !
    assert.equal(buffer.toString(), 'Hello world');

    buffer[buffer.length] = 33; // auto-resize
    assert.equal(buffer.toString(), 'Hello world!');
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

describe('Set tests', () => {
  it('Test set', () => {
    const buf = new DynamicBuffer('hello');

    buf.set([97], 1);

    assert.equal(buf.toString(), 'hallo');
  });

  it('Test set of empty buffer', () => {
    const buf = new DynamicBuffer();

    assert.doesNotThrow(() => {
      buf.set([]);
    });

    assert.throws(() => {
      buf.set([97]);
    });
  });

  it('Test set offset parameter', () => {
    const buf = new DynamicBuffer('xxxxx');

    assert.doesNotThrow(() => {
      buf.set([97, 98], 3);
    });
    assert.equal(buf.toString(), 'xxxab');

    assert.throws(() => {
      buf.set([97, 98], 4);
    });
  });
});

describe('More write methods test', () => {
  const writeCompare = (func: (buf: DynamicBuffer) => any, expect: any) => {
    const buf = new DynamicBuffer({ size: 0 });
    func(buf);
    assert.deepEqual(buf.toJSON().data, expect);
  };

  it('Test write BigInt', () => {
    writeCompare(
      (buf: DynamicBuffer) => buf.writeBigInt64BE(0x0102030405060708n),
      [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeBigInt64LE(0x0102030405060708n),
      [0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeBigUInt64BE(0x0102030405060708n),
      [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeBigUInt64LE(0x0102030405060708n),
      [0x08, 0x07, 0x06, 0x05, 0x04, 0x03, 0x02, 0x01],
    );
  });

  it('Test write double and float', () => {
    writeCompare(
      (buf: DynamicBuffer) => buf.writeFloatBE(2.387939260590663e-38),
      [0x01, 0x02, 0x03, 0x04],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeFloatLE(1.539989614439558e-36),
      [0x01, 0x02, 0x03, 0x04],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeDoubleBE(8.20788039913184e-304),
      [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeDoubleLE(5.447603722011605e-270),
      [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08],
    );
  });

  it('Test write int', () => {
    writeCompare(
      (buf: DynamicBuffer) => buf.writeInt8(-2),
      [0xfe],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeInt16BE(0x0102),
      [0x01, 0x02],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeInt16LE(0x0102),
      [0x02, 0x01],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeInt32BE(0x01020304),
      [0x01, 0x02, 0x03, 0x04],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeInt32LE(0x01020304),
      [0x04, 0x03, 0x02, 0x01],
    );
  });

  it('Test write uint', () => {
    writeCompare(
      (buf: DynamicBuffer) => buf.writeUInt8(1),
      [0x01],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeUInt16BE(0x0102),
      [0x01, 0x02],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeUInt16LE(0x0102),
      [0x02, 0x01],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeUInt32BE(0x01020304),
      [0x01, 0x02, 0x03, 0x04],
    );

    writeCompare(
      (buf: DynamicBuffer) => buf.writeUInt32LE(0x01020304),
      [0x04, 0x03, 0x02, 0x01],
    );
  });

  it('Test write with byte length', () => {
    const v: number[] = [0x01, 0x0102, 0x010203, 0x01020304, 0x0102030405, 0x010203040506];
    const be: number[][] = [
      [0x01],
      [0x01, 0x02],
      [0x01, 0x02, 0x03],
      [0x01, 0x02, 0x03, 0x04],
      [0x01, 0x02, 0x03, 0x04, 0x05],
      [0x01, 0x02, 0x03, 0x04, 0x05, 0x06],
    ];
    const le: number[][] = [
      [0x01],
      [0x02, 0x01],
      [0x03, 0x02, 0x01],
      [0x04, 0x03, 0x02, 0x01],
      [0x05, 0x04, 0x03, 0x02, 0x01],
      [0x06, 0x05, 0x04, 0x03, 0x02, 0x01],
    ];

    for (let i = 0; i < 6; i += 1) {
      writeCompare(
        (buf: DynamicBuffer) => buf.writeIntBE(v[i], 0, i + 1),
        be[i],
      );

      writeCompare(
        (buf: DynamicBuffer) => buf.writeIntLE(v[i], 0, i + 1),
        le[i],
      );

      writeCompare(
        (buf: DynamicBuffer) => buf.writeUIntBE(v[i], 0, i + 1),
        be[i],
      );

      writeCompare(
        (buf: DynamicBuffer) => buf.writeUIntLE(v[i], 0, i + 1),
        le[i],
      );
    }
  });
});

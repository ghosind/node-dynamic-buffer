import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('Get by index tests', () => {
  it('Test getting by index with valid position', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world';

    buffer.append(str);

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer[i], str.charCodeAt(i));
    }

    assert.equal(buffer[-1], undefined);
    assert.equal(buffer[buffer.length + 1], undefined);
  });
});

describe('Read tests', () => {
  it('Test read', () => {
    const buffer = new DynamicBuffer();
    const str = 'Hello world';

    buffer.append(str);

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer.read(i), str.charCodeAt(i));
    }

    assert.equal(buffer.read(), str.charCodeAt(0));
    assert.equal(buffer.read(-1), undefined);
    assert.equal(buffer.read(buffer.length + 1), undefined);
  });
});

describe('At tests', () => {
  it('Test at', () => {
    const str = 'Hello world';
    const buffer = new DynamicBuffer(str);

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer.at(i), str.charCodeAt(i));
    }

    assert.equal(buffer.at(str.length), undefined);
    assert.equal(buffer.at(-str.length - 1), undefined);

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer.at(0 - str.length + i), str.charCodeAt(i));
    }
  });

  it('Test at with specified buffer size and negative index', () => {
    const str = 'Hello world';
    const buffer = new DynamicBuffer(str, { size: str.length });

    for (let i = 0; i < str.length; i += 1) {
      assert.equal(buffer.at(0 - str.length + i), str.charCodeAt(i));
    }
    assert.equal(buffer.at(-str.length - 1), undefined);
  });
});

describe('More read test', () => {
  it('Test read big int from buffer', () => {
    const buf = new DynamicBuffer(new Uint8Array([0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff]));

    assert.equal(buf.readBigInt64BE(), 4294967295n);
    assert.equal(buf.readBigInt64LE(), -4294967296n);
    assert.equal(buf.readBigUInt64BE(), 4294967295n);
    assert.equal(buf.readBigUInt64LE(), 18446744069414584320n);
  });

  it('Test read double and float from buffer', () => {
    const buf = new DynamicBuffer();

    for (let i = 0; i < 8; i += 1) {
      buf[i] = i + 1;
    }

    assert.equal(buf.readDoubleBE(), 8.20788039913184e-304);
    assert.equal(buf.readDoubleLE(), 5.447603722011605e-270);
    assert.equal(buf.readFloatBE(), 2.387939260590663e-38);
    assert.equal(buf.readFloatLE(), 1.539989614439558e-36);
  });

  it('Test read int from buffer', () => {
    const buf = new DynamicBuffer(new Uint8Array([0x12, 0x34, 0x56, 0x78, 0x90, 0xab]));

    const be = [0x12, 0x1234, 0x123456, 0x12345678, 0x1234567890, 0x1234567890ab];
    const le = [0x12, 0x3412, 0x563412, 0x78563412, 0x9078563412, 0xab9078563412];

    assert.equal(buf.readInt8(), be[0]);
    assert.equal(buf.readInt16BE(), be[1]);
    assert.equal(buf.readInt16LE(), le[1]);
    assert.equal(buf.readInt32BE(), be[3]);
    assert.equal(buf.readInt32LE(), le[3]);

    assert.equal(buf.readUInt8(), be[0]);
    assert.equal(buf.readUInt16BE(), be[1]);
    assert.equal(buf.readUInt16LE(), le[1]);
    assert.equal(buf.readUInt32BE(), be[3]);
    assert.equal(buf.readUInt32LE(), le[3]);

    for (let i = 1; i <= 6; i += 1) {
      assert.equal(buf.readIntBE(0, i), be[i - 1]);
      assert.equal(buf.readUIntBE(0, i), be[i - 1]);
      assert.equal(buf.readUIntLE(0, i), le[i - 1]);

      if (i === 5) {
        assert.equal(buf.readIntLE(0, i), -479017421806);
      } else if (i === 6) {
        assert.equal(buf.readIntLE(0, i), -92837994154990);
      } else {
        assert.equal(buf.readIntLE(0, i), le[i - 1]);
      }
    }
  });

  it('Test read empty buffer', () => {
    const buf = new DynamicBuffer();

    assert.throws(() => buf.readBigInt64BE());
    assert.throws(() => buf.readBigInt64LE());
    assert.throws(() => buf.readBigUInt64BE());
    assert.throws(() => buf.readBigUInt64LE());
    assert.throws(() => buf.readDoubleBE());
    assert.throws(() => buf.readDoubleLE());
    assert.throws(() => buf.readFloatBE());
    assert.throws(() => buf.readFloatLE());
    assert.throws(() => buf.readInt8());
    assert.throws(() => buf.readInt16BE());
    assert.throws(() => buf.readInt16LE());
    assert.throws(() => buf.readInt32BE());
    assert.throws(() => buf.readInt32LE());
    assert.throws(() => buf.readUInt8());
    assert.throws(() => buf.readUInt16BE());
    assert.throws(() => buf.readUInt16LE());
    assert.throws(() => buf.readUInt32BE());
    assert.throws(() => buf.readUInt32LE());

    assert.throws(() => buf.readIntBE(0, 6));
    assert.throws(() => buf.readIntLE(0, 6));
    assert.throws(() => buf.readUIntBE(0, 6));
    assert.throws(() => buf.readUIntLE(0, 6));
  });
});

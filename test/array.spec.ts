import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('CopyWithin tests', () => {
  it('Test copyWithin', () => {
    const buf = new DynamicBuffer('abcde');

    assert.equal(buf.copyWithin(0, 3, 4).toString(), 'dbcde');
    assert.equal(buf.copyWithin(1, 3).toString(), 'ddede');
  });

  it('Test copyWithin of empty buffer', () => {
    const buf = new DynamicBuffer();

    assert.equal(buf.copyWithin(0, 3, 4).toString(), '');
  });
});

describe('Every tests', () => {
  it('Test every', () => {
    const buf1 = new DynamicBuffer('hello');
    const buf2 = new DynamicBuffer('Hello');

    assert.equal(buf1.every((v) => v >= 97 && v <= 122), true);
    assert.equal(buf2.every((v) => v >= 97 && v <= 122), false);
  });

  it('Test empty buffer\'s every method', () => {
    const buf = new DynamicBuffer();

    assert.equal(buf.every((v) => v >= 97 && v <= 122), true);
  });
});

describe('Filter tests', () => {
  it('Test filter', () => {
    const buf = new DynamicBuffer('Hello');

    assert.deepEqual(buf.filter((v) => v >= 97 && v <= 122), new Uint8Array([101, 108, 108, 111]));
  });

  it('Test empty buffer\'s filter method', () => {
    const buf = new DynamicBuffer();

    assert.deepEqual(buf.filter((v) => v >= 97 && v <= 122), new Uint8Array());
  });
});

describe('Find tests', () => {
  it('Test find', () => {
    const buf = new DynamicBuffer('Hello');

    assert.equal(buf.find((v) => v >= 97 && v <= 122), 101);
    assert.equal(buf.find((v) => v >= 48 && v <= 57), undefined);
  });

  it('Test empty buffer\'s find method', () => {
    const buf = new DynamicBuffer();

    assert.equal(buf.find((v) => v >= 97 && v <= 122), undefined);
  });
});

describe('FindIndex tests', () => {
  it('Test findIndex', () => {
    const buf = new DynamicBuffer('Hello');

    assert.equal(buf.findIndex((v) => v >= 97 && v <= 122), 1);
    assert.equal(buf.findIndex((v) => v >= 48 && v <= 57), -1);
  });

  it('Test empty buffer\'s findIndex method', () => {
    const buf = new DynamicBuffer();

    assert.equal(buf.findIndex((v) => v >= 97 && v <= 122), -1);
  });
});

describe('ForEach tests', () => {
  it('Test forEach', () => {
    const buf = new DynamicBuffer('Hello');
    const arr: number[] = [];
    let called = false;

    buf.forEach((v, i) => {
      called = true;
      arr[i] = v;
    });

    assert.equal(called, true);
    assert.deepEqual(arr, [72, 101, 108, 108, 111]);
  });

  it('Test empty buffer\'s forEach method', () => {
    const buf = new DynamicBuffer();
    const arr: number[] = [];
    let called = false;

    buf.forEach((v, i) => {
      called = true;
      arr[i] = v;
    });

    assert.equal(called, false);
    assert.deepEqual(arr, []);
  });
});

describe('Join tests', () => {
  it('Test join', () => {
    const buf = new DynamicBuffer('Hello');

    assert.equal(buf.join(), '72,101,108,108,111');
    assert.equal(buf.join('|'), '72|101|108|108|111');
  });

  it('Test empty buffer\'s join method', () => {
    const buf = new DynamicBuffer();

    assert.equal(buf.join(), '');
  });
});

describe('Map tests', () => {
  it('Test map', () => {
    const buf = new DynamicBuffer('Hello');

    assert.deepEqual(buf.map((v) => v + 1), new Uint8Array([73, 102, 109, 109, 112]));
  });

  it('Test empty buffer\'s map method', () => {
    const buf = new DynamicBuffer();

    assert.deepEqual(buf.map((v) => v + 1), new Uint8Array());
  });
});

describe('Reduce tests', () => {
  it('Reduce buffer', () => {
    const buf = new DynamicBuffer('abc');

    const ret = buf.reduce((prev, cur) => prev + (cur - 97));

    assert.equal(ret, 100);
  });

  it('Reduce buffer with initial value', () => {
    const buf = new DynamicBuffer('abc');

    const ret = buf.reduce((prev, cur) => prev + (cur - 97), 0);

    assert.equal(ret, 3);
  });

  it('Reduce buffer with other type', () => {
    const buf = new DynamicBuffer('abc');

    const ret = buf.reduce((prev, cur) => {
      const obj: any = { ...prev };
      obj[String.fromCharCode(cur)] = cur;
      return obj;
    }, {});

    assert.deepEqual(ret, {
      a: 97,
      b: 98,
      c: 99,
    });
  });

  it('Reduce empty buffer without initial value', () => {
    const buf = new DynamicBuffer();

    assert.throws(() => {
      buf.reduce((prev, cur) => prev + (cur - 97));
    });
  });

  it('Reduce empty buffer with initial value', () => {
    const buf = new DynamicBuffer();

    const ret = buf.reduce((prev, cur) => prev + (cur - 97), 0);

    assert.equal(ret, 0);
  });
});

describe('ReduceRight tests', () => {
  it('ReduceRight buffer', () => {
    const buf = new DynamicBuffer('abc');

    const ret = buf.reduceRight((prev, cur) => prev + (cur - 97));

    assert.equal(ret, 100);
  });

  it('ReduceRight buffer with initial value', () => {
    const buf = new DynamicBuffer('abc');

    const ret = buf.reduceRight((prev, cur) => prev + (cur - 97), 0);

    assert.equal(ret, 3);
  });

  it('ReduceRight buffer with other type', () => {
    const buf = new DynamicBuffer('abc');

    const ret = buf.reduceRight((prev, cur) => {
      const obj: any = { ...prev };
      obj[String.fromCharCode(cur)] = cur;
      return obj;
    }, {});

    assert.deepEqual(ret, {
      a: 97,
      b: 98,
      c: 99,
    });
  });

  it('ReduceRight empty buffer without initial value', () => {
    const buf = new DynamicBuffer();

    assert.throws(() => {
      buf.reduceRight((prev, cur) => prev + (cur - 97));
    });
  });

  it('ReduceRight empty buffer with initial value', () => {
    const buf = new DynamicBuffer();

    const ret = buf.reduceRight((prev, cur) => prev + (cur - 97), 0);

    assert.equal(ret, 0);
  });
});

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

describe('Some tests', () => {
  it('Test some', () => {
    const buf1 = new DynamicBuffer('HELLO');
    const buf2 = new DynamicBuffer('Hello');

    assert.equal(buf1.some((v) => v >= 97 && v <= 122), false);
    assert.equal(buf2.some((v) => v >= 97 && v <= 122), true);
  });

  it('Test empty buffer\'s some method', () => {
    const buf = new DynamicBuffer();

    assert.equal(buf.some((v) => v >= 97 && v <= 122), false);
  });
});

describe('Sort tests', () => {
  it('Sort without compare function', () => {
    const buf = new DynamicBuffer('cba');
    buf.sort();
    assert.equal(buf.toString(), 'abc');
  });

  it('Sort in ascending order', () => {
    const buf = new DynamicBuffer('cba');
    buf.sort((a, b) => a - b);
    assert.equal(buf.toString(), 'abc');
  });

  it('Sort in descending order', () => {
    const buf = new DynamicBuffer('abc');
    buf.sort((a, b) => b - a);
    assert.equal(buf.toString(), 'cba');
  });
});

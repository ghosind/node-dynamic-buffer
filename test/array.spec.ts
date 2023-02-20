import assert from 'assert';
import { describe, it } from 'mocha';

import { DynamicBuffer } from '../src';

describe('CopyWithin method tests', () => {
  it('Test copyWithin method', () => {
    const buf = new DynamicBuffer('abcde');
    assert.equal(buf.copyWithin(0, 3, 4).toString(), 'dbcde');
    assert.equal(buf.copyWithin(1, 3).toString(), 'ddede');

    const empty = new DynamicBuffer();
    assert.equal(empty.copyWithin(0, 3, 4).toString(), '');
  });
});

describe('Every method tests', () => {
  it('Test every method', () => {
    const buf1 = new DynamicBuffer('hello');
    const buf2 = new DynamicBuffer('Hello');
    assert.equal(buf1.every((v) => v >= 97 && v <= 122), true);
    assert.equal(buf2.every((v) => v >= 97 && v <= 122), false);

    const empty = new DynamicBuffer();
    assert.equal(empty.every((v) => v >= 97 && v <= 122), true);
  });
});

describe('Filter method tests', () => {
  it('Test filter method', () => {
    const buf = new DynamicBuffer('Hello');
    assert.deepEqual(
      buf.filter((v) => v >= 97 && v <= 122),
      new Uint8Array([101, 108, 108, 111]),
    );

    const empty = new DynamicBuffer();
    assert.deepEqual(empty.filter((v) => v >= 97 && v <= 122), new Uint8Array());
  });
});

describe('Find method tests', () => {
  it('Test find method', () => {
    const buf = new DynamicBuffer('Hello');
    assert.equal(buf.find((v) => v >= 97 && v <= 122), 101);
    assert.equal(buf.find((v) => v >= 48 && v <= 57), undefined);

    const empty = new DynamicBuffer();
    assert.equal(empty.find((v) => v >= 97 && v <= 122), undefined);
  });
});

describe('FindIndex method tests', () => {
  it('Test findIndex method', () => {
    const buf = new DynamicBuffer('Hello');
    assert.equal(buf.findIndex((v) => v >= 97 && v <= 122), 1);
    assert.equal(buf.findIndex((v) => v >= 48 && v <= 57), -1);

    const empty = new DynamicBuffer();
    assert.equal(empty.findIndex((v) => v >= 97 && v <= 122), -1);
  });
});

describe('ForEach method tests', () => {
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

describe('Join method tests', () => {
  it('Test join method', () => {
    const buf = new DynamicBuffer('Hello');
    assert.equal(buf.join(), '72,101,108,108,111');
    assert.equal(buf.join('|'), '72|101|108|108|111');

    const empty = new DynamicBuffer();
    assert.equal(empty.join(), '');
  });
});

describe('Map method tests', () => {
  it('Test map method', () => {
    const buf = new DynamicBuffer('Hello');
    assert.deepEqual(buf.map((v) => v + 1), new Uint8Array([73, 102, 109, 109, 112]));

    const empty = new DynamicBuffer();
    assert.deepEqual(empty.map((v) => v + 1), new Uint8Array());
  });
});

describe('Reduce method tests', () => {
  it('Reduce buffer', () => {
    const buf = new DynamicBuffer('abc');

    let ret = buf.reduce((prev, cur) => prev + (cur - 97));
    assert.equal(ret, 100);

    ret = buf.reduce((prev, cur) => prev + (cur - 97), 0);
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

  it('Reduce empty buffer', () => {
    const buf = new DynamicBuffer();

    const ret = buf.reduce((prev, cur) => prev + (cur - 97), 0);
    assert.equal(ret, 0);

    assert.throws(() => {
      buf.reduce((prev, cur) => prev + (cur - 97));
    });
  });
});

describe('ReduceRight method tests', () => {
  it('ReduceRight buffer', () => {
    const buf = new DynamicBuffer('abc');

    let ret = buf.reduceRight((prev, cur) => prev + (cur - 97));
    assert.equal(ret, 100);

    ret = buf.reduceRight((prev, cur) => prev + (cur - 97), 0);
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

  it('ReduceRight empty buffer', () => {
    const buf = new DynamicBuffer();

    const ret = buf.reduceRight((prev, cur) => prev + (cur - 97), 0);
    assert.equal(ret, 0);

    assert.throws(() => {
      buf.reduceRight((prev, cur) => prev + (cur - 97));
    });
  });
});

describe('Reverse method tests', () => {
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

describe('Some method tests', () => {
  it('Test some method', () => {
    const buf1 = new DynamicBuffer('HELLO');
    assert.equal(buf1.some((v) => v >= 97 && v <= 122), false);

    const buf2 = new DynamicBuffer('Hello');
    assert.equal(buf2.some((v) => v >= 97 && v <= 122), true);

    const empty = new DynamicBuffer();
    assert.equal(empty.some((v) => v >= 97 && v <= 122), false);
  });
});

describe('Sort method tests', () => {
  it('Test sort method', () => {
    const buf = new DynamicBuffer('cba');
    buf.sort(); // without compare function
    assert.equal(buf.toString(), 'abc');

    buf.sort((a, b) => b - a); // sort in descending order
    assert.equal(buf.toString(), 'cba');

    buf.sort((a, b) => a - b); // sort in ascending order
    assert.equal(buf.toString(), 'abc');
  });
});

# Dynamic Buffer for Node.js

[![Latest version](https://img.shields.io/github/v/release/ghosind/node-dynamic-buffer?include_prereleases)](https://github.com/ghosind/node-dynamic-buffer)
[![NPM Package](https://img.shields.io/npm/v/dynamic-buffer)](https://www.npmjs.com/package/dynamic-buffer)
[![Github Actions build](https://img.shields.io/github/actions/workflow/status/ghosind/node-dynamic-buffer/test.yaml?branch=main)](https://github.com/ghosind/node-dynamic-buffer)
[![codecov](https://codecov.io/gh/ghosind/node-dynamic-buffer/branch/main/graph/badge.svg)](https://codecov.io/gh/ghosind/node-dynamic-buffer)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/210eeb335c0a441ea463872fcd4b4569)](https://www.codacy.com/gh/ghosind/node-dynamic-buffer/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ghosind/node-dynamic-buffer&amp;utm_campaign=Badge_Grade)
[![License](https://img.shields.io/github/license/ghosind/node-dynamic-buffer)](https://github.com/ghosind/node-dynamic-buffer)

An automatically resizing storage size buffer type for Node.js that is based on Node.js builtin [`Buffer`](https://nodejs.org/api/buffer.html).

## Installation

You can install this library by npm with the following command:

```shell
npm install dynamic-buffer
```

You can also install by yarn or other npm alternative package managers:

```shell
yarn add dynamic-buffer
```

## Getting Started

1. Imports `DynamicBuffer` from `dynamic-buffer` package:

  ```ts
  import { DynamicBuffer } from 'dynamic-buffer';
  ```

2. Creates `DynamicBuffer` instance with default initial size or the specific size:

  ```ts
  const buffer = new DynamicBuffer();
  ```

3. Appends data into buffer:

  ```ts
  buffer.append('Hello ');
  buffer.append('world!');
  ```

4. Exports data to string or builtin buffer object without unused bytes:

  ```ts
  console.log(buffer.length);
  // 12
  const buf = buffer.toBuffer();
  console.log(buf.toString());
  // Hello world!
  const str = buffer.toString();
  console.log(str);
  // Hello world!
  ```

## Table of Contents

- [Installation](#installation)

- [Getting Started](#getting-started)

- [Usages](#usages)

  - [Write Data](#write-data)

  - [Read Data](#read-data)

  - [Iteration](#iteration)

  - [Search](#search)

  - [Comparison](#comparison)

  - [Export Data](#export-data)

  - [Utils](#utils)

- [Run Tests](#run-tests)

- [License](#license)

## Usages

### Write Data

You can write a string into a buffer by `append` method, it'll add the string to the end of the buffer:

```ts
buf.append('Hello');
buf.append(' ');
buf.append('world');
console.log(buf.toString());
// Hello world
```

And you can also set the string length to write. Like the second line of the following example, it'll write `'Script!'` into buffer and without the last two `'!'` symbols:

```ts
buf.append('Java');
buf.append('Script!!!', 7);
console.log(buf.toString());
// JavaScript!
```

You can also use `write` method to write data to the specified position in the buffer:

```ts
buf.append('Hello world!');
buf.write('Node.js', 6);
console.log(buf.toString());
// Hello Node.js
```

### Read Data

You can access the byte at the specified position in the buffer by `read` or `at` methods:

```ts
const buf = new DynamicBuffer('Hello world');

buf.at(0); // 72
buf.read(1); // 101
```

### Iteration

`DynamicBuffer` provides three ways to iterate data from the specified buffer, you can use them with `for...of` statement.

- `entries()` returns an iterator of key-value pair (index and byte) from the buffer.

  ```ts
  buf.append('Hello');
  for (const pair of buf.entries()) {
    console.log(pair);
  }
  // [ 0, 72 ]
  // [ 1, 101 ]
  // [ 2, 108 ]
  // [ 3, 108 ]
  // [ 4, 111 ]
  ```

- `values()` returns an iterator of data(byte) from the buffer.

  ```ts
  buf.append('Hello');
  for (const value of buf.values()) {
    console.log(value);
  }
  // 72
  // 101
  // 108
  // 108
  // 111
  ```

- `keys()` returns an iterator of buffer keys (indices).

### Search

You can search a value in the buffer by `indexOf` or `lastIndexOf`, and get the position of the first/last occurrence in the buffer. The searching value can be a string, a number, a `Buffer`, an `Uint8Array`, or another `DynamicBuffer`.

```ts
buf.append('ABCABCABC');
buf.indexOf('ABC'); // 0
buf.lastIndexOf('ABC'); // 6
buf.indexOf('abc'); // -1
```

### Comparison

You can compare `DynamicBuffer` object with another `DynamicBuffer` object, Node.js builtin `Buffer` object, or an `Uint8Array` by `compare` or `equals` methods.

For `compare` method, it returns a number to indicate whether the buffer comes before, after, or is the same as another buffer in sort order.

```ts
buf.append('ABC');
console.log(buf.compare(Buffer.from('ABC')));
// 0
console.log(buf.compare(Buffer.from('BCD')));
// -1
```

For `equals` method, it returns a boolean value to indicate whether the buffer is the same as the target buffer.

```ts
buf.append('ABC');
console.log(buf.equals(Buffer.from('ABC')));
// true
console.log(buf.equals(Buffer.from('BCD')));
// false
```

### Export Data

You can export buffer content (without unused parts) to string, `Buffer` object, or JSON representation object.

```ts
buf.append('Hello');
console.log(buf.toString());
// Hello
const dataBuffer = buf.toBuffer();
console.log(buf.length, dataBuffer.toString());
// 5 Hello
console.log(JSON.stringify(buf)); // JSON.stringify implicitly calls toJSON method.
// {"type":"Buffer","data":[72,101,108,108,111]}
```

For `toString` and `toBuffer` methods, you can also set the start and end offsets to export the subset of written data.

```ts
buf.append('Hello world!!!');
console.log(buf.toString('utf8', 6, 11));
// world
```

### Utils

We provided `isDynamicBuffer` function to indicating an object is a DynamicBuffer object or not.

```ts
import { isDynamicBuffer } from 'dynamic-buffer';

const buf1 = Buffer.alloc(8);
const buf2 = new DynamicBuffer();

isDynamicBuffer(buf1); // false
isDynamicBuffer(buf2); // true
```

## Run Tests

All of test cases are written with `mocha`, `assert`, and `nyc`. They can be run with the following commands:

```sh
npm test
# or
yarn test
```

## License

This project was published under MIT license, you can see more detail in [LICENSE file](./LICENSE).

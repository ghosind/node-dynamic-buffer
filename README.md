# Dynamic Buffer for Node.js

[![Latest version](https://img.shields.io/github/v/release/ghosind/node-dynamic-buffer?include_prereleases)](https://github.com/ghosind/node-dynamic-buffer)
[![Github Actions build](https://img.shields.io/github/workflow/status/ghosind/node-dynamic-buffer/Test)](https://github.com/ghosind/node-dynamic-buffer)
[![codecov](https://codecov.io/gh/ghosind/node-dynamic-buffer/branch/main/graph/badge.svg)](https://codecov.io/gh/ghosind/node-dynamic-buffer)
[![License](https://img.shields.io/github/license/ghosind/node-dynamic-buffer)](https://github.com/ghosind/node-dynamic-buffer)

Dynamic storage size buffer object based on Node.js builtin [`Buffer`](https://nodejs.org/api/buffer.html).

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

## APIs

- `DynamicBuffer(options?: DynamicBufferOptions)`: Constructor of `DynamicBuffer` class.

  - `options.size`: Initial buffer size, default 16.
  - `options.fill`: Pre-fill value to the buffer, default 0.
  - `options.encoding`: Character encoding for pre-fill value if it's a string, default `'utf8'`.

- `append(data: string, length?: number, encoding?: BufferEncoding)`: Appends data into buffer.

  - `data`: String to write into this buffer.
  - `length`: The number of bytes to write.
  - `encoding`: Character encoding of this string.

- `toBuffer(start?: number, end?: number)`: Exports data to a new builtin buffer object.

  - `start`: The start byte offset.
  - `end`: The end byte offset.

- `toString(encoding?: BufferEncoding, start?: number, end?: number)`: Exports data to a string.

  - `encoding`: The character encoding for output string.
  - `start`: The start byte offset.
  - `end`: The end byte offset.

- `toJSON()`: Exports data to a JSON representation.

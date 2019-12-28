# Terse Single Object Notation (TSON)

Terse Single Object Notation is a format for defining a single object with one or more properties, including support for nested properties.

## Installation

```
yarn add @tson/parser
```

## Parser

The `@tson/parser` package provides a parser for converting a TSON format string to a JavaScript object:

```javascript
import parser from '@tson/parser'
// or const parser = require('@tson/parser')

parser('foo:bar')
//=> { foo: 'bar' }
```

## Specification

To describe an object with TSON you can use one or more whitespace separated `name:value` pairs.

### Scalar Values

By default a value is assumed to be a `string`.

The value will be converted to a `number` or a `boolean` if the conversion can be made implicitly.

| TSON string | Object output    |
| ----------- | ---------------- |
| `foo:bar`   | `{ foo: 'bar' }` |
| `foo:false` | `{ foo: false }` |
| `foo:true`  | `{ foo: true }`  |
| `foo:5`     | `{ foo: 5 }`     |
| `foo:+5`    | `{ foo: 5 }`     |
| `foo:-5`    | `{ foo: -5 }`    |
| `foo:5.55`  | `{ foo: 5.55 }`  |
| `foo:-5.55` | `{ foo: -5.55 }` |

You can use quotes to define `string` values, if you wish them to contain whitespace, number or boolean values, or special characters:

```javascript
parser("foo:'true'")
//=> { foo: 'true' }
```

Omitting the property value is equivalent to boolean `true`:

```javascript
parser('foo')
//=> { foo: true }
```

You can define multiple whitespace separated properties:

```javascript
parser('foo:bar baz biz:5')
//=> { foo: 'bar', baz: true, biz: 5 }
```

### Arrays

Arrays are defined with left and right brackets and comma separated values. The values will also be implicitly converted to `number` or `boolean`:

```javascript
parser('foo:[5, bar, false]')
//=> { foo: [5, 'bar', false] }
```

### Nested Objects

Nested objects are also supported:

```javascript
parser('foo:{bar:5 baz:true}}')
//=> { foo: { bar: 5, baz: true } }
```

import parser from './parser'
import each from 'jest-each'
import specialCharacters from './utils/special-characters'
import toTokenType from './utils/to-token-type'

describe('parser', () => {
  it('throws exception for undefined value', () => {
    expect(() => parser()).toThrow('No value specified.')
  })

  it('throws exception for null value', () => {
    expect(() => parser()).toThrow('No value specified.')
  })

  it('throws exception for boolean value', () => {
    expect(() => parser(true)).toThrow('The value specified must be a string.')
  })

  it('throws exception for number value', () => {
    expect(() => parser(5)).toThrow('The value specified must be a string.')
  })

  it('throws exception for object value', () => {
    expect(() => parser({})).toThrow('The value specified must be a string.')
  })

  it('returns empty object for empty string', () => {
    expect(parser('')).toEqual({})
  })

  it('returns empty object for whitespace', () => {
    expect(parser('   ')).toEqual({})
  })

  it('returns boolean property for value with no whitespace', () => {
    expect(parser('foo')).toEqual({ foo: true })
  })

  it('returns boolean property for value with prefixed whitespace', () => {
    expect(parser('    foo   ')).toEqual({ foo: true })
  })

  it('throws exception for quoted string', () => {
    expect(() => parser(`'foo'`)).toThrow(
      'Unexpected quoted string at position 0.'
    )
  })

  each(Object.entries(specialCharacters)).it(
    'special character %s throws exception type %s',
    (char, charType) => {
      expect(() => parser(char)).toThrow(
        `Unexpected ${toTokenType(charType)} at position 0.`
      )
    }
  )

  it('returns string property for key value', () => {
    expect(parser('foo:bah')).toEqual({
      foo: 'bah',
    })
  })

  it('returns string property for key value with whitespace', () => {
    expect(parser('   foo:bah   ')).toEqual({
      foo: 'bah',
    })
  })

  it('returns string property for quoted key value', () => {
    expect(parser(`foo:'bah'`)).toEqual({
      foo: 'bah',
    })
  })

  it('returns string property for quoted key value', () => {
    expect(parser(`foo:'bah'`)).toEqual({
      foo: 'bah',
    })
  })

  it('returns string property for quoted key value with whitespace', () => {
    expect(parser(`   foo:'bah'  `)).toEqual({
      foo: 'bah',
    })
  })

  it('returns number property', () => {
    expect(parser(`foo:2.6`)).toEqual({
      foo: 2.6,
    })
  })

  it('returns number property with whitespace', () => {
    expect(parser(`   foo:2.6  `)).toEqual({
      foo: 2.6,
    })
  })

  it('returns boolean false property', () => {
    expect(parser(`foo:false`)).toEqual({
      foo: false,
    })
  })

  it('returns boolean true property', () => {
    expect(parser(`foo:true`)).toEqual({
      foo: true,
    })
  })

  it('throws exception for colon following colon', () => {
    expect(() => parser(`foo::true`)).toThrow('Unexpected colon at position 4.')
  })

  it('throws exception for period following colon', () => {
    expect(() => parser(`foo:.bah`)).toThrow('Unexpected period at position 4.')
  })

  it('throws exception for common following colon', () => {
    expect(() => parser(`foo:,bah`)).toThrow('Unexpected comma at position 4.')
  })

  it('throws exception for whitespace following colon', () => {
    expect(() => parser(`foo: bah`)).toThrow(
      'Unexpected whitespace at position 4.'
    )
  })

  it('returns two boolean properties', () => {
    expect(parser('foo bah')).toEqual({
      foo: true,
      bah: true,
    })
  })

  it('returns two string properties', () => {
    expect(parser('foo:bah bah:baz')).toEqual({
      foo: 'bah',
      bah: 'baz',
    })
  })

  it('returns two quoted string properties', () => {
    expect(parser(`foo:'bah' bah:'baz'`)).toEqual({
      foo: 'bah',
      bah: 'baz',
    })
  })

  it('returns two number properties', () => {
    expect(parser(`foo:5 bah:4.5`)).toEqual({
      foo: 5,
      bah: 4.5,
    })
  })

  it('returns a single element number array', () => {
    expect(parser(`foo:[5]`)).toEqual({
      foo: [5],
    })
  })

  it('returns a multiple element number array', () => {
    expect(parser(`foo:[5,6,7]`)).toEqual({
      foo: [5, 6, 7],
    })
  })

  it('returns a multiple element number array with whitespace', () => {
    expect(parser(`foo:[  5  ,  6   , 7 ]`)).toEqual({
      foo: [5, 6, 7],
    })
  })

  it('returns a single string array for unquoted', () => {
    expect(parser(`foo:[foo,bah,baz]`)).toEqual({
      foo: ['foo', 'bah', 'baz'],
    })
  })

  it('returns a single string array for unquoted with whitespace', () => {
    expect(parser(`foo:[ foo ,  bah,  baz]`)).toEqual({
      foo: ['foo', 'bah', 'baz'],
    })
  })

  it('returns a multiple element string array for quoted', () => {
    expect(parser(`foo:['foo:','bah.','baz,']`)).toEqual({
      foo: ['foo:', 'bah.', 'baz,'],
    })
  })

  it('returns a multiple element string array for quoted with whitespace', () => {
    expect(parser(`foo:[ ' foo: ' ,  'bah.' , ' baz,']`)).toEqual({
      foo: [' foo: ', 'bah.', ' baz,'],
    })
  })

  it('returns mixed array of elements', () => {
    expect(parser(`foo:['foo',bah,2.5,6,+7,-9,'baz,']`)).toEqual({
      foo: ['foo', 'bah', 2.5, 6, 7, -9, 'baz,'],
    })
  })

  it('throws exception when starting for array with no property name', () => {
    expect(() => parser(`[foo]`)).toThrow(
      'Unexpected left bracket at position 0.'
    )
  })

  it('throws exception when no colon between property name and value', () => {
    expect(() => parser(`foo[foo]`)).toThrow(
      'Unexpected left bracket at position 3.'
    )
  })

  it('includes period in property name', () => {
    expect(parser(`foo.`)).toEqual({
      ['foo.']: true,
    })
  })

  it('includes number in property name', () => {
    expect(parser(`foo2.6`)).toEqual({
      ['foo2.6']: true,
    })
  })

  it('throws exception when no value after colon', () => {
    expect(() => parser(`foo:`)).toThrow(
      `No property value specified for property 'foo'.`
    )
  })
})

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
})

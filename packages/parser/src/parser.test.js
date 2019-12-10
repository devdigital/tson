import parser from './parser'

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

  it('returns empty root property for value with no whitespace', () => {
    expect(parser('foo')).toEqual({ foo: true })
  })

  it('returns empty root property for value with whitespace', () => {
    expect(parser('    foo   ')).toEqual({ foo: true })
  })
})

import parse from './parse'

describe('parse', () => {
  it('throws exception for undefined value', () => {
    expect(() => parse()).toThrow('No value specified.')
  })

  it('throws exception for null value', () => {
    expect(() => parse()).toThrow('No value specified.')
  })

  it('throws exception for boolean value', () => {
    expect(() => parse(true)).toThrow('The value specified must be a string.')
  })

  it('throws exception for number value', () => {
    expect(() => parse(5)).toThrow('The value specified must be a string.')
  })

  it('throws exception for object value', () => {
    expect(() => parse({})).toThrow('The value specified must be a string.')
  })

  it('returns empty object for empty string', () => {
    expect(parse('')).toEqual({})
  })

  it('returns empty object for whitespace', () => {
    expect(parse('   ')).toEqual({})
  })

  it('returns empty root property for value with no whitespace', () => {
    expect(parse('foo')).toEqual({ foo: true })
  })

  it('returns empty root property for value with whitespace', () => {
    expect(parse('    foo   ')).toEqual({ foo: true })
  })
})

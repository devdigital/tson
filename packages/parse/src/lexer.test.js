import lexer, { isWhitespace } from './lexer'

describe('isWhitespace', () => {
  it('throws exception for undefined value', () => {
    expect(() => isWhitespace()).toThrow('No character specified.')
  })

  it('returns true for whitespace character', () => {
    expect(isWhitespace(' '[0])).toBe(true)
  })

  it('returns false for non-whitespace character', () => {
    expect(isWhitespace('foo'[0])).toBe(false)
  })
})

describe('lexer', () => {
  it('throws exception for undefined text', () => {
    expect(() => lexer()).toThrow('No text specified.')
  })

  it('throws exception for undefined position', () => {
    expect(() => lexer('text')).toThrow('No position specified.')
  })

  it('throws exception for minus position', () => {
    expect(() => lexer('text', -1)).toThrow('Invalid position.')
  })

  it('throws exception for position index greater than text length', () => {
    expect(() => lexer('text', 4)).toThrow('Invalid position.')
  })

  it('returns whitespace token', () => {
    expect(lexer('  text', 0)).toEqual({
      type: 'whitespace',
      value: '  ',
      position: {
        start: 0,
        end: 1,
      },
    })
  })
})

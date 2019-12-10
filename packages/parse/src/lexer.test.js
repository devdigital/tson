import lexer, { isWhitespace } from './lexer'
import each from 'jest-each'

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

  it('returns whitespace', () => {
    expect(lexer('  ', 0)).toEqual({
      type: 'whitespace',
      value: '  ',
      position: {
        start: 0,
        end: 1,
      },
    })
  })

  it('returns whitespace token when text follows', () => {
    expect(lexer('  text', 0)).toEqual({
      type: 'whitespace',
      value: '  ',
      position: {
        start: 0,
        end: 1,
      },
    })
  })

  it('returns left brace token', () => {
    expect(lexer('{', 0)).toEqual({
      type: 'left-brace',
      value: '{',
      position: {
        start: 0,
        end: 0,
      },
    })
  })

  it('returns right brace token', () => {
    expect(lexer('}', 0)).toEqual({
      type: 'right-brace',
      value: '}',
      position: {
        start: 0,
        end: 0,
      },
    })
  })

  it('returns colon token', () => {
    expect(lexer('}:', 1)).toEqual({
      type: 'colon',
      value: ':',
      position: {
        start: 1,
        end: 1,
      },
    })
  })

  it('returns unquoted string', () => {
    expect(lexer('  foo', 2)).toEqual({
      type: 'string',
      value: 'foo',
      position: {
        start: 2,
        end: 4,
      },
    })
  })

  each([[':'], ['{'], ['}'], ["'"]]).it(
    'returns string with trailing %s',
    trailing => {
      expect(lexer(`  foo${trailing}`, 2)).toEqual({
        type: 'string',
        value: 'foo',
        position: {
          start: 2,
          end: 4,
        },
      })
    }
  )

  it('returns period included in string', () => {
    expect(lexer('  foo.', 2)).toEqual({
      type: 'string',
      value: 'foo.',
      position: {
        start: 2,
        end: 5,
      },
    })
  })

  it('returns string with trailing whitespace', () => {
    expect(lexer('  foo  ', 2)).toEqual({
      type: 'string',
      value: 'foo',
      position: {
        start: 2,
        end: 4,
      },
    })
  })

  it('returns number', () => {
    expect(lexer('2.6', 0)).toEqual({
      type: 'number',
      value: 2.6,
      position: {
        start: 0,
        end: 2,
      },
    })
  })

  it('returns string for number with trailing period', () => {
    expect(lexer('2.6.', 0)).toEqual({
      type: 'string',
      value: '2.6.',
      position: {
        start: 0,
        end: 3,
      },
    })
  })
})

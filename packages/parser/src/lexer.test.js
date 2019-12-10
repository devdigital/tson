import lexer from './lexer'
import each from 'jest-each'

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

  it('returns whitespace for single character', () => {
    expect(lexer(' ', 0)).toEqual({
      type: 'whitespace',
      value: ' ',
      position: {
        start: 0,
        end: 0,
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
      type: 'string-unquoted',
      value: 'foo',
      position: {
        start: 2,
        end: 4,
      },
    })
  })

  it('returns unquoted string for single character', () => {
    expect(lexer('f', 0)).toEqual({
      type: 'string-unquoted',
      value: 'f',
      position: {
        start: 0,
        end: 0,
      },
    })
  })

  each([[':'], ['{'], ['}'], ["'"]]).it(
    'returns string with trailing %s',
    trailing => {
      expect(lexer(`  foo${trailing}`, 2)).toEqual({
        type: 'string-unquoted',
        value: 'foo',
        position: {
          start: 2,
          end: 4,
        },
      })
    }
  )

  each([
    [':', 'colon'],
    ['{', 'left-brace'],
    ['}', 'right-brace'],
    ['.', 'period'],
  ]).it('special character %s returns type %s', (char, charType) => {
    expect(lexer(char, 0)).toEqual({
      type: charType,
      value: char,
      position: {
        start: 0,
        end: 0,
      },
    })
  })

  each([
    [':', 'colon'],
    ['{', 'left-brace'],
    ['}', 'right-brace'],
    ['.', 'period'],
  ]).it(
    'special character %s prefixing string returns type %s',
    (char, charType) => {
      expect(lexer(`${char}foo`, 0)).toEqual({
        type: charType,
        value: char,
        position: {
          start: 0,
          end: 0,
        },
      })
    }
  )

  it('returns period included in string', () => {
    expect(lexer('  foo.', 2)).toEqual({
      type: 'string-unquoted',
      value: 'foo.',
      position: {
        start: 2,
        end: 5,
      },
    })
  })

  it('returns string with trailing whitespace', () => {
    expect(lexer('  foo  ', 2)).toEqual({
      type: 'string-unquoted',
      value: 'foo',
      position: {
        start: 2,
        end: 4,
      },
    })
  })

  it('returns number for number string', () => {
    expect(lexer('2.6', 0)).toEqual({
      type: 'number',
      value: 2.6,
      position: {
        start: 0,
        end: 2,
      },
    })
  })

  it('returns number for single character', () => {
    expect(lexer('6', 0)).toEqual({
      type: 'number',
      value: 6,
      position: {
        start: 0,
        end: 0,
      },
    })
  })

  it('returns false boolean for boolean string', () => {
    expect(lexer('  false:', 2)).toEqual({
      type: 'boolean',
      value: false,
      position: {
        start: 2,
        end: 6,
      },
    })
  })

  it('returns true boolean for boolean string', () => {
    expect(lexer('  true:', 2)).toEqual({
      type: 'boolean',
      value: true,
      position: {
        start: 2,
        end: 5,
      },
    })
  })

  it('returns string for number with trailing period', () => {
    expect(lexer('2.6.', 0)).toEqual({
      type: 'string-unquoted',
      value: '2.6.',
      position: {
        start: 0,
        end: 3,
      },
    })
  })

  it('returns quoted string for empty quoted string', () => {
    expect(lexer("''", 0)).toEqual({
      type: 'string-quoted',
      value: "''",
      position: {
        start: 0,
        end: 1,
      },
    })
  })

  it('returns quoted string for quoted string', () => {
    expect(lexer("'foo'", 0)).toEqual({
      type: 'string-quoted',
      value: "'foo'",
      position: {
        start: 0,
        end: 4,
      },
    })
  })

  it('returns quoted string for quoted string containing special characters', () => {
    expect(lexer("'foo:  fsdf {  } .'", 0)).toEqual({
      type: 'string-quoted',
      value: "'foo:  fsdf {  } .'",
      position: {
        start: 0,
        end: 18,
      },
    })
  })

  it('throws exception for non matching apostrophe', () => {
    expect(() => lexer("  'foo :", 2)).toThrow(
      'Missing ending quotation started at position 2'
    )
  })

  it('throws exception for single apostrophe', () => {
    expect(() => lexer("'", 0)).toThrow(
      'Missing ending quotation started at position 0'
    )
  })
})

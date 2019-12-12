const isWhitespace = require('./is-whitespace')

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

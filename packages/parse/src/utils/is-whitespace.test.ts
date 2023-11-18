import { isWhitespace } from './is-whitespace'

describe('isWhitespace', () => {
  it('returns true for whitespace character', () => {
    expect(isWhitespace(' '[0])).toBe(true)
  })

  it('returns false for non-whitespace character', () => {
    expect(isWhitespace('foo'[0])).toBe(false)
  })
})

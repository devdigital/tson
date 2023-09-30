//@ts-nocheck
import { deepmerge } from '@utilz/deepmerge'
import { isWhitespace } from './utils/is-whitespace'
import { isNumeric } from './utils/is-numeric'
import { isLastCharacter } from './utils/is-last-character'
import { getCharacter } from './utils/get-character'

const type = (char) => {
  if (char === ':') {
    return 'colon'
  }

  if (char === '.') {
    return 'period'
  }

  if (char === "'") {
    return 'apostrophe'
  }

  if (char === '{') {
    return 'brace-left'
  }

  if (char === '}') {
    return 'brace-right'
  }

  if (char === '[') {
    return 'bracket-left'
  }

  if (char === ']') {
    return 'bracket-right'
  }

  if (char === ',') {
    return 'comma'
  }

  if (isWhitespace(char)) {
    return 'whitespace'
  }

  return 'text'
}

const fromText = (result, position) => {
  if (result.value === 'true') {
    return deepmerge(result, {
      type: 'boolean',
      value: true,
      position: { end: position },
    })
  }

  if (result.value === 'false') {
    return deepmerge(result, {
      type: 'boolean',
      value: false,
      position: { end: position },
    })
  }

  if (isNumeric(result.value)) {
    return deepmerge(result, {
      type: 'number',
      value: parseFloat(result.value),
      position: { end: position },
    })
  }

  return deepmerge(result, {
    position: { end: position },
  })
}

const nonMatchingApostropheError = (position) =>
  new Error(`Missing ending quotation started at position ${position}.`)

export const lexer = (text, position) => {
  if (!text) {
    throw new Error('No text specified.')
  }

  if (!position && position !== 0) {
    throw new Error('No position specified.')
  }

  if (position < 0) {
    throw new Error('Invalid position.')
  }

  if (position > text.length - 1) {
    throw new Error('Invalid position.')
  }

  let state = 'start'
  let result = {
    type: null,
    value: '',
    position: {
      start: null,
      end: null,
    },
  }

  const charAt = getCharacter(text)
  const isLast = isLastCharacter(text)

  do {
    switch (state) {
      case 'start':
        const charType = type(charAt(position))

        switch (charType) {
          case 'whitespace':
            result.type = 'whitespace'
            result.position.start = position
            result.value += charAt(position)

            if (isLast(position)) {
              return deepmerge(result, { position: { end: position } })
            }

            state = 'whitespace'
            break
          case 'colon':
          case 'brace-left':
          case 'brace-right':
          case 'period':
          case 'bracket-left':
          case 'bracket-right':
          case 'comma':
            return {
              type: charType,
              value: charAt(position),
              position: { start: position, end: position },
            }
          case 'apostrophe':
            result.position.start = position
            result.value += charAt(position)
            result.type = 'string-quoted'

            if (isLast(position)) {
              throw new nonMatchingApostropheError(result.position.start)
            }

            state = 'text-quoted'
            break
          case 'text':
            result.position.start = position
            result.value += charAt(position)
            result.type = 'string-unquoted'

            if (isLast(position)) {
              return fromText(result, position)
            }

            state = 'text-unquoted'
            break
          default:
            throw new Error(`Unexpected character type '${charType}'.`)
        }
        break
      case 'whitespace':
        if (isWhitespace(charAt(position))) {
          result.value += charAt(position)

          if (isLast(position)) {
            return deepmerge(result, { position: { end: position } })
          }
        } else {
          return deepmerge(result, { position: { end: position - 1 } })
        }
        break
      case 'text-unquoted':
        const characterType = type(charAt(position))
        switch (characterType) {
          case 'text':
          case 'period':
            result.value += charAt(position)

            if (isLast(position)) {
              return fromText(result, position)
            }

            break
          case 'apostrophe':
          case 'colon':
          case 'brace-left':
          case 'brace-right':
          case 'whitespace':
          case 'comma':
          case 'bracket-left':
          case 'bracket-right':
            return fromText(result, position - 1)
          default:
            throw new Error(`Unexpected character type '${characterType}'.`)
        }
        break
      case 'text-quoted':
        switch (type(charAt(position))) {
          case 'text':
          case 'period':
          case 'colon':
          case 'brace-left':
          case 'brace-right':
          case 'whitespace':
          case 'comma':
          case 'bracket-left':
          case 'bracket-right':
            result.value += charAt(position)

            if (isLast(position)) {
              throw nonMatchingApostropheError(result.position.start)
            }

            break
          case 'apostrophe':
            result.value += charAt(position)
            return deepmerge(result, { position: { end: position } })
        }
        break
      default:
        throw new Error(`Unexpected state '${state}'.`)
    }

    position++
  } while (true)
}

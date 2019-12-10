import deepmerge from '@utilz/deepmerge'

export const isWhitespace = char => {
  if (char === undefined || char === null) {
    throw new Error('No character specified.')
  }

  return char.length > 0 && !/[^\s]/.test(char)
}

const type = char => {
  if (char === ':') {
    return ':'
  }

  if (char === "'") {
    return 'apostrophe'
  }

  if (char === '{') {
    return 'left-brace'
  }

  if (char === '}') {
    return 'right-brace'
  }

  if (isWhitespace(char)) {
    return 'whitespace'
  }

  return 'text'
}

const lexer = (text, position) => {
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

  const charAt = pos => text[pos]

  let state = 'start'
  let result = {
    type: null,
    value: '',
    position: {
      start: null,
      end: null,
    },
  }

  do {
    switch (state) {
      case 'start':
        const charType = type(charAt(position))
        switch (charType) {
          case 'whitespace':
            result.type = 'whitespace'
            result.position.start = position
            state = 'whitespace'
            break
          case 'colon':
          case 'left-brace':
          case 'right-brace':
            return {
              type: charType,
              value: charAt(position),
              position: { start: position, end: position },
            }
          case 'apostrophe':
            result.type = 'string'
            state = 'string'
            break
        }
        break
      case 'whitespace':
        if (isWhitespace(charAt(position))) {
          result.value += charAt(position)
          position++
        } else {
          return deepmerge(result, { position: { end: position - 1 } })
        }
        break
      case 'string':
        state = 'done'
        break
    }
  } while (state !== 'done' && position < text.length)
}

export default lexer

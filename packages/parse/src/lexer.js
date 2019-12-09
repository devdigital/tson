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
    return "'"
  }

  if (char === '{') {
    return '{'
  }

  if (char === '}') {
    return '}'
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
        switch (type(charAt(position))) {
          case 'whitespace':
            result.type = 'whitespace'
            result.position.start = position
            state = 'whitespace'
            break
          case ':':
            return {
              type: 'colon',
              value: ':',
              position: { start: position, end: position },
            }
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
      case 'text':
        state = 'done'
        break
    }
  } while (state !== 'done')
}

export default lexer

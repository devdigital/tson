import deepmerge from '@utilz/deepmerge'

export const isWhitespace = char => {
  if (char === undefined || char === null) {
    throw new Error('No character specified.')
  }

  return char.length > 0 && !/[^\s]/.test(char)
}

const type = char => {
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

const isNumeric = value => {
  if (!value) {
    return false
  }

  return !isNaN(parseFloat(value)) && isFinite(value)
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
    console.log(result.value)
    return deepmerge(result, {
      type: 'number',
      value: parseFloat(result.value),
      position: { end: position },
    })
  }

  return deepmerge(result, {
    type: 'string',
    value: result.value,
    position: { end: position },
  })
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

  const charAt = pos => {
    if (pos < 0) {
      throw new Error(`Invalid position '${pos}'.`)
    }

    if (pos > text.length - 1) {
      throw new Error(`Invalid position '${pos}'.`)
    }

    return text[pos]
  }

  const isLast = pos => pos === text.length - 1

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
          case 'period':
            return {
              type: charType,
              value: charAt(position),
              position: { start: position, end: position },
            }
          case 'apostrophe':
            result.type = 'string'
            state = 'apostrophe'
            break
          case 'text':
            result.type = 'unquoted-text'
            result.position.start = position
            state = 'unquoted-text'
        }
        break
      case 'whitespace':
        if (isWhitespace(charAt(position))) {
          result.value += charAt(position)

          if (isLast(position)) {
            return deepmerge(result, { position: { end: position } })
          }

          position++
        } else {
          return deepmerge(result, { position: { end: position - 1 } })
        }
        break
      case 'unquoted-text':
        switch (type(charAt(position))) {
          case 'text':
          case 'period':
            result.value += charAt(position)
            result.type = 'text'

            if (isLast(position)) {
              return fromText(result, position)
            }

            position++
            break
          case 'apostrophe':
          case 'colon':
          case 'left-brace':
          case 'right-brace':
          case 'whitespace':
            return fromText(result, position - 1)
        }
        break
    }
  } while (state !== 'done' && position < text.length)
}

export default lexer

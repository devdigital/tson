import { isString } from '@utilz/types'
import isWhitespace from './utils/is-whitespace'
import lexer from './lexer'
import toTokenType from './utils/to-token-type'

const unexpectedTokenError = (type, position) =>
  new Error(`Unexpected ${toTokenType(type)} at position ${position}.`)

const noPropertyValueError = propertyName =>
  new Error(`No property value specified for property '${propertyName}'.`)

const nonMatchingArrayBracket = position =>
  new Error(`No closing bracket for array started at position ${position}.`)

const nonMatchingObjectBrace = position =>
  new Error(`No closing brace for object started at position ${position}.`)

const objectFactory = position => {
  const result = {}
  let startPosition = position
  let endPosition = position

  let propertyName = null

  return {
    startProperty(name) {
      propertyName = name
    },
    completeProperty(value) {
      if (!propertyName) {
        throw new Error('Attempting to complete property with no name.')
      }

      if (result.hasOwnProperty(propertyName)) {
        throw new Error(`Property name '${propertyName}' already defined.`)
      }

      result[propertyName] = value

      propertyName = null
    },
    get() {
      return {
        result,
        startPosition,
        endPosition,
      }
    },
    propertyName() {
      return propertyName
    },
    getStartPosition() {
      return startPosition
    },
    setEndPosition(position) {
      endPosition = position
    },
  }
}

const arrayFactory = () => {
  let result = []
  let startPosition = null

  return {
    start(position) {
      startPosition = position
      result = []
    },
    add(value) {
      result.push(value)
    },
    get() {
      return result
    },
    getStartPosition() {
      return startPosition
    },
  }
}

const stripApostrophes = value => {
  if (value === null || value === undefined) {
    return null
  }

  if (value.length === 1) {
    return value
  }

  if (value[0] === "'" && value[value.length - 1] === "'") {
    return value.substring(1, value.length - 1)
  }

  return value
}

const parseObject = (
  text,
  objectStartPosition,
  parseStartPosition,
  childObject
) => {
  let state = 'awaiting-property-name'
  let current = objectFactory(objectStartPosition)
  let arrayValue = arrayFactory()
  let position = parseStartPosition

  const isLast = position => position > text.length - 1

  do {
    let token = lexer(text, position)
    current.setEndPosition(token.position.end)

    switch (state) {
      case 'awaiting-property-name':
        switch (token.type) {
          case 'whitespace':
            position = token.position.end + 1

            if (isLast(position)) {
              if (childObject) {
                throw nonMatchingObjectBrace(current.getStartPosition())
              }

              return current.get()
            }

            break
          case 'string-unquoted':
          case 'number':
            position = token.position.end + 1
            current.startProperty(token.value)

            if (isLast(position)) {
              if (childObject) {
                throw nonMatchingObjectBrace(current.getStartPosition())
              }

              current.completeProperty(true, token.position.end)
              return current.get()
            }

            state = 'property-name'
            break
          case 'brace-right':
            if (!childObject) {
              throw unexpectedTokenError(token.type, position)
            }

            return current.get()
          default:
            throw unexpectedTokenError(token.type, position)
        }
        break
      case 'property-name':
        switch (token.type) {
          case 'colon':
            position = token.position.end + 1

            if (isLast(position)) {
              throw noPropertyValueError(current.propertyName())
            }

            state = 'property-value'
            break
          case 'whitespace':
            current.completeProperty(true, token.position.end)
            position = token.position.end + 1

            if (isLast(position)) {
              return current.get()
            }

            state = 'awaiting-property-name'
            break
          default:
            throw unexpectedTokenError(token.type, position)
        }
        break
      case 'property-value':
        switch (token.type) {
          case 'whitespace':
            throw new unexpectedTokenError(token.type, position)
          case 'string-unquoted':
          case 'string-quoted':
          case 'number':
          case 'boolean':
            current.completeProperty(
              stripApostrophes(token.value),
              token.position.end
            )
            position = token.position.end + 1

            if (isLast(position)) {
              return current.get()
            }

            state = 'awaiting-property-name'
            break
          case 'bracket-left':
            arrayValue.start(position)

            position = token.position.end + 1

            if (isLast(position)) {
              throw nonMatchingArrayBracket(arrayValue.getStartPosition())
            }

            state = 'array'
            break
          case 'brace-left':
            position = token.position.end + 1

            if (isLast(position)) {
              throw nonMatchingObjectBrace(position - 1)
            }

            const { result, endPosition } = parseObject(
              text,
              position - 1,
              position,
              true // child object
            )

            current.completeProperty(result, endPosition)

            position = endPosition + 1 // skip end brace

            if (isLast(position)) {
              return current.get()
            }

            state = 'awaiting-property-name'
            break
          default:
            throw unexpectedTokenError(token.type, position)
        }
        break
      case 'array':
        switch (token.type) {
          case 'string-quoted':
          case 'string-unquoted':
          case 'number':
            arrayValue.add(stripApostrophes(token.value))
            position = token.position.end + 1

            if (isLast(position)) {
              throw nonMatchingArrayBracket(arrayValue.getStartPosition())
            }

            break
          case 'whitespace':
          case 'comma':
            position = token.position.end + 1

            if (isLast(position)) {
              throw nonMatchingArrayBracket(arrayValue.getStartPosition())
            }

            break
          case 'bracket-right':
            current.completeProperty(arrayValue.get(), token.position.end)
            position = token.position.end + 1

            if (isLast(position)) {
              return current.get()
            }

            state = 'awaiting-property-name'
            break
          default:
            throw unexpectedTokenError(token.type, position)
        }
        break
    }
  } while (true)
}

const parser = text => {
  if (text === undefined || text === null) {
    throw new Error('No value specified.')
  }

  if (!isString(text)) {
    throw new Error('The value specified must be a string.')
  }

  if (text.length === 0) {
    return {}
  }

  if (isWhitespace(text)) {
    return {}
  }

  return parseObject(text, 0, 0, false).result
}

export default parser

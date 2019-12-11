import { isString } from '@utilz/types'
import isWhitespace from './utils/is-whitespace'
import lexer from './lexer'
import toTokenType from './utils/to-token-type'

const unexpectedTokenError = (type, position) =>
  new Error(`Unexpected ${toTokenType(type)} at position ${position}.`)

const obj = () => {
  const result = {}
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

      console.log(`setting ${propertyName} to ${value}`)
      result[propertyName] = value

      propertyName = null
    },
    get() {
      return result
    },
  }
}

const parserInternal = text => {
  let state = 'awaiting-property-name'
  let current = obj()
  let position = 0

  const isLast = position => position >= text.length - 1

  do {
    let token = lexer(text, position)
    console.log(text, position, token)

    console.log(state, token.type)
    switch (state) {
      case 'awaiting-property-name':
        switch (token.type) {
          case 'whitespace':
            console.log('whitespace found', token.position.end)
            position = token.position.end + 1
            console.log('position is now ', position)
            break
          case 'string-unquoted':
          case 'number':
            position = token.position.end + 1
            current.startProperty(token.value)

            if (isLast(position)) {
              current.completeProperty(true)
              return current.get()
            }

            state = 'property-name'
            break
          default:
            throw unexpectedTokenError(token.type, position)
        }
        break
      case 'property-name':
        switch (token.type) {
          case 'colon':
            position = token.position.end + 1
            state = 'property-value'
            break
          case 'whitespace':
            current.completeProperty(true)
            position = token.position.end + 1
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
          case 'number':
          case 'boolean':
            console.log('COMPLETE', token.value)
            current.completeProperty(token.value)
            position = token.position.end + 1

            if (isLast(position)) {
              return current.get()
            }

            state = 'awaiting-property-name'
            break
          case 'string-quoted':
            current.completeProperty(
              token.value.substring(1, token.value.length - 1)
            ) // strip off apostrophes
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
  } while (position < text.length - 1)

  return current.get()
}

const parser = text => {
  console.log('TEXT', text)
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

  console.log('text', text)
  return parserInternal(text)
}

export default parser

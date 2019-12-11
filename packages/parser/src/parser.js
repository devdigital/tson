import { isString } from '@utilz/types'
import isWhitespace from './utils/is-whitespace'
import lexer from './lexer'
import toTokenType from './utils/to-token-type'

const unexpectedTokenError = (type, position) =>
  new Error(`Unexpected ${toTokenType(type)} at position ${position}.`)

const objectFactory = () => {
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

const arrayFactory = () => {
  let result = []

  return {
    start() {
      result = []
    },
    add(value) {
      result.push(value)
    },
    get() {
      return result
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

  console.log(value)
  if (value[0] === "'" && value[value.length - 1] === "'") {
    return value.substring(1, value.length - 1)
  }

  return value
}

const parserInternal = text => {
  let state = 'awaiting-property-name'
  let current = objectFactory()
  let array = arrayFactory()
  let position = 0

  const isLast = position => position >= text.length - 1

  do {
    console.log(`|${text}|`)
    console.log('getting token from positon ', position)
    let token = lexer(text, position)

    console.log(state, token.type)
    switch (state) {
      case 'awaiting-property-name':
        switch (token.type) {
          case 'whitespace':
            console.log('whitespace found', token.position.end)
            position = token.position.end + 1

            if (isLast(position)) {
              return current.get()
            }
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
            console.log('COMPLETE', token.value)
            current.completeProperty(stripApostrophes(token.value))
            position = token.position.end + 1

            if (isLast(position)) {
              return current.get()
            }

            state = 'awaiting-property-name'
            break
          case 'bracket-left':
            position = token.position.end + 1
            array.start()
            state = 'array'
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
            array.add(stripApostrophes(token.value))
            position = token.position.end + 1
            console.log('added array value', state)
            break
          case 'whitespace':
          case 'comma':
            position = token.position.end + 1
            break
          case 'bracket-right':
            current.completeProperty(array.get())
            position = token.position.end + 1

            console.log(position)
            if (isLast(position)) {
              console.log('last!')
              const foo = current.get()
              console.log(foo)
              return foo
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

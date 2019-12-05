import { isString } from '@utilz/types'

const parse = value => {
  if (value === undefined || value === null) {
    throw new Error('No value specified.')
  }

  if (!isString(value)) {
    throw new Error('The value specified must be a string.')
  }

  if (value.length === 0) {
    return {}
  }

  if (/^\s*$/.test(value)) {
    return {}
  }
}

export default parse

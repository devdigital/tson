// TODO: type
export function isWhitespace(char: any) {
  if (char === undefined || char === null) {
    throw new Error('No character specified.')
  }

  return char.length > 0 && !/[^\s]/.test(char)
}

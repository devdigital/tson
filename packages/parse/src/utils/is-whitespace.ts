export function isWhitespace(char: string) {
  if (char == null) {
    throw new Error('No character specified.');
  }

  return char.length > 0 && !/[^\s]/.test(char);
}

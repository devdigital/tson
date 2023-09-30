export function getCharacter(text: string) {
  return function (pos: number) {
    if (pos < 0) {
      throw new Error(`Invalid position '${pos}'.`)
    }

    if (pos > text.length - 1) {
      throw new Error(`Invalid position '${pos}'.`)
    }

    return text[pos]
  }
}

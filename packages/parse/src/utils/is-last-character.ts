function isLastCharacter(text: string) {
  return function (pos: number) {
    return pos === text.length - 1
  }
}

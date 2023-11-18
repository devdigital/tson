export function toTokenType(type: string) {
  switch (type) {
    case 'string-unquoted':
      return 'unquoted string';
    case 'string-quoted':
      return 'quoted string';
    case 'brace-left':
      return 'left brace';
    case 'brace-right':
      return 'right brace';
    case 'bracket-left':
      return 'left bracket';
    case 'bracket-right':
      return 'right bracket';
    default:
      return type;
  }
}

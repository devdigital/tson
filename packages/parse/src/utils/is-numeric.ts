// TODO: type
export function isNumeric(value: any) {
  if (!value) {
    return false
  }

  return !isNaN(parseFloat(value)) && isFinite(value)
}

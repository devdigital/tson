export class NonMatchingApostropheError extends Error {
  constructor(position: number) {
    super(`Missing ending quotation started at position ${position}.`);
  }
}

import { toTokenType } from './utils/to-token-type';

export class UnexpectedTokenError extends Error {
  constructor(type: string | null, position: number) {
    super(
      type
        ? `Unexpected ${toTokenType(type)} at position ${position}.`
        : `Unexpected token at position ${position}.`
    );
  }
}

export class NoPropertyValueError extends Error {
  constructor(propertyName: string | null) {
    super(
      propertyName
        ? `No property value specified for property '${propertyName}'.`
        : 'No property value specified.'
    );
  }
}

export class NonMatchingArrayBracket extends Error {
  constructor(position: number | null) {
    super(
      position
        ? `No closing bracket for array started at position ${position}.`
        : 'No closing bracket for array.'
    );
  }
}

export class NonMatchingObjectBrace extends Error {
  constructor(position: number) {
    super(`No closing brace for object started at position ${position}.`);
  }
}

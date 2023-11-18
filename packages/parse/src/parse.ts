import { isString } from '@utilz/types';
import { isWhitespace } from './utils/is-whitespace';
import { toTokenType } from './utils/to-token-type';
import { lexer } from './lexer';

class UnexpectedTokenError extends Error {
  constructor(type: string | null, position: number) {
    super(
      type
        ? `Unexpected ${toTokenType(type)} at position ${position}.`
        : `Unexpected token at position ${position}.`
    );
  }
}

class NoPropertyValueError extends Error {
  constructor(propertyName: string | null) {
    super(
      propertyName
        ? `No property value specified for property '${propertyName}'.`
        : 'No property value specified.'
    );
  }
}

class NonMatchingArrayBracket extends Error {
  constructor(position: number | null) {
    super(
      position
        ? `No closing bracket for array started at position ${position}.`
        : 'No closing bracket for array.'
    );
  }
}

class NonMatchingObjectBrace extends Error {
  constructor(position: number) {
    super(`No closing brace for object started at position ${position}.`);
  }
}

const objectFactory = (position: number) => {
  const result: Record<string, unknown> = {};
  let startPosition = position;
  let endPosition = position;

  let propertyName: string | null = null;

  return {
    startProperty(name: string) {
      propertyName = name;
    },
    completeProperty(value: unknown) {
      if (!propertyName) {
        throw new Error('Attempting to complete property with no name.');
      }

      if (result.hasOwnProperty(propertyName)) {
        throw new Error(`Property name '${propertyName}' already defined.`);
      }

      result[propertyName] = value;

      propertyName = null;
    },
    get() {
      return {
        result,
        startPosition,
        endPosition,
      };
    },
    propertyName() {
      return propertyName;
    },
    getStartPosition() {
      return startPosition;
    },
    getEndPosition() {
      return endPosition;
    },
    setEndPosition(position: number) {
      endPosition = position;
    },
  };
};

const arrayFactory = () => {
  let result: (string | null)[] = [];
  let startPosition: number | null = null;

  return {
    start(position: number) {
      startPosition = position;
      result = [];
    },
    add(value: string | null) {
      result.push(value);
    },
    get() {
      return result;
    },
    getStartPosition() {
      return startPosition;
    },
  };
};

const stripApostrophes = (value: string): string | null => {
  if (value == null) {
    return null;
  }

  if (value.length === 1) {
    return value;
  }

  if (value[0] === "'" && value[value.length - 1] === "'") {
    return value.substring(1, value.length - 1);
  }

  return value;
};

const parseObject = (
  text: string,
  objectStartPosition: number,
  parseStartPosition: number,
  childObject: Record<string, unknown> | boolean
) => {
  let state = 'awaiting-property-name';
  let current = objectFactory(objectStartPosition);
  let arrayValue = arrayFactory();
  let position = parseStartPosition;

  const isLast = (position: number) => position > text.length - 1;

  do {
    let token = lexer(text, position);
    current.setEndPosition(token.position.end ?? 0);

    switch (state) {
      case 'awaiting-property-name':
        switch (token.type) {
          case 'whitespace':
            position = (token.position.end ?? 0) + 1;

            if (isLast(position)) {
              if (childObject) {
                throw new NonMatchingObjectBrace(current.getStartPosition());
              }

              return current.get();
            }

            break;
          case 'string-unquoted':
          case 'number':
            position = (token.position.end ?? 0) + 1;
            current.startProperty(token.value);

            if (isLast(position)) {
              if (childObject) {
                throw new NonMatchingObjectBrace(current.getStartPosition());
              }

              current.completeProperty(true);
              return current.get();
            }

            state = 'property-name';
            break;
          case 'brace-right':
            if (!childObject) {
              throw new UnexpectedTokenError(token.type, position);
            }

            return current.get();
          default:
            throw new UnexpectedTokenError(token.type, position);
        }
        break;
      case 'property-name':
        switch (token.type) {
          case 'colon':
            position = (token.position.end ?? 0) + 1;

            if (isLast(position)) {
              throw new NoPropertyValueError(current.propertyName());
            }

            state = 'property-value';
            break;
          case 'whitespace':
            current.completeProperty(true);
            position = (token.position.end ?? 0) + 1;

            if (isLast(position)) {
              return current.get();
            }

            state = 'awaiting-property-name';
            break;
          case 'brace-right':
            if (!childObject) {
              throw new UnexpectedTokenError(token.type, position);
            }

            current.completeProperty(true);
            position = (token.position.end ?? 0) + 2; // skip end brace

            if (isLast(position)) {
              return current.get();
            }

            state = 'awaiting-property-name';
            break;
          default:
            throw new UnexpectedTokenError(token.type, position);
        }
        break;
      case 'property-value':
        switch (token.type) {
          case 'whitespace':
            throw new UnexpectedTokenError(token.type, position);
          case 'string-unquoted':
          case 'string-quoted':
          case 'number':
          case 'boolean':
            current.completeProperty(stripApostrophes(token.value));
            position = (token.position.end ?? 0) + 1;

            if (isLast(position)) {
              return current.get();
            }

            state = 'awaiting-property-name';
            break;
          case 'bracket-left':
            arrayValue.start(position);

            position = (token.position.end ?? 0) + 1;

            if (isLast(position)) {
              throw new NonMatchingArrayBracket(arrayValue.getStartPosition());
            }

            state = 'array-value';
            break;
          case 'brace-left':
            position = (token.position.end ?? 0) + 1;

            if (isLast(position)) {
              throw new NonMatchingObjectBrace(position - 1);
            }

            const { result, endPosition } = parseObject(
              text,
              position - 1,
              position,
              true // child object
            );

            current.completeProperty(result);

            position = endPosition + 1; // skip end brace

            if (isLast(position)) {
              return current.get();
            }

            state = 'awaiting-property-name';
            break;
          default:
            throw new UnexpectedTokenError(token.type, position);
        }
        break;
      case 'array-value':
        switch (token.type) {
          case 'string-quoted':
          case 'string-unquoted':
          case 'number':
          case 'boolean':
            arrayValue.add(stripApostrophes(token.value));
            position = (token.position.end ?? 0) + 1;

            if (isLast(position)) {
              throw new NonMatchingArrayBracket(arrayValue.getStartPosition());
            }

            break;
          case 'whitespace':
            position = (token.position.end ?? 0) + 1;

            if (isLast(position)) {
              throw new NonMatchingArrayBracket(arrayValue.getStartPosition());
            }

            break;
          case 'comma':
            position = (token.position.end ?? 0) + 1;
            state = 'array-comma';
            break;
          case 'bracket-right':
            current.completeProperty(arrayValue.get());
            position = (token.position.end ?? 0) + 1;

            if (isLast(position)) {
              return current.get();
            }

            state = 'awaiting-property-name';
            break;
          default:
            throw new UnexpectedTokenError(token.type, position);
        }
        break;
      case 'array-comma':
        switch (token.type) {
          case 'string-quoted':
          case 'string-unquoted':
          case 'number':
          case 'boolean':
            arrayValue.add(stripApostrophes(token.value));
            position = (token.position.end ?? 0) + 1;

            if (isLast(position)) {
              throw new NonMatchingArrayBracket(arrayValue.getStartPosition());
            }

            state = 'array-value';
            break;
          case 'whitespace':
            position = (token.position.end ?? 0) + 1;

            if (isLast(position)) {
              throw new NonMatchingArrayBracket(arrayValue.getStartPosition());
            }

            break;
          default:
            throw new UnexpectedTokenError(token.type, position);
        }
        break;
    }
  } while (true);
};

export const parse = (text: string) => {
  if (text == null) {
    throw new Error('No value specified.');
  }

  if (!isString(text)) {
    throw new Error('The value specified must be a string.');
  }

  if (text.length === 0) {
    return {};
  }

  if (isWhitespace(text)) {
    return {};
  }

  return parseObject(text, 0, 0, false).result;
};

import { parse } from './parse';
import { specialCharacters } from './utils/special-characters';
import { toTokenType } from './utils/to-token-type';

describe('parse', () => {
  it('returns empty object for empty string', () => {
    expect(parse('')).toEqual({});
  });

  it('returns empty object for whitespace', () => {
    expect(parse('   ')).toEqual({});
  });

  it('returns boolean property for value with no whitespace', () => {
    expect(parse('foo')).toEqual({ foo: true });
  });

  it('returns boolean property for value with prefixed whitespace', () => {
    expect(parse('    foo   ')).toEqual({ foo: true });
  });

  it('throws exception for quoted string', () => {
    expect(() => parse(`'foo'`)).toThrow(
      'Unexpected quoted string at position 0.'
    );
  });

  it.each(Object.entries(specialCharacters))(
    'special character %s throws exception type %s',
    (char, charType) => {
      expect(() => parse(char)).toThrow(
        `Unexpected ${toTokenType(charType)} at position 0.`
      );
    }
  );

  it('returns string property for key value', () => {
    expect(parse('foo:bar')).toEqual({
      foo: 'bar',
    });
  });

  it('returns string property for key value with whitespace', () => {
    expect(parse('   foo:bar   ')).toEqual({
      foo: 'bar',
    });
  });

  it('returns string property for quoted key value', () => {
    expect(parse(`foo:'bar'`)).toEqual({
      foo: 'bar',
    });
  });

  it('returns string property for quoted key value', () => {
    expect(parse(`foo:'bar'`)).toEqual({
      foo: 'bar',
    });
  });

  it('returns string property for quoted key value with whitespace', () => {
    expect(parse(`   foo:'bar'  `)).toEqual({
      foo: 'bar',
    });
  });

  it('returns number property', () => {
    expect(parse(`foo:2.6`)).toEqual({
      foo: 2.6,
    });
  });

  it('returns number property with whitespace', () => {
    expect(parse(`   foo:2.6  `)).toEqual({
      foo: 2.6,
    });
  });

  it('returns boolean false property', () => {
    expect(parse(`foo:false`)).toEqual({
      foo: false,
    });
  });

  it('returns boolean true property', () => {
    expect(parse(`foo:true`)).toEqual({
      foo: true,
    });
  });

  it('throws exception for colon following colon', () => {
    expect(() => parse(`foo::true`)).toThrow('Unexpected colon at position 4.');
  });

  it('throws exception for period following colon', () => {
    expect(() => parse(`foo:.bar`)).toThrow('Unexpected period at position 4.');
  });

  it('throws exception for common following colon', () => {
    expect(() => parse(`foo:,bar`)).toThrow('Unexpected comma at position 4.');
  });

  it('throws exception for whitespace following colon', () => {
    expect(() => parse(`foo: bar`)).toThrow(
      'Unexpected whitespace at position 4.'
    );
  });

  it('returns two boolean properties', () => {
    expect(parse('foo bar')).toEqual({
      foo: true,
      bar: true,
    });
  });

  it('returns two string properties', () => {
    expect(parse('foo:bar bar:baz')).toEqual({
      foo: 'bar',
      bar: 'baz',
    });
  });

  it('returns two quoted string properties', () => {
    expect(parse(`foo:'bar' bar:'baz'`)).toEqual({
      foo: 'bar',
      bar: 'baz',
    });
  });

  it('returns two number properties', () => {
    expect(parse(`foo:5 bar:4.5`)).toEqual({
      foo: 5,
      bar: 4.5,
    });
  });

  it('returns a single element number array', () => {
    expect(parse(`foo:[5]`)).toEqual({
      foo: [5],
    });
  });

  it('returns a multiple element number array', () => {
    expect(parse(`foo:[5,6,7]`)).toEqual({
      foo: [5, 6, 7],
    });
  });

  it('returns a multiple element number array with whitespace', () => {
    expect(parse(`foo:[  5  ,  6   , 7 ]`)).toEqual({
      foo: [5, 6, 7],
    });
  });

  it('returns a single string array for unquoted', () => {
    expect(parse(`foo:[foo,bar,baz]`)).toEqual({
      foo: ['foo', 'bar', 'baz'],
    });
  });

  it('returns a single string array for unquoted with whitespace', () => {
    expect(parse(`foo:[ foo ,  bar,  baz]`)).toEqual({
      foo: ['foo', 'bar', 'baz'],
    });
  });

  it('returns a multiple element string array for quoted', () => {
    expect(parse(`foo:['foo:','bar.','baz,']`)).toEqual({
      foo: ['foo:', 'bar.', 'baz,'],
    });
  });

  it('returns a multiple element string array for quoted with whitespace', () => {
    expect(parse(`foo:[ ' foo: ' ,  'bar.' , ' baz,']`)).toEqual({
      foo: [' foo: ', 'bar.', ' baz,'],
    });
  });

  it('returns a multiple element boolean array', () => {
    expect(parse(`foo:[false,true,true]`)).toEqual({
      foo: [false, true, true],
    });
  });

  it('returns a multiple element boolean array with whitespace', () => {
    expect(parse(`foo:[ false  ,  true , true]`)).toEqual({
      foo: [false, true, true],
    });
  });

  it('returns mixed array of elements', () => {
    expect(parse(`foo:['foo',bar,2.5,6,+7,-9,'baz,']`)).toEqual({
      foo: ['foo', 'bar', 2.5, 6, 7, -9, 'baz,'],
    });
  });

  it('throws exception when starting for array with no property name', () => {
    expect(() => parse(`[foo]`)).toThrow(
      'Unexpected left bracket at position 0.'
    );
  });

  it('throws exception when trailing comma within array', () => {
    expect(() => parse(`foo:[foo,]`)).toThrow(
      'Unexpected right bracket at position 9.'
    );
  });

  it('throws exception when two trailing commas within array', () => {
    expect(() => parse(`foo:[foo  ,   ,]`)).toThrow(
      'Unexpected comma at position 14.'
    );
  });

  it.each(
    Object.entries(specialCharacters).filter(
      (e) => e[1] !== 'comma' && e[1] !== 'bracket-right'
    )
  )(
    'special character %s within array throws exception type %s',
    (char, charType) => {
      expect(() => parse(`foo:[${char}]`)).toThrow(
        `Unexpected ${toTokenType(charType)} at position 5.`
      );
    }
  );

  it.each(
    Object.entries(specialCharacters).filter(
      (e) => e[1] !== 'comma' && e[1] !== 'bracket-right'
    )
  )(
    'special character %s following comma within array throws exception $s',
    (char, charType) => {
      expect(() => parse(`foo:[foo,${char}]`)).toThrow(
        `Unexpected ${toTokenType(charType)} at position 9.`
      );
    }
  );

  it('throws exception when no colon between property name and value', () => {
    expect(() => parse(`foo[foo]`)).toThrow(
      'Unexpected left bracket at position 3.'
    );
  });

  it('includes period in property name', () => {
    expect(parse(`foo.`)).toEqual({
      ['foo.']: true,
    });
  });

  it('includes number in property name', () => {
    expect(parse(`foo2.6`)).toEqual({
      ['foo2.6']: true,
    });
  });

  it('throws exception when no value after colon', () => {
    expect(() => parse(`foo:`)).toThrow(
      `No property value specified for property 'foo'.`
    );
  });

  it('throws on non closing array', () => {
    expect(() => parse('foo:[')).toThrow(
      'No closing bracket for array started at position 4.'
    );
  });

  it('throws on whitespace following bracket with no closing bracket', () => {
    expect(() => parse('foo:[ ')).toThrow(
      'No closing bracket for array started at position 4.'
    );
  });

  it('throws on unquoted string following bracket with no closing bracket', () => {
    expect(() => parse('foo:[bar')).toThrow(
      'No closing bracket for array started at position 4.'
    );
  });

  it('throws on quoted string following bracket with no closing bracket', () => {
    expect(() => parse("foo:['bar'")).toThrow(
      'No closing bracket for array started at position 4.'
    );
  });

  it('throws on number following bracket with no closing bracket', () => {
    expect(() => parse('foo:[2.6')).toThrow(
      'No closing bracket for array started at position 4.'
    );
  });

  it('throws on number following bracket with no closing bracket', () => {
    expect(() => parse('foo:[ 2.6')).toThrow(
      'No closing bracket for array started at position 4.'
    );
  });

  it('returns empty array with no whitespace', () => {
    expect(parse('foo:[]')).toEqual({
      foo: [],
    });
  });

  it('returns empty array with whitespace', () => {
    expect(parse('foo:[    ]')).toEqual({
      foo: [],
    });
  });

  it('returns object with unquoted string', () => {
    expect(parse('foo:{foo:bar}')).toEqual({
      foo: {
        foo: 'bar',
      },
    });
  });

  it('returns object with quoted string', () => {
    expect(parse("foo:{foo:'bar'}")).toEqual({
      foo: {
        foo: 'bar',
      },
    });
  });

  it('returns object with number', () => {
    expect(parse('foo:{foo:26.6}')).toEqual({
      foo: {
        foo: 26.6,
      },
    });
  });

  it('returns object with empty array', () => {
    expect(parse('foo:{foo:[]}')).toEqual({
      foo: {
        foo: [],
      },
    });
  });

  it('returns object with array with single element', () => {
    expect(parse('foo:{foo:[26]}')).toEqual({
      foo: {
        foo: [26],
      },
    });
  });

  it('returns object with array with multiple unquoted string elements', () => {
    expect(parse('foo:{foo:[bar, boo, baz]}')).toEqual({
      foo: {
        foo: ['bar', 'boo', 'baz'],
      },
    });
  });

  it('returns object with array with multiple quoted string elements', () => {
    expect(parse("foo:{foo:[ 'bar', 'boo'  , 'baz'  ]}")).toEqual({
      foo: {
        foo: ['bar', 'boo', 'baz'],
      },
    });
  });

  it('returns object for whitespace before closing brace', () => {
    expect(parse('foo:{foo:bar }')).toEqual({
      foo: {
        foo: 'bar',
      },
    });
  });

  it('throws exception for period before brace', () => {
    expect(() => parse('foo:{foo:bar  .}')).toThrow(
      'Unexpected period at position 14.'
    );
  });

  it('throws exception for no closing brace', () => {
    expect(() => parse('foo:{')).toThrow(
      'No closing brace for object started at position 4.'
    );
  });

  it('throws exception for no closing brace followed by whitespace', () => {
    expect(() => parse('foo:{ ')).toThrow(
      'No closing brace for object started at position 4.'
    );
  });

  it('throws exception for no colon before object value', () => {
    expect(() => parse('foo{')).toThrow('Unexpected left brace at position 3.');
  });

  it('returns object with boolean property', () => {
    expect(parse('foo:{bar}')).toEqual({
      foo: {
        bar: true,
      },
    });
  });

  it('returns object with nested boolean property', () => {
    expect(parse('foo:{bar:{baz}}')).toEqual({
      foo: {
        bar: {
          baz: true,
        },
      },
    });
  });

  it('returns object for whitespace before object value property name', () => {
    expect(parse('foo:{ bar:baz}')).toEqual({
      foo: {
        bar: 'baz',
      },
    });
  });

  it('returns object value with multiple unquoted string properties', () => {
    expect(parse('foo:{ bar:baz foo:bar     baz:foo }')).toEqual({
      foo: {
        bar: 'baz',
        foo: 'bar',
        baz: 'foo',
      },
    });
  });

  it('returns object value with multiple quoted string properties', () => {
    expect(parse("foo:{ bar:'baz  '   foo:'bar'     baz:' foo'}")).toEqual({
      foo: {
        bar: 'baz  ',
        foo: 'bar',
        baz: ' foo',
      },
    });
  });

  it('returns object value with multiple number properties', () => {
    expect(
      parse('foo:{ bar:2 foo:5.67   baz:+56  boo:-7 blah:-9.34  }')
    ).toEqual({
      foo: {
        bar: 2,
        foo: 5.67,
        baz: 56,
        boo: -7,
        blah: -9.34,
      },
    });
  });

  it('throws exception for duplicate property name in object value', () => {
    expect(() => parse('foo:{foo:bar foo:baz}')).toThrow(
      "Property name 'foo' already defined."
    );
  });

  it('returns nested objects', () => {
    expect(parse('foo:{ bar:{blah:baz}}  ')).toEqual({
      foo: {
        bar: {
          blah: 'baz',
        },
      },
    });
  });

  it('returns nested objects with multiple unquoted strings', () => {
    expect(parse('foo:{ bar:{blah:baz baz:boo foo:blah  }}  ')).toEqual({
      foo: {
        bar: {
          blah: 'baz',
          baz: 'boo',
          foo: 'blah',
        },
      },
    });
  });

  it('returns nested objects with multiple quoted strings', () => {
    expect(
      parse("foo:{ bar:{blah:'baz  ' baz:'  boo' foo:'blah'}  }  ")
    ).toEqual({
      foo: {
        bar: {
          blah: 'baz  ',
          baz: '  boo',
          foo: 'blah',
        },
      },
    });
  });

  it('returns nested objects with multiple numbers', () => {
    expect(
      parse('foo:{ bar:{blah:2   baz:5.6   foo:+34 blah2:-9 biz:-23   }  }  ')
    ).toEqual({
      foo: {
        bar: {
          blah: 2,
          baz: 5.6,
          foo: 34,
          blah2: -9,
          biz: -23,
        },
      },
    });
  });

  it('returns nested objects with booleans', () => {
    expect(parse('foo:{ bar:{blah baz:true foo:false     }  }  ')).toEqual({
      foo: {
        bar: {
          blah: true,
          baz: true,
          foo: false,
        },
      },
    });
  });

  it('returns multiple nested objects', () => {
    expect(
      parse("foo:{ bar:{blah baz:{tru boo:{arg:'foo' num:7}}   }  }  ")
    ).toEqual({
      foo: {
        bar: {
          blah: true,
          baz: {
            tru: true,
            boo: {
              arg: 'foo',
              num: 7,
            },
          },
        },
      },
    });
  });
});

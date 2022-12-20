import {toField} from './to-field';
describe('toField', () => {
  it('should export toField service', () => {
    expect(toField).toBeDefined();
  });
  it('should convert list of fields to field string', () => {
    expect(toField(['id', 'type', 'name']).toString()).toEqual('id,name,type');
  });
  it('should accept list collection as object', () => {
    expect(
      toField({
        id: null,
        type: null,
        name: null,
      }).toString(),
    ).toEqual('id,name,type');
  });
  it('should support nested fields', () => {
    expect(
      toField([
        'id',
        {
          project: ['id'],
          user: {
            id: null,
            avatar: ['url'],
          },
        },
      ]).toString(),
    ).toEqual('id,project(id),user(avatar(url),id)');
  });
  it('should convert nested field to string', () => {
    expect(
      toField([
        'id',
        {
          project: ['id'],
          user: toField({
            id: null,
            avatar: ['url'],
          }),
        },
      ]).toString(),
    ).toEqual('id,project(id),user(avatar(url),id)');
  });
  it('should ignore empty object', () => {
    expect(toField(['id', {}]).toString()).toEqual('id');
  });
  it('should support inner braced string in array', () => {
    expect(
      toField([
        {
          field: ['value(id)'],
        },
      ]).toString(),
    ).toEqual('field(value(id))');
  });
  it('should ignore empty string', () => {
    const field = toField(['id', '']);
    expect(field.getNormalizedFields()).toEqual({
      id: null,
    });
    expect(field.toString()).toEqual('id');
  });
  it('should ignore empty string with objects', () => {
    const field = toField([
      {
        attachments: ['id', 'type', ''],
      },
      '',
    ]);
    expect(field.getNormalizedFields()).toEqual({
      attachments: {
        id: null,
        type: null,
      },
    });
    expect(field.toString()).toEqual('attachments(id,type)');
  });
  it('should allow remove fields', () => {
    expect(toField(['id', 'type', 'name']).exclude('name').toString()).toEqual(
      'id,type',
    );
  });
  it('should allow remove fields from object', () => {
    expect(
      toField([
        'id',
        'type',
        {
          name: null,
          bar: null,
        },
      ])
        .exclude('name')
        .toString(),
    ).toEqual('bar,id,type');
  });
  it('should allow remove fields from nested array', () => {
    expect(
      toField(['id', 'type', ['name', 'bar']])
        .exclude('name')
        .toString(),
    ).toEqual('bar,id,type');
  });
  it('should allow remove fields from another toField', () => {
    expect(
      toField(['id', 'type', toField(['name', 'bar'])])
        .exclude('name')
        .toString(),
    ).toEqual('bar,id,type');
  });
  it('should remove from inner toField object', () => {
    expect(
      toField(['id', 'type', toField(['name', 'bar'])])
        .exclude(toField(['name']).getNormalizedFields())
        .toString(),
    ).toEqual('bar,id,type');
  });
  it('should remove whole sub-field', () => {
    const subfield = toField(['name', 'bar']);
    expect(
      toField(['id', 'type', subfield])
        .exclude(subfield.getNormalizedFields())
        .toString(),
    ).toEqual('id,type');
  });
  it('should remove whole sub-field when it is wrapped to array', () => {
    const subfield = toField(['id2']);
    expect(
      toField(['id', 'type', subfield]).exclude([subfield]).toString(),
    ).toEqual('id,type');
  });
  it('should exclude whole object', () => {
    const excludeFields = {
      tags: {
        color: ['id'],
        owner: ['id'],
      },
    };
    expect(
      toField([
        'type',
        {
          tags: {
            color: ['id'],
            owner: ['id'],
          },
        },
      ])
        .exclude(excludeFields)
        .toString(),
    ).toEqual('type');
  });
  it('should exclude part of object', () => {
    const excludeFields = toField([
      {
        subtasks: ['id', 'issuesSize', 'unresolvedIssuesSize'],
      },
    ]);
    expect(
      toField([
        'type',
        {
          subtasks: [
            'id',
            'issuesSize',
            'unresolvedIssuesSize',
            {
              trimmedIssues: ['id', 'smt'],
            },
          ],
        },
      ])
        .exclude(excludeFields)
        .toString(),
    ).toEqual('subtasks(trimmedIssues(id,smt)),type');
  });
  it('should add object to toField and not change original object', () => {
    const originalObject = {
      field: {
        value: null,
      },
    };
    const foo = toField([
      originalObject,
      {
        field: {
          anotherValue: null,
        },
        anotherField: null,
      },
    ]);
    expect(foo.getNormalizedFields().field.hasOwnProperty('value')).toBe(true);
    expect(originalObject).toEqual({
      field: {
        value: null,
      },
    });
  });
  it('should not change original toFiled', () => {
    const originalToFiled = toField([
      {
        field: {
          value: null,
        },
      },
    ]);
    const foo = toField([
      originalToFiled,
      {
        field: {
          anotherValue: null,
        },
      },
    ]);
    expect(foo.getNormalizedFields().field.hasOwnProperty('value')).toBe(true);
    expect(originalToFiled.toString()).toEqual('field(value)');
  });
  describe('parse', () => {
    it('should parse braced string', () => {
      expect(parse('field(value)')).toEqual({
        field: {
          value: null,
        },
      });
    });
    it('should parse string with nested fields', () => {
      expect(parse('foo(bar(zoo(moo)))')).toEqual({
        foo: {
          bar: {
            zoo: {
              moo: null,
            },
          },
        },
      });
    });
    it('should throw exception if string has unmatched open brace', () => {
      expect(() => parse('foo(')).toThrow();
    });
    it('should throw exception if string has unmatched close brace', () => {
      expect(() => parse('foo)')).toThrow();
    });
    it('should parse braced string after some field', () => {
      expect(parse('name,field(value)')).toEqual({
        name: null,
        field: {
          value: null,
        },
      });
    });
    it('should parse braced string before some field', () => {
      expect(parse('field(value),name')).toEqual({
        field: {
          value: null,
        },
        name: null,
      });
    });
    it('should parse inner braced string at the beginning of the braced value', () => {
      expect(parse('field(value(id),anotherValue)')).toEqual({
        field: {
          value: {
            id: null,
          },
          anotherValue: null,
        },
      });
    });
    it('should parse inner braced string at the end of the braced value', () => {
      expect(parse('field(anotherValue,value(id))')).toEqual({
        field: {
          anotherValue: null,
          value: {
            id: null,
          },
        },
      });
    });
    it('should parse inner braced string in the middle of the braced value', () => {
      expect(parse('field(anotherValue,value(id),oneMoreValue)')).toEqual({
        field: {
          anotherValue: null,
          value: {
            id: null,
          },
          oneMoreValue: null,
        },
      });
    });
    it('should parse two braced string', () => {
      expect(parse('field(value),anotherField(value)')).toEqual({
        field: {
          value: null,
        },
        anotherField: {
          value: null,
        },
      });
    });
    it('should parse braced string with spaces', () => {
      expect(parse(' field ( value , anotherValue ) ')).toEqual({
        field: {
          value: null,
          anotherValue: null,
        },
      });
    });
    it('should parse string without braces', () => {
      expect(parse('foo,bar')).toEqual({
        foo: null,
        bar: null,
      });
    });
    it('should correctly handle empty nesting', () => {
      expect(parse('foo((()))')).toEqual({
        foo: {},
      });
      expect(parse('((()))')).toEqual({});
    });

    function parse(str) {
      return toField([str]).getNormalizedFields();
    }
  });
  describe('zip', () => {
    it('should move repeated fields to projection', () => {
      expect(zip('foo(id,type,name),bar(id,type,name)')).toEqual(
        'bar(@1),foo(@1);@1:id,name,type',
      );
    });
    it('should remove duplications between nested fields and top fields', () => {
      expect(zip('foo(id,type,name),id,type,name')).toEqual(
        'foo(@1),@1;@1:id,name,type',
      );
    });
    it('should not produce unoptimized zipped string if it bigger than passed string', () => {
      expect(zip('foo(id),id')).toEqual('foo(id),id');
    });
    it('should correctly handle case when some field name contains is a part of another field name', () => {
      expect(zip('x(foooooBooooo,foooooBoooooZoooooo)')).toEqual(
        'x(foooooBooooo,foooooBoooooZoooooo)',
      );
    });
    it('should correctly reduce parts with ()', () => {
      expect(
        zip(
          'foo(x,bar(foooooBooooo,foooooBoooooZoooooo)),zoo(x,bar(foooooBooooo,foooooBoooooZoooooo))',
        ),
      ).toEqual('foo(@1),zoo(@1);@1:bar(foooooBooooo,foooooBoooooZoooooo),x');
    });
    it('should show example where zip algorithm would not produce the best solution', () => {
      // The best solution would be
      // bar(@2),foo(@1),@1;@1:@2,time;@2:it,type,name
      // bar(id,name,type),foo(@1),@1;@1:id,name,time,type
      //
      // Current algorithm of serialization use alphabetic order when create a
      // string so we can stuck with the case when we could not match substrings
      // due to not sequential order for example a user has passed "a(a,c,b),b(a,c)"
      // and may expect that zip would remove "a,c" duplications
      // but due to parsing and serialization we get "a(a,b,c),b(a,c)" so as you can
      // se in this string we could not easily match substring "ac"
      expect(
        zip('foo(id,type,name,time),id,type,name,time,bar(id,type,name)'),
      ).toEqual('bar(id,name,type),foo(@1),@1;@1:id,name,time,type');
    });

    function zip(str) {
      return toField([str]).toString(true);
    }
  });
});
import {deepClone} from './deepClone';

export interface ToFieldImpl {
  constructor: Function;
  getNormalizedFields: () => Record<string, any>;
  exclude: (excludedFields: string) => string;
  toString: (zip?: boolean) => string;
}

function toField(fields: any): (fields: any) => ToFieldImpl {
  let normalizedFields;
  let fieldsString;

  const getNormalizedFields = () => {
    if (!normalizedFields) {
      normalizedFields = normalize(isObject(fields) ? copy(fields) : fields);
    }

    return normalizedFields;
  };

  const getFieldsString = zip => {
    if (!fieldsString) {
      fieldsString = serialize(getNormalizedFields(), zip);
    }

    return fieldsString;
  };

  return {
    constructor: toField,
    getNormalizedFields: getNormalizedFields,
    exclude: excludedFields => {
      if (isToField(excludedFields)) {
        excludedFields = excludedFields.getNormalizedFields();
      } else {
        excludedFields = normalize([].concat(excludedFields));
      }

      function deleteKeys(original, excluded, res) {
        Object.keys(original).forEach(key => {
          if (excluded[key] && typeof excluded[key] === 'object') {
            res[key] = {};
            deleteKeys(original[key], excluded[key], res[key]);

            if (Object.keys(res[key]).length === 0) {
              delete res[key];
            }

            return;
          }

          if (!(key in excluded) || original[key] !== excluded[key]) {
            res[key] = original[key];
          }
        });
      }

      const res = {};
      deleteKeys(getNormalizedFields(), excludedFields, res);
      return toField(res);
    },
    toString: getFieldsString,
  };
}

function normalize(data) {
  switch (true) {
    case isToField(data):
      return copy(data.getNormalizedFields());

    case Array.isArray(data):
      return data.map(it => normalize(it)).reduce(merge, {});

    case isObject(data):
      return Object.keys(data).reduce((data, key) => {
        data[key] = normalize(data[key]);
        return data;
      }, data);

    case typeof data === 'string' && data !== '': {
      if (/[(,)]/.test(data)) {
        return parse(data);
      }

      const it = {};
      it[data] = null;
      return it;
    }

    case typeof data === 'number': {
      const it = {};
      it[data] = null;
      return it;
    }

    default:
      return null;
  }
}

function parse(str) {
  const parents = [{}];
  str.replace(/([^,()]*)([,()])?/g, (_, part, separator) => {
    const parent = parents[0];
    part = part.trim();
    let value = null;

    switch (true) {
      case separator === '(':
        value = {};
        parents.unshift(value);
        break;

      case separator === ')':
        parents.shift();

        if (parents.length === 0) {
          throw Error(`Unmatched close brace in string "${str}"`);
        }

        break;

      default:
        break;
    }

    if (part) {
      parent[part] = value;
    }

    return '';
  });

  if (parents.length !== 1) {
    throw Error(`Unmatched open brace in string "${str}"`);
  }

  return parents[0];
}

function serialize(fields, zip = false) {
  const matches = {};
  const str = serializeTree(fields, zip ? zipVisitor : null);

  if (!zip) {
    return str;
  }

  return Object.keys(matches)
    .sort(sortByLengthAndMatch)
    .reduce(zipreduce, [str, 1])[0];

  function zipVisitor(part) {
    matches[part] = (matches[part] || 0) + 1;
  }

  function zipreduce([str, id], part) {
    const projectionId = `@${id}`;
    const br = '[,()]|\\s+';
    let zipped = str.replace(
      new RegExp(`(^|${br})${escape(part)}(${br}|$)`, 'g'),
      `$1${projectionId}$2`,
    );
    zipped = `${zipped};${projectionId}:${part}`;

    if (zipped.length < str.length) {
      return [zipped, id + 1];
    }

    return [str, id];
  }

  function escape(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function sortByLengthAndMatch(x, y) {
    const xl = x.length;
    const yl = y.length;

    if (xl === yl) {
      const xv = matches[x];
      const yv = matches[y];
      return xv > yv ? -1 : xv === yv ? 0 : 1;
    }

    return xl > yl ? -1 : 1;
  }
}

function serializeTree(fields, visitor) {
  if (!fields) {
    return '';
  }

  const str = Object.keys(fields)
    .sort()
    .map(fieldName => {
      const value = fields[fieldName];
      const subFields = serializeTree(value, visitor);
      const result =
        subFields === '' ? fieldName : `${fieldName}(${subFields})`;
      visitor && visitor(result);
      return result;
    })
    .join(',');
  visitor && visitor(str);
  return str;
}

function merge(x, y) {
  if (!x || !y) {
    return x || y;
  }

  Object.keys(y).forEach(key => {
    x[key] = merge(x[key], y[key]);
  });
  return x;
}

function isToField(field) {
  return !!(field && field.constructor === toField);
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function copy(value) {
  return deepClone(value);
}

export {toField};

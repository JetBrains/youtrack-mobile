function deepClone(val) {
  switch (kindOf(val)) {
    case 'Object':
      return deepCloneObject(val);

    case 'Array':
      return deepCloneArray(val);

    default:
      return clone(val);
  }
}

function deepMixIn(target, ...args) {
  args.forEach(obj => {
    if (obj) {
      Object.entries(obj).forEach(([key, val]) => {
        copyProp(target, val, key);
      });
    }
  });
  return target;
}

function copyProp(target, val, key: string) {
  const existing = target[key];

  if (isPlainObject(val) && isPlainObject(existing)) {
    deepMixIn(existing, val);
  } else {
    target[key] = val;
  }
}

function clone(val) {
  switch (kindOf(val)) {
    case 'Object':
      return cloneObject(val);

    case 'Array':
      return cloneArray(val);

    case 'RegExp':
      return cloneRegExp(val);

    case 'Date':
      return cloneDate(val);

    default:
      return val;
  }
}

function cloneObject(source) {
  if (isPlainObject(source)) {
    return Object.entries(source).reduce((out, [key, value]) => {
      out[key] = value;
      return out;
    }, {});
  } else {
    return source;
  }
}

function cloneArray(arr) {
  return arr.slice();
}

function cloneRegExp(r) {
  let flags = '';
  flags += r.multiline ? 'm' : '';
  flags += r.global ? 'g' : '';
  flags += r.ignoreCase ? 'i' : '';
  return new RegExp(r.source, flags);
}

function cloneDate(date) {
  return new Date(+date);
}

function deepCloneObject(source) {
  if (isPlainObject(source)) {
    return Object.entries(source).reduce((out, [key, val]) => {
      out[key] = deepClone(val);
      return out;
    }, {});
  } else {
    return source;
  }
}

function deepCloneArray(arr) {
  return arr.map(it => deepClone(it));
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && value.constructor === Object;
}

function kindOf(val) {
  if (val === null) {
    return 'Null';
  } else if (val === undefined) {
    return 'Undefined';
  } else {
    return /^\[object (.*)\]$/.exec(Object.prototype.toString.call(val))?.[1];
  }
}

export {deepClone, deepMixIn};

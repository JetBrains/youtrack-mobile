import {deepClone} from './deepClone';
export function merge(src, ...args) {
  return args.reduce((target, obj) => {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) {
        continue;
      }

      const val = obj[key];

      if (isObject(val) && isObject(target[key])) {
        target[key] = merge(target[key], val);
      } else {
        target[key] = deepClone(val);
      }
    }

    return target;
  }, deepClone(src));
}

function isObject(val) {
  return (
    val !== null && Object.prototype.toString.call(val) === '[object Object]'
  );
}

/* @flow */

import {getEntityPresentation} from '../issue-formatter/issue-formatter';

export function sortAlphabetically(item1: Object, item2: Object) {
  const name1 = getEntityPresentation(item1).toLowerCase();
  const name2 = getEntityPresentation(item2).toLowerCase();

  if (name1 > name2) {
    return 1;
  }
  if (name1 < name2) {
    return -1;
  }
  return 0;
}

export function sortByTimestamp(a: Object & { timestamp: number }, b: Object & { timestamp: number }) {
  if (a.timestamp < b.timestamp) {
    return -1;
  }
  if (a.timestamp > b.timestamp) {
    return 1;
  }
  return 0;
}

export function sortByTimestampReverse(a: Object & { timestamp: number }, b: Object & { timestamp: number }) {
  if (a.timestamp > b.timestamp) {
    return -1;
  }
  if (a.timestamp < b.timestamp) {
    return 1;
  }
  return 0;
}

export function sortByOrdinal(a: Object & { ordinal: number }, b: Object & { ordinal: number }) {
  return a.ordinal - b.ordinal;
}

export function groupByFavoritesAlphabetically(list: Array<Object>, favoriteFiledName: string): Array<Object> {
  const map: { favorites: Array<Object>, others: Array<Object> } = (list || []).sort(sortAlphabetically).reduce(
    (list, item) => {
      if (item[favoriteFiledName]) {
        list.favorites.push(item);
      } else {
        list.others.push(item);
      }
      return list;
    },
    {
      favorites: [],
      others: []
    }
  );
  return [...map.favorites, ...map.others];
}

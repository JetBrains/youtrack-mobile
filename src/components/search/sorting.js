/* @flow */

import {getEntityPresentation} from '../issue-formatter/issue-formatter';

function doSortBy(
  a: Object & { timestamp: number },
  b: Object & { timestamp: number },
  fieldName: string,
  reverse: boolean = false
) {
  if (a[fieldName] < b[fieldName]) {
    return reverse ? 1 : -1;
  }
  if (a[fieldName] > b[fieldName]) {
    return reverse ? -1 : 1;
  }
  return 0;
}

export function sortAlphabetically(item1: Object, item2: Object) {
  const name1: string = getEntityPresentation(item1).toLowerCase() ;
  const name2: string = getEntityPresentation(item2).toLowerCase();

  if (name1 > name2) {
    return 1;
  }
  if (name1 < name2) {
    return -1;
  }
  return 0;
}

export function sortByTimestampReverse(a: Object & { timestamp: number }, b: Object & { timestamp: number }) {
  return doSortBy(a, b, 'timestamp', true);
}

export function sortByUpdatedReverse(a: Object & { updated: number }, b: Object & { updated: number }) {
  return doSortBy(a, b, 'updated', true);
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

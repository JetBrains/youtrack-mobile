import {getEntityPresentation} from '../issue-formatter/issue-formatter';

function doSortBy(
  a: Record<string, any> & {
    timestamp: number;
  },
  b: Record<string, any> & {
    timestamp: number;
  },
  fieldName: string,
  reverse: boolean = false,
) {
  if (a[fieldName] < b[fieldName]) {
    return reverse ? 1 : -1;
  }

  if (a[fieldName] > b[fieldName]) {
    return reverse ? -1 : 1;
  }

  return 0;
}

export function sortAlphabetically(
  item1: Record<string, any>,
  item2: Record<string, any>,
): number {
  const name1: string = getEntityPresentation(item1).toLowerCase();
  const name2: string = getEntityPresentation(item2).toLowerCase();

  if (name1 > name2) {
    return 1;
  }

  if (name1 < name2) {
    return -1;
  }

  return 0;
}
export function sortByTimestampReverse(
  a: Record<string, any> & {
    timestamp: number;
  },
  b: Record<string, any> & {
    timestamp: number;
  },
): number {
  return doSortBy(a, b, 'timestamp', true);
}
export function sortByTimestamp(
  a: Record<string, any> & {
    timestamp: number;
  },
  b: Record<string, any> & {
    timestamp: number;
  },
): number {
  return doSortBy(a, b, 'timestamp');
}
export function sortByUpdatedReverse(
  a: Record<string, any> & {
    updated: number;
  },
  b: Record<string, any> & {
    updated: number;
  },
): number {
  return doSortBy(a, b, 'updated', true);
}
export function sortByOrdinal(
  a: {
    ordinal: number;
  },
  b: {
    ordinal: number;
  },
): number {
  return a.ordinal - b.ordinal;
}
export function getGroupedByFieldNameAlphabetically(
  list: Array<Record<string, any>>,
  fieldName: string,
): {
  favorites: Array<Record<string, any>>;
  others: Array<Record<string, any>>;
} {
  return (list || []).sort(sortAlphabetically).reduce(
    (list, item) => {
      if (item[fieldName]) {
        list.favorites.push(item);
      } else {
        list.others.push(item);
      }

      return list;
    },
    {
      favorites: [],
      others: [],
    },
  );
}
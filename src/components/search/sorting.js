/* @flow */

export function sortByName(item1: {name: string}, item2: {name: string}) {
  const name1 = item1.name.toLowerCase();
  const name2 = item2.name.toLowerCase();
  if (name1 > name2) {
    return 1;
  }
  if (name1 < name2) {
    return -1;
  }
  return 0;
}

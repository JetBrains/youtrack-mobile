/* @flow */

export function sortByName(item1: {name: string}, item2: {name: string}) {
  if (item1.name > item2.name) {
    return 1;
  }
  if (item1.name < item2.name) {
    return -1;
  }
  return 0;
}

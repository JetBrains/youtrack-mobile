import {hasType} from 'components/api/api__resource-types';
import {sortAlphabetically} from 'components/search/sorting';

import {Folder} from 'types/User';

export interface GroupedFolders {
  projects: Folder[];
  searches: Folder[];
  tags: Folder[];
}

const sortFolders = (folders: Folder[], q?: string): Folder[] => {
  const map: { [id: string]: boolean } = {};
  return (q ? folders.filter(
    (it: Folder) => {
      if (map[it.id]) {
        return false;
      }
      map[it.id] = true;
      const pattern: string = q.toLowerCase();
      return [it.name.toLowerCase(), it?.shortName?.toLowerCase?.() || ''].some(s => s.indexOf(pattern) !== -1);
    }
  ) : folders).sort(sortAlphabetically);
};

const getGroupedFolders = (folders: Folder[]) => folders.reduce(
  (
    akk: GroupedFolders,
    it: Folder
  ) => {
    if (hasType.project(it)) {
      akk.projects.push(it);
    } else if (hasType.savedSearch(it)) {
      akk.searches.push(it);
    } else {
      akk.tags.push(it);
    }
    return akk;
  },
  {
    projects: [],
    searches: [],
    tags: [],
  },
);


export {
  getGroupedFolders,
  sortFolders,
};

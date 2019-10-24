/* @flow */

import type {Sprint} from '../../flow/Agile';

type GroupedSprints = {
  active: Array<Sprint>,
  archived: Array<Sprint>
}

function sprintComparator(sprint1: Sprint, sprint2: Sprint) {
  const first = asDate(sprint1);
  const second = asDate(sprint2);

  if (first === second) {
    return sprint2.name.localeCompare(sprint1.name);
  }
  return second - first;

  function asDate(sprint) {
    if (!sprint.finish && !sprint.start) {
      return 0;
    }
    return sprint.finish ? sprint.finish : Number.MAX_SAFE_INTEGER;
  }
}


export function getGroupedSprints(sprints: Array<Sprint>): Array<Sprint> {
  const groupedSprints: GroupedSprints = sprints.reduce(
    (group, sprint) => {
      group[sprint.archived ? 'archived' : 'active'].push(sprint);
      return group;
    },
    {
      active: [],
      archived: []
    }
  );

  return [].concat(
    groupedSprints.active.sort(sprintComparator)
  ).concat(
    groupedSprints.archived.sort(sprintComparator)
  );
}

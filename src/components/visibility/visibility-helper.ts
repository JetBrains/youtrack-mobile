import IssueVisibility from 'components/visibility/issue-visibility';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {sortAlphabetically} from 'components/search/sorting';

import {SLItem} from 'components/select/select-sectioned';
import {User} from 'types/User';
import {Visibility, VisibilityGroups, VisibilityItem} from 'types/Visibility';

export const getGroupedData = (opts: VisibilityGroups) => {
  const sort = (data: VisibilityItem[] = []) =>
    data.filter((group: VisibilityItem & {allUsersGroup?: boolean}) => !group.allUsersGroup).sort(sortAlphabetically);

  const recommendedGroups = sort(opts.recommendedGroups);

  const groupsWithoutRecommended =
    opts.groupsWithoutRecommended != null
      ? opts.groupsWithoutRecommended
      : opts.permittedGroups || opts.visibilityGroups;

  const grouped = {
    recommended: {
      title: i18n('Recommended groups and teams'),
      data: recommendedGroups,
    },
    groups: {
      title: recommendedGroups.length > 0 ? i18n('Other groups and teams') : i18n('Groups and teams'),
      data: sort(groupsWithoutRecommended),
    },
    users: {
      title: i18n('Users'),
      data: sort(opts.permittedUsers || opts.visibilityUsers),
    },
  };

  return Object.keys(grouped).reduce(
    (akk: SLItem[], key: string) => [
      ...akk,
      ...(grouped[key as keyof typeof grouped].data.length > 0 ? [grouped[key as keyof typeof grouped]] : []),
    ],
    []
  );
};

export const getVisibilityPresentation = (
  visibility: Visibility | null,
  defaultPresentation: string,
  full?: boolean
): string => {
  if (visibility?.inherited) {
    return i18n('Inherited restrictions');
  }
  if (IssueVisibility.isSecured(visibility)) {
    const author: User | undefined = visibility?.implicitPermittedUsers?.[0];
    const p = full
      ? IssueVisibility.getVisibilityPresentation(visibility)
      : IssueVisibility.getVisibilityShortPresentation(visibility);
    return [getEntityPresentation(author), p].filter(Boolean).join(', ');
  }
  return defaultPresentation;
};

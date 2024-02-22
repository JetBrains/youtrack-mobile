import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import {ResourceTypes} from '../api/api__resource-types';

import type {UserGroup} from 'types/UserGroup';
import type {User} from 'types/User';
import type {Visibility, VisibilityItem} from 'types/Visibility';

export default class IssueVisibility {
  static visibility(visibility: Visibility | null = null, isLimited: boolean = false): Visibility {
    const isSecured: boolean =
      isLimited || !!visibility?.permittedGroups?.length || !!visibility?.permittedUsers?.length;
    return {
      permittedUsers: [],
      permittedGroups: [],
      ...visibility,
      $type: isSecured ? ResourceTypes.VISIBILITY_LIMITED : ResourceTypes.VISIBILITY_UNLIMITED,
    };
  }

  static createLimitedVisibility(
    permittedGroups: (UserGroup | Partial<UserGroup>)[] = [],
    permittedUsers: (User | Partial<User>)[] = []
  ): Visibility {
    return {
      permittedUsers,
      permittedGroups,
      $type: ResourceTypes.VISIBILITY_LIMITED,
    } as Visibility;
  }

  static hasUsersOrGroups(visibility: Visibility): boolean {
    if (!visibility) {
      return false;
    }

    const v = this.visibility(visibility);

    return !!(v?.permittedUsers?.length || v?.permittedGroups?.length);
  }

  static isSecured(visibility?: Visibility | null): boolean {
    if (!visibility) {
      return false;
    }

    return this.hasUsersOrGroups(visibility);
  }

  static getVisibilityAsArray(visibility: Visibility | null): VisibilityItem[] {
    return [...(visibility?.permittedGroups || []), ...(visibility?.permittedUsers || [])];
  }

  static getVisibilityPresentation(visibility: Visibility | null): string {
    return IssueVisibility.getVisibilityAsArray(visibility)
      .map(it => getEntityPresentation(it))
      .join(', ');
  }

  static getVisibilityShortPresentation(visibility: Visibility | null): string {
    const visibilityItems = IssueVisibility.getVisibilityAsArray(visibility);
    const firstItemPresentation: string = getEntityPresentation(visibilityItems[0]);
    return `${firstItemPresentation}${visibilityItems.length > 1 ? ` +${visibilityItems.length - 1}` : ''}`;
  }
}

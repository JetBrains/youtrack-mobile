import type {User} from './User';
import type {UserGroup} from './UserGroup';

export type Visibility = {
  $type: string;
  permittedUsers: User[];
  implicitPermittedUsers?: User[];
  permittedGroups: UserGroup[];
  inherited?: Visibility | null;
} | null;

export type VisibilityItem = User | UserGroup;

export interface VisibilityGroups {
  groupsWithoutRecommended?: UserGroup[];
  recommendedGroups?: UserGroup[];
  visibilityGroups: UserGroup[];
  visibilityUsers: User[];
}

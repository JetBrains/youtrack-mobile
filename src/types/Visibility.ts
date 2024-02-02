import type {User} from './User';
import type {UserGroup} from './UserGroup';

export type VisibilityItem = User | UserGroup;

export type Visibility = {
  $type?: string;
  permittedUsers?: User[];
  implicitPermittedUsers?: User[];
  permittedGroups?: UserGroup[];
  inherited?: Visibility | null;
} | null;

export interface VisibilityGroups {
  groupsWithoutRecommended?: UserGroup[];
  recommendedGroups?: UserGroup[];
  visibilityGroups: UserGroup[];
  visibilityUsers: User[];
}

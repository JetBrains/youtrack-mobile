import type {User} from './User';
import type {UserGroup} from './UserGroup';

export type VisibilityItem = User | UserGroup;

export interface Visibility {
  $type?: string;
  implicitPermittedUsers?: User[];
  inherited?: Visibility | null;
  permittedGroups?: UserGroup[];
  permittedUsers?: User[];
}

export interface VisibilityGroups extends Visibility {
  groupsWithoutRecommended?: UserGroup[];
  recommendedGroups?: UserGroup[];
  visibilityGroups?: UserGroup[];
  visibilityUsers?: User[];
}

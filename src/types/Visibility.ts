import type {User} from './User';
import type {UserGroup} from './UserGroup';
export type Visibility = {
  $type: string;
  permittedUsers: User[];
  implicitPermittedUsers: User[];
  permittedGroups: UserGroup[];
  inherited?: Visibility | null;
} | null;

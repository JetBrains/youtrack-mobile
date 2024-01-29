import IssuePermissions from './issue-permissions';
import PermissionsStore from '../permissions-store/permissions-store';
import {User} from 'types/User';

const currentUser = {
  id: '',
  ringId: '',
} as User;

export const issuePermissionsNull: IssuePermissions = new IssuePermissions(
  new PermissionsStore([]),
  currentUser,
);

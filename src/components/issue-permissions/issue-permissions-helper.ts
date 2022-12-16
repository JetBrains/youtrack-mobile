/* @flow */

import IssuePermissions from './issue-permissions';
import PermissionsStore from '../permissions-store/permissions-store';

export const issuePermissionsNull: IssuePermissions = new IssuePermissions(
  new PermissionsStore([]),
  {
    id: null,
    ringId: null,
  }
);

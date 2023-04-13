import {useSelector} from 'react-redux';

import {AppState} from 'reducers';

import IssuePermissions from 'components/issue-permissions/issue-permissions';

const usePermissions = (): IssuePermissions => {
  return useSelector((appState: AppState) => appState.app.issuePermissions);
};


export {
  usePermissions,
};


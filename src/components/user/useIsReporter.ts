import {useSelector} from 'react-redux';

import type {AppState} from 'reducers';

const useIsReporter = () => useSelector((state: AppState) => !!state.app.user?.profiles?.helpdesk?.isReporter);

export default useIsReporter;

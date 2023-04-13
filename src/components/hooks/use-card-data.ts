import {useSelector} from 'react-redux';

import {AppState} from 'reducers';

import {DraftCommentData} from 'types/CustomFields';

const useCardData = (): DraftCommentData => {
  return useSelector((appState: AppState) => appState.app.draftCommentData);
};


export {
  useCardData,
};


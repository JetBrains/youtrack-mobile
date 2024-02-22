import type {YouTrackWiki} from 'types/Wiki';
import {getApi} from 'components/api/api__instance';

export const getYoutrackWikiProps = (): YouTrackWiki => {
  let imageHeaders = null;
  let backendUrl = '';

  try {
    imageHeaders = getApi().auth.getAuthorizationHeaders();
  } catch (e) {}

  try {
    backendUrl = getApi().config.backendUrl;
  } catch (e) {}

  return {
    backendUrl,
    imageHeaders,
  };
};

/*@flow */

import getEventTitle from '../activity/activity__history-title';

import type {Activity} from '../../flow/Activity';

const firstActivityChange = (activity: ?Activity): Object | null => {
  if (!activity || !activity.added) {
    return null;
  }
  if (Array.isArray(activity.added)) {
    return activity.added[0];
  }
  return activity.added;
};

const getActivityEventTitle = (activity: Activity): string => {
  return `${getEventTitle(activity) || ''} `;
};

const getDurationPresentation = (duration: {presentation: string}): string => duration?.presentation || '';


export {
  firstActivityChange,
  getActivityEventTitle,
  getDurationPresentation,
};

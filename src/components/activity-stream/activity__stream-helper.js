/*@flow */

import getEventTitle from '../activity/activity__history-title';

import type {Activity} from '../../flow/Activity';

const firstActivityChange = (activity: Activity): any => {
  if (!activity.added) {
    return null;
  }
  if (Array.isArray(activity.added)) {
    return activity.added[0];
  }
  return activity.added;
};

const getActivityEventTitle = (activity: Activity) => {
  return `${getEventTitle(activity) || ''} `;
};


export {
  firstActivityChange,
  getActivityEventTitle
};

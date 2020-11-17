/* @flow */

import {getDeviceLogs, sendReport} from '../../components/error/error-reporter';

export type FeedbackType = { title: string, marker: string };
export type FeedbackLogs = { title: string, value: boolean };
export type FeedbackData = {
  summary: ?string,
  email: ?string,
  type: FeedbackType,
  logs: FeedbackLogs,
  description: ?string,
}


const feedbackTypeMarker: string = '[InAppFeedback]';
export const feedbackTypeOptions: Array<FeedbackType> = [
  {title: 'Problem', marker: feedbackTypeMarker},
  {title: 'Feature request', marker: feedbackTypeMarker},
  {title: 'Other', marker: feedbackTypeMarker}
];
export const feedbackLogsOptions: Array<FeedbackLogs> = [
  {title: 'Do no send logs', value: false},
  {title: 'Send logs', value: true}
];

export const sendFeedback = async (feedbackData: FeedbackData) => {
  let description: string = `##### ${feedbackData.type.marker}::${feedbackData.type.title}\n##### email: ${feedbackData?.email || ''}\n\n${feedbackData?.description || ''}`;
  if (feedbackData.logs.value) {
    const deviceLogs = await getDeviceLogs();
    description = `${description}\n\n\`\`\`${deviceLogs}\`\`\``;
  }
  return sendReport(feedbackData?.summary || '', description);
};

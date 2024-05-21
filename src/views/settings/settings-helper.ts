import {
  getAppAndDeviceData,
  getDeviceLogs,
  sendReport,
} from 'components/error/error-reporter';
import {i18n} from 'components/i18n/i18n';

export interface FeedbackType {
  title: string;
  marker: string;
}

export interface FeedbackLogs {
  title: string;
  value: boolean;
}

export interface FeedbackData {
  summary: string;
  email: string;
  type: FeedbackType;
  logs: FeedbackLogs;
  description?: string;
}

const feedbackTypeMarker: string = '[InAppFeedback]';

export const feedbackTypeOptions: FeedbackType[] = [
  {
    title: i18n('Problem'),
    marker: feedbackTypeMarker,
  },
  {
    title: i18n('Feature request'),
    marker: feedbackTypeMarker,
  },
  {
    title: i18n('Other'),
    marker: feedbackTypeMarker,
  },
];
export const feedbackLogsOptions: FeedbackLogs[] = [
  {
    title: i18n(`Don't send logs`),
    value: false,
  },
  {
    title: i18n('Send logs'),
    value: true,
  },
];
export const sendFeedback = async (
  feedbackData: FeedbackData,
): Promise<string> => {
  let description: string = `
  ##### ${feedbackData.type.marker}::${feedbackData.type.title}
  ##### email: ${feedbackData?.email || ''}
  \n\n
  ${getAppAndDeviceData()}
  \n\n
  ${feedbackData?.description || ''}`;

  if (feedbackData.logs.value) {
    const deviceLogs = await getDeviceLogs();
    description = `${description}\n\n\`\`\`${deviceLogs}\`\`\``;
  }

  return sendReport(feedbackData?.summary || '', description);
};

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

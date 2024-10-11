export interface CustomError {
  json: () => Promise<any>;
  status: number;
  error?: string;
  error_message: string;
  error_description: string;
  error_developer_message?: string;
  error_children: Array<{
    error: string;
  }>;
  body: string;
  bodyText: string;
  _bodyText: string;
  isIncompatibleYouTrackError: boolean;
  localizedDescription?: string;
}

export type ErrorMessageData = {
  title: string;
  description?: string | null | undefined;
  icon?: Record<string, any>;
  iconSize?: number;
};

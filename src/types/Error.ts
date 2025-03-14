export interface CustomError {
  status: number;
  error?: string;
  error_message?: string;
  error_description?: string;
  error_developer_message?: string;
  error_field?: string;
  error_issue_id?: string;
  error_issue_is_draft?: string;
  error_original_command?: string;
  error_project_custom_field_id?: string;
  error_rule_name?: string;
  error_type?: string;
  error_workflow_type?: string;
  error_children?: Array<{error: string}>;
  body?: Record<string, string | number>;
  bodyText?: string;
  _bodyText?: string;
  localizedDescription?: string;
  message?: string;
}

export type ErrorMessageData = {
  title: string;
  description?: string | null | undefined;
  icon?: Record<string, any>;
  iconSize?: number;
};

interface ErrorAdditionalData {
  error?: string;
  error_children?: Array<{error_description: string; error_developer_message?: string}>;
  error_description?: string;
  error_developer_message?: string;
  error_field?: string;
  error_issue_id?: string;
  error_issue_is_draft?: string;
  error_message?: string;
  error_original_command?: string;
  error_project_custom_field_id?: string
  error_rule_name?: string;
  error_type?: string;
  error_workflow_type?: 'require' | string;
}

export interface AnyError extends ErrorAdditionalData {
  status?: number;
  message?: string;
  data?: ErrorAdditionalData;
  body: string;
  bodyText: string;
  json?: Response['json'];
}

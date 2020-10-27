export type AuthParams = {
  access_token: string, // for API data fetching
  error_code?: string,
  refresh_token: string, // for fetching access_token
  token_type: string
};

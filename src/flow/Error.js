export type CustomError = Error & {
  json: Object,
  status: string,
  error_message: string,
  error_description: string,
  error_children: Array<{error: string}>,
  body: string,
  bodyText: string,
  _bodyText: string,
  isIncompatibleYouTrackError: boolean
};

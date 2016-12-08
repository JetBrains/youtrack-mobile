export type ServersideSuggestion = {
  o: string,
  d: string,
  hd: string,
  pre: string,
  suf: string,
  ms: number,
  me: number,
  cp: number,
  cs: number,
  ce: number
};

export type TransformedSuggestion = {
  prefix: string,
  option: string,
  suffix: string,
  description: string,
  matchingStart: number,
  matchingEnd: number,
  caret: number,
  completionStart: number,
  completionEnd: number
}

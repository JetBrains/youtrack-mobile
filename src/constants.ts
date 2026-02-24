export const FEATURE_FLAG = {
  privateAgentCommentByDefault: 'jetbrains.youtrack.feature.privateAgentCommentByDefault',
} as const;

export type FEATURE_FLAG = (typeof FEATURE_FLAG)[keyof typeof FEATURE_FLAG];

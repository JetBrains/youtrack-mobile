import React from 'react';
import type {IssueContextData} from 'flow/Issue';
export const IssueContext: React.Context<IssueContextData> = React.createContext<IssueContextData>(
  null,
);
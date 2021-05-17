/* @flow */

import React from 'react';

import type {IssueContextData} from '../../flow/Issue';

export const IssueContext = React.createContext<IssueContextData>(null);

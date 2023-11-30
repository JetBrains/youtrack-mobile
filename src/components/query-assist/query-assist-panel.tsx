import React from 'react';
import {View} from 'react-native';

import QueryAssist, {QueryAssistModal} from './query-assist';
import {isSplitView} from 'components/responsive/responsive-helper';

import type {TransformedSuggestion} from 'types/Issue';
import type {ViewStyleProp} from 'types/Internal';

interface Props {
  queryAssistSuggestions: TransformedSuggestion[];
  query: string;
  suggestIssuesQuery: (query: string, caret: number) => any;
  onQueryUpdate: (query: string) => any;
  onClose: (query: string) => any;
  issuesCount?: number | null | undefined;
  style?: ViewStyleProp;
  clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
}


const QueryAssistPanel = (props: Props): React.JSX.Element => {
  const loadSuggests = (q: string, caret: number) => props.suggestIssuesQuery(q, caret);
  const applyQuery = (q: string) => props.onQueryUpdate(q);
  const Component = isSplitView() ? QueryAssistModal : QueryAssist;

  return (
    <View style={props.style}>
      <Component
        suggestions={props.queryAssistSuggestions}
        currentQuery={props.query}
        onChange={loadSuggests}
        onApplyQuery={applyQuery}
        onClose={props.onClose}
        clearButtonMode={props.clearButtonMode}
      />
    </View>
  );
};


export default React.memo(QueryAssistPanel);

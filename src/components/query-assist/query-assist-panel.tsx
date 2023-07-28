import React from 'react';
import {View} from 'react-native';

import QueryAssist, {QueryAssistModal} from './query-assist';
import {isSplitView} from 'components/responsive/responsive-helper';

import type {TransformedSuggestion} from 'types/Issue';
import type {ViewStyleProp} from 'types/Internal';

interface SearchPanelProps {
  queryAssistSuggestions: TransformedSuggestion[];
  query: string;
  suggestIssuesQuery: (query: string, caret: number) => any;
  onQueryUpdate: (query: string) => any;
  onClose: (query: string) => any;
  issuesCount?: number | null | undefined;
  style?: ViewStyleProp;
  clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
}


export default class QueryAssistPanel extends React.PureComponent<SearchPanelProps, void> {
  loadSuggests: (query: string, caret: number) => any = (
    query: string,
    caret: number,
  ) => {
    return this.props.suggestIssuesQuery(query, caret);
  };
  applyQuery: (query: string) => any = (query: string) => {
    return this.props.onQueryUpdate(query);
  };

  render() {
    const {queryAssistSuggestions, query, style, clearButtonMode} = this.props;
    const Component: any = isSplitView() ? QueryAssistModal : QueryAssist;
    return (
      <View style={style}>
        <Component
          suggestions={queryAssistSuggestions}
          currentQuery={query}
          onChange={this.loadSuggests}
          onApplyQuery={this.applyQuery}
          onClose={this.props.onClose}
          clearButtonMode={clearButtonMode}
        />
      </View>
    );
  }
}

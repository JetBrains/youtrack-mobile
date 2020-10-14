/* @flow */

import {View} from 'react-native';
import React, {PureComponent} from 'react';

import QueryAssist from './query-assist';

import styles from '../../views/issue-list/issue-list.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {TransformedSuggestion} from '../../flow/Issue';

type SearchPanelProps = {
  queryAssistSuggestions: Array<TransformedSuggestion>,
  query: string,
  suggestIssuesQuery: (query: string, caret: number) => any,
  onQueryUpdate: (query: string) => any,
  onClose: () => any,

  issuesCount?: ?number,
  style?: ViewStyleProp,

  clearButtonMode?: ('never' | 'while-editing' | 'unless-editing' | 'always')
};

export default class QueryAssistPanel extends PureComponent<SearchPanelProps, void> {
  static defaultProps = {
    onClose: () => null
  }

  node: Object;

  setNativeProps(...args: Array<Object>) {
    return this.node && this.node.setNativeProps(...args);
  }

  loadSuggests = (query: string, caret: number) => {
    return this.props.suggestIssuesQuery(query, caret);
  };

  applyQuery = (query: string) => {
    return this.props.onQueryUpdate(query);
  }

  render() {
    const {queryAssistSuggestions, query, style, clearButtonMode} = this.props;

    return (
      <View
        style={[styles.searchPanel, style]}
        ref={node => this.node = node}
      >
        <QueryAssist
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

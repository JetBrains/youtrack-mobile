/* @flow */
import {View, Text} from 'react-native';
import React, {PureComponent} from 'react';

import styles from './issue-list.styles';
import QueryAssist from '../../components/query-assist/query-assist';
import {View as AnimatedView} from 'react-native-animatable';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {TransformedSuggestion} from '../../flow/Issue';

type SearchPanelProps = {
  queryAssistSuggestions: Array<TransformedSuggestion>,
  query: string,
  suggestIssuesQuery: (query: string, caret: number) => any,
  onQueryUpdate: (query: string) => any,

  issuesCount?: ?number,
  style?: ViewStyleProp
};

export default class SearchPanel extends PureComponent<SearchPanelProps, void> {
  node: Object;

  setNativeProps(...args: Array<Object>) {
    return this.node && this.node.setNativeProps(...args);
  }

  renderIssuesCount() {
    const {issuesCount} = this.props;
    const text = (
      !issuesCount
        ? ' '
        : `Matches ${issuesCount} issue${issuesCount >= 0 ? 's' : ''}`
    );

    return (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn">
        <Text style={styles.issuesCount}>
          {text}
        </Text>
      </AnimatedView>
    );
  }

  render() {
    const {queryAssistSuggestions, query, suggestIssuesQuery, onQueryUpdate, style} = this.props;

    return (
      <View
        style={[styles.searchPanel, style]}
        ref={node => this.node = node}
      >
        <QueryAssist
          suggestions={queryAssistSuggestions}
          currentQuery={query}
          onChange={suggestIssuesQuery}
          onSetQuery={onQueryUpdate}/>

        {this.renderIssuesCount()}
      </View>
    );
  }
}

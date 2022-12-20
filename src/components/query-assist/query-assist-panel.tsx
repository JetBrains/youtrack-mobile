import React, {PureComponent} from 'react';
import {View} from 'react-native';
import QueryAssist, {QueryAssistModal} from './query-assist';
import {isSplitView} from '../responsive/responsive-helper';
import styles from './query-assist.styles';
import type {TransformedSuggestion} from '../../flow/Issue';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
type SearchPanelProps = {
  queryAssistSuggestions: Array<TransformedSuggestion>;
  query: string;
  suggestIssuesQuery: (query: string, caret: number) => any;
  onQueryUpdate: (query: string) => any;
  onClose: (query: string) => any;
  issuesCount?: number | null | undefined;
  style?: ViewStyleProp;
  clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
};
export default class QueryAssistPanel extends PureComponent<
  SearchPanelProps,
  void
> {
  static defaultProps: {
    onClose: () => null;
  } = {
    onClose: () => null,
  };
  node: Record<string, any>;

  setNativeProps(...args: Array<Record<string, any>>): any {
    return this.node && this.node.setNativeProps(...args);
  }

  loadSuggests: (query: string, caret: number) => any = (
    query: string,
    caret: number,
  ) => {
    return this.props.suggestIssuesQuery(query, caret);
  };
  applyQuery: (query: string) => any = (query: string) => {
    return this.props.onQueryUpdate(query);
  };

  render(): React.ReactNode {
    const {queryAssistSuggestions, query, style, clearButtonMode} = this.props;
    const Component: any = isSplitView() ? QueryAssistModal : QueryAssist;
    return (
      <View
        style={[styles.searchPanel, style]}
        ref={node => (this.node = node)}
      >
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

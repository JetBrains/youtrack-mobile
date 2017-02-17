/* @flow */
import {ListView, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ListViewDataSource from 'react-native/Libraries/CustomComponents/ListView/ListViewDataSource';
import React from 'react';
import {UNIT, COLOR_FONT_ON_BLACK} from '../variables/variables';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import type {ServersideSuggestion, TransformedSuggestion} from './query-assist__suggestion';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

type State = {
  dataSource: ListViewDataSource
};

type Props = {
  style?: any,
  query: string,
  caret: number,
  getSuggestions: (query: string, caret: number) => Promise<Array<ServersideSuggestion>>,
  onApplySuggestion: (newQuery: string) => any
};

export default class QueryAssistSuggestionsList extends React.Component {
  props: Props;
  state: State;
  storedPromise: ?Promise<Array<TransformedSuggestion>>;
  isUnmounted: boolean;

  constructor() {
    super();
    this.state = {dataSource: ds.cloneWithRows([])};

    this.storedPromise = null;
  }

  loadSuggestions(query: string, caret: number) {
    const promise = this.props.getSuggestions(query, caret)
      .then((suggestions: Array<ServersideSuggestion>) => {
        if (promise !== this.storedPromise || this.isUnmounted) {
          return;
        }

        const transformed = transformSuggestions(suggestions);
        this.setState({dataSource: ds.cloneWithRows(transformed)});
      });

    this.storedPromise = promise;
    return promise;
  }

  componentDidMount() {
    this.loadSuggestions(this.props.query, this.props.caret);
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.query !== newProps.query || this.props.caret !== newProps.caret) {
      this.loadSuggestions(newProps.query, newProps.caret);
    }
  }

  onApplySuggestion(suggestion: TransformedSuggestion) {
    const suggestionText = `${suggestion.prefix}${suggestion.option}${suggestion.suffix}`;
    const oldQuery = this.props.query || '';
    const newQuery = oldQuery.substring(0, suggestion.completionStart) + suggestionText + oldQuery.substring(suggestion.completionEnd);
    return this.props.onApplySuggestion(newQuery);
  }

  _renderRow(suggestion) {
    return (
      <TouchableOpacity style={styles.searchRow} onPress={() => this.onApplySuggestion(suggestion)}>
        <Text style={styles.searchText}>{suggestion.option}</Text>
      </TouchableOpacity>);
  }

  render() {
    return (
      <ListView
        style={this.props.style}
        dataSource={this.state.dataSource}
        enableEmptySections={true}
        renderRow={(suggestion) => this._renderRow(suggestion)}
        renderScrollComponent={props => <InvertibleScrollView {...props} inverted/>}
        keyboardShouldPersistTaps="handled"/>
    );
  }
}

const styles = StyleSheet.create({
  searchRow: {
    flex: 1,
    padding: UNIT,
    paddingBottom: UNIT * 2,
    paddingTop: UNIT * 2
  },
  searchText: {
    fontSize: 24,
    fontWeight: '200',
    color: COLOR_FONT_ON_BLACK,
    textAlign: 'center'
  }
});

function transformSuggestions(suggestions: Array<ServersideSuggestion>): Array<TransformedSuggestion> {
  return suggestions.map((suggestion) => {
    return {
      prefix: suggestion.pre || '',
      option: suggestion.o || '',
      suffix: suggestion.suf || '',
      description: suggestion.hd || suggestion.d || '',
      matchingStart: suggestion.ms,
      matchingEnd: suggestion.me,
      caret: suggestion.cp,
      completionStart: suggestion.cs,
      completionEnd: suggestion.ce
    };
  });
}

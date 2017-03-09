/* @flow */
import {ListView, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ListViewDataSource from 'react-native/Libraries/CustomComponents/ListView/ListViewDataSource';
import React from 'react';
import {UNIT, COLOR_FONT_ON_BLACK} from '../variables/variables';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import type {TransformedSuggestion} from '../../flow/Issue';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

type State = {
  dataSource: ListViewDataSource
};

type Props = {
  style?: any,
  suggestions: Array<Object>,
  onApplySuggestion: (suggestion: TransformedSuggestion) => any
};

export default class QueryAssistSuggestionsList extends React.Component {
  props: Props;
  state: State;
  isUnmounted: boolean;

  constructor(props: Props) {
    super(props);
    this.state = {dataSource: ds.cloneWithRows(props.suggestions || [])};
  }

  componentWillReceiveProps(newProps: Props) {
    if (newProps.suggestions !== this.props.suggestions) {
      this.setState({dataSource: ds.cloneWithRows(newProps.suggestions)});
    }
  }

  _renderRow(suggestion) {
    return (
      <TouchableOpacity style={styles.searchRow} onPress={() => this.props.onApplySuggestion(suggestion)}>
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

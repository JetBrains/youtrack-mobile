/* @flow */
import {View, ListView, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ListViewDataSource from 'react-native/Libraries/CustomComponents/ListView/ListViewDataSource';
import React from 'react';
import {UNIT, COLOR_FONT_ON_BLACK} from '../variables/variables';
import type {TransformedSuggestion, SavedQuery} from '../../flow/Issue';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

type State = {
  dataSource: ListViewDataSource
};

type Props = {
  style?: any,
  suggestions: Array<TransformedSuggestion | SavedQuery>,
  onApplySuggestion: (suggestion: TransformedSuggestion) => any,
  onApplySavedQuery: (savedQuery: SavedQuery) => any
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

  _renderRow(suggestion: TransformedSuggestion | SavedQuery) {
    if (suggestion.caret) {
      // marker that this is TransformedSuggestion
      return (
        <TouchableOpacity
          style={styles.searchRow}
          onPress={() => this.props.onApplySuggestion(suggestion)}
        >
          <Text style={styles.searchText}>{suggestion.option}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.searchRow}
          onPress={() => this.props.onApplySavedQuery(suggestion)}
        >
          <Text style={styles.searchText}>{suggestion.name}</Text>
        </TouchableOpacity>
      );
    }
  }

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <ListView
          style={styles.list}
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={suggestion => this._renderRow(suggestion)}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  list: {
    overflow: 'visible'
  },
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

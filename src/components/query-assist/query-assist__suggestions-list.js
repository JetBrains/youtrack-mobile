/* @flow */
import {View, ListView, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React, {Component} from 'react';
import {UNIT, COLOR_FONT_ON_BLACK, COLOR_FONT_GRAY} from '../variables/variables';
import type {TransformedSuggestion, SavedQuery} from '../../flow/Issue';

const SAVED_SEARCHES = 'SAVED_SEARCHES';
const LAST_SEARCHES = 'LAST_SEARCHES';
const SECTION_SPACING = 24;

const ds = new ListView.DataSource({
  rowHasChanged: (r1, r2) => r1 !== r2,
  sectionHeaderHasChanged: (s1, s2) => s1 !== s2
});

type State = {
  dataSource: ListView.DataSource
};

type Props = {
  style?: any,
  suggestions: Array<TransformedSuggestion | SavedQuery>,
  onApplySuggestion: (suggestion: TransformedSuggestion) => any,
  onApplySavedQuery: (savedQuery: SavedQuery) => any
};

export default class QueryAssistSuggestionsList extends Component<Props, State> {
  isUnmounted: boolean;
  state: State = {
    dataSource: ds.cloneWithRows([])
  };

  constructor(props: Props) {
    super(props);
  }

  UNSAFE_componentWillReceiveProps(newProps: Props) {
    this._prepareDataSource(newProps.suggestions);
  }

  _prepareDataSource(suggestions) {
    const isSavedSearches = suggestions.some(s => s.name);

    if (isSavedSearches) {
      this.setState({dataSource: ds.cloneWithRowsAndSections(this._prepareSectionedMap(suggestions))});
    } else {
      this.setState({dataSource: ds.cloneWithRows(suggestions)});
    }
  }

  _prepareSectionedMap = (suggestions: Array<TransformedSuggestion>) => {
    const savedSearches = suggestions.filter(s => s.id);
    const lastSearches = suggestions.filter(s => !s.id);

    let res = {};
    res = savedSearches.length ? {[SAVED_SEARCHES]: savedSearches} : res;
    res = lastSearches.length ? {...res, [LAST_SEARCHES]: lastSearches} : res;

    return res;
  }

  _onApplySuggestion = (suggestion: TransformedSuggestion | SavedQuery) => {
    const isSuggestion = suggestion.caret;
    const {onApplySuggestion, onApplySavedQuery} = this.props;
    return isSuggestion ? onApplySuggestion(suggestion) : onApplySavedQuery(suggestion);
  }

  _renderRow = (suggestion: TransformedSuggestion | SavedQuery) => {
    const isSuggestion = suggestion.caret;

    return (
      <TouchableOpacity
        style={styles.searchRow}
        onPress={() => this._onApplySuggestion(suggestion)}
      >
        <Text style={styles.searchText}>{isSuggestion ? suggestion.option : suggestion.name}</Text>
      </TouchableOpacity>
    );
  }

  _renderSectionHeader = (sectionData: Array<Object>, category: string) => {
    const savedSearches = category === SAVED_SEARCHES;

    if (savedSearches || category === LAST_SEARCHES) {
      return (
        <View style={[styles.sectionHeader, !savedSearches && {paddingTop: SECTION_SPACING}]}>
          <Text style={styles.sectionHeaderText}>{savedSearches ? 'SAVED SEARCHES' : 'RECENT SEARCHES'}</Text>
        </View>
      );
    }
    return null;
  };


  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <ListView
          contentContainerStyle={styles.list}

          dataSource={this.state.dataSource}
          enableEmptySections
          stickySectionHeadersEnabled={false}
          renderRow={this._renderRow}
          renderSectionHeader={this._renderSectionHeader}
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
    overflow: 'visible',
    paddingTop: UNIT * 2
  },
  searchRow: {
    padding: UNIT * 2,
    paddingTop: UNIT * 1.5,
    paddingBottom: UNIT * 1.5,
    paddingRight: UNIT
  },
  sectionHeader: {
    padding: UNIT * 2,
    paddingBottom: UNIT
  },
  searchText: {
    fontSize: 24,
    fontWeight: '300',
    color: COLOR_FONT_ON_BLACK
  },
  sectionHeaderText: {
    fontWeight: '200',
    fontSize: 14,
    letterSpacing: 2,
    color: COLOR_FONT_GRAY
  }
});

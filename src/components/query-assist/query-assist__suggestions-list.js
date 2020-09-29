/* @flow */

import {View, ListView, Text, TouchableOpacity, Platform} from 'react-native';
import React, {Component} from 'react';

import EStyleSheet from 'react-native-extended-stylesheet';

import {UNIT} from '../variables/variables';
import {mainText, secondaryText} from '../common-styles/typography';

import type {TransformedSuggestion, SavedQuery} from '../../flow/Issue';

const SAVED_SEARCHES: string = 'SAVED_SEARCHES';
const LAST_SEARCHES: string = 'LAST_SEARCHES';
const SECTION_SPACING: number = 24;

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
  };

  _onApplySuggestion = (suggestion: TransformedSuggestion | SavedQuery) => {
    const isSuggestion = suggestion.caret;
    const {onApplySuggestion, onApplySavedQuery} = this.props;
    return isSuggestion ? onApplySuggestion(suggestion) : onApplySavedQuery(suggestion);
  };

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
  };

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

const styles = EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    ...Platform.select({
      ios: {
        marginBottom: UNIT * 5
      },
      android: {
        marginBottom: UNIT * 2
      }
    })
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
    ...mainText,
    fontWeight: '500',
    color: '$text'
  },
  sectionHeaderText: {
    ...secondaryText,
    color: '$icon'
  }
});

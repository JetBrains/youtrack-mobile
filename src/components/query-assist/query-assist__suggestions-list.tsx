import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  SectionList,
  ActivityIndicator,
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import Select from 'components/select/select';
import {mainText, secondaryText, UNIT} from 'components/common-styles';
import {uuid} from 'util/util';

import type {TransformedSuggestion} from 'types/Issue';
import {Folder} from 'types/User';
import {SectionListData} from 'react-native/Libraries/Lists/SectionList';

type Props = {
  style?: any;
  suggestions: SectionListData<Folder, Folder | TransformedSuggestion>[];
  onApplySuggestion: (suggestion: TransformedSuggestion) => any;
  onApplySavedQuery: (savedQuery?: TransformedSuggestion) => any;
};


export default class QueryAssistSuggestionsList extends Component<Props, void> {
  onApplySuggestion: (suggestion: TransformedSuggestion) => any = (
    suggestion: TransformedSuggestion,
  ) => {
    const isSuggestion = suggestion.caret;
    const {onApplySuggestion, onApplySavedQuery} = this.props;
    return isSuggestion
      ? onApplySuggestion(suggestion)
      : onApplySavedQuery(suggestion);
  };
  renderRow: (arg0: TransformedSuggestion)=> React.ReactNode = ({item}: TransformedSuggestion) => {
    const isSuggestion = item.caret;
    return (
      <TouchableOpacity
        style={styles.searchRow}
        onPress={() => this.onApplySuggestion(item)}
        testID="test:id/suggestRow"
        accessibilityLabel="suggestRow"
        accessible={false}
      >
        <Text style={styles.searchText}
          testID="test:id/suggestRowText"
        >
          {isSuggestion ? item.option : item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  renderSectionHeader = ({
    section,
  }: Record<string, any>) => {
    if (section.title) {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>
      );
    }
  };

  render(): React.ReactNode {
    const {suggestions, style} = this.props;
    return (
      <View style={[styles.container, style]}>
        <SectionList
          contentContainerStyle={styles.list}
          testID="test:id/selectItem"
          accessibilityLabel="selectItem"
          accessible={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          scrollEventThrottle={10}
          sections={suggestions}
          keyExtractor={uuid}
          renderItem={this.renderRow as any}
          renderSectionHeader={this.renderSectionHeader as any}
          ListEmptyComponent={<ActivityIndicator color={styles.link.color} />}
          ItemSeparatorComponent={Select.renderSeparator as any}
          getItemLayout={Select.getItemLayout}
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
        marginBottom: UNIT * 5,
      },
      android: {
        marginBottom: UNIT * 2,
      },
    }),
  },
  list: {
    overflow: 'visible',
    paddingTop: UNIT * 2,
  },
  searchRow: {
    padding: UNIT * 2,
    paddingRight: UNIT,
  },
  sectionHeader: {
    padding: UNIT * 2,
    paddingBottom: UNIT,
  },
  searchText: {...mainText, fontWeight: '500', color: '$text'},
  sectionHeaderText: {
    textTransform: 'uppercase',
    ...secondaryText,
    color: '$icon',
  },
  link: {
    color: '$link',
  },
});

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
import {uuid} from 'util/util';
import Select from '../select/select';
import {UNIT} from 'components/variables';
import {mainText, secondaryText} from 'components/common-styles/typography';
import type {TransformedSuggestion, SavedQuery} from 'types/Issue';
type Props = {
  style?: any;
  suggestions: Array<TransformedSuggestion | SavedQuery>;
  onApplySuggestion: (suggestion: TransformedSuggestion) => any;
  onApplySavedQuery: (savedQuery?: SavedQuery) => any;
};
export default class QueryAssistSuggestionsList extends Component<Props, void> {
  onApplySuggestion: (suggestion: TransformedSuggestion | SavedQuery) => any = (
    suggestion: TransformedSuggestion | SavedQuery,
  ) => {
    const isSuggestion = suggestion.caret;
    const {onApplySuggestion, onApplySavedQuery} = this.props;
    return isSuggestion
      ? onApplySuggestion(suggestion)
      : onApplySavedQuery(suggestion);
  };
  renderRow: (arg0: TransformedSuggestion | SavedQuery)=> React.ReactNode = ({
    item,
  }: TransformedSuggestion | SavedQuery) => {
    const isSuggestion = item.caret;
    return (
      <TouchableOpacity
        style={styles.searchRow}
        onPress={() => this.onApplySuggestion(item)}
        testID="test:id/suggestRow"
        accessibilityLabel="suggestRow"
        accessible={true}
      >
        <Text style={styles.searchText}>
          {isSuggestion ? item.option : item.name}
        </Text>
      </TouchableOpacity>
    );
  };
  renderSectionHeader: (arg0: any) => void | Node = ({
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
          accessible={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          scrollEventThrottle={10}
          sections={suggestions}
          keyExtractor={uuid}
          renderItem={this.renderRow}
          renderSectionHeader={this.renderSectionHeader}
          ListEmptyComponent={<ActivityIndicator color={styles.link.color} />}
          ItemSeparatorComponent={Select.renderSeparator}
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

import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  SectionList,
  ActivityIndicator,
} from 'react-native';

import autoBind from 'auto-bind';
import EStyleSheet from 'react-native-extended-stylesheet';

import Select from 'components/select/select';
import {mainText, secondaryText, UNIT} from 'components/common-styles';
import {uuid} from 'util/util';

import type {AssistSuggest, TransformedSuggestion, UsedQuery} from 'types/Issue';
import type {SectionListData} from 'react-native/Libraries/Lists/SectionList';
import type {ViewStyleProp} from 'types/Internal';

interface Props {
  style?: ViewStyleProp;
  suggestions: AssistSuggest[];
  onApplySuggestion: (suggestion: TransformedSuggestion) => void;
  onApplySavedQuery: (query: string) => void;
}

export default class QueryAssistSuggestionsList extends Component<Props, Readonly<{}>> {
  constructor(props: Props) {
    super(props);
    autoBind(this);
  }

  onApplySuggestion(suggestion: TransformedSuggestion | UsedQuery) {
    const {onApplySuggestion, onApplySavedQuery} = this.props;
    if ('caret' in suggestion && suggestion.caret >= 0) {
      onApplySuggestion(suggestion);
    }
    if ('query' in suggestion) {
      onApplySavedQuery(suggestion.query);
    }
  }

  renderRow({item}: {item: TransformedSuggestion | UsedQuery}) {
    let label = '';
    if ('caret' in item && item.caret >= 0) {
      label = item.option;
    } else if ('query' in item) {
      label = item.name;
    }

    return (
      <TouchableOpacity
        style={styles.searchRow}
        onPress={() => this.onApplySuggestion(item)}
        testID="test:id/suggestRow"
        accessibilityLabel="suggestRow"
        accessible={false}
      >
        <Text style={styles.searchText} testID="test:id/suggestRowText">
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  renderSectionHeader({section}: {section: SectionListData<AssistSuggest>}) {
    if (section.title) {
      return (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderText}>{section.title}</Text>
        </View>
      );
    }
  }

  render() {
    const {suggestions, style} = this.props;
    return (
      <View style={[styles.container, style]}>
        <SectionList
          contentContainerStyle={styles.list}
          testID="test:id/selectItem"
          accessibilityLabel="selectItem"
          accessible={false}
          keyboardShouldPersistTaps="always"
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

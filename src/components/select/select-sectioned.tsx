import type {Node} from 'react';
import React from 'react';
import {SectionList, Text, View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Select, {SelectModal} from './select';
import {mainText, secondaryText} from '../common-styles/typography';
import {UNIT} from '../variables/variables';
//@ts-expect-error
export class SelectSectionedModal extends SelectModal {
  constructor(props) {
    super(props);
  }
} //@ts-expect-error

export default class SelectSectioned extends Select {
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

  _onSearch(query: string = '') {
    const {getValue, getTitle} = this.props;
    const filteredItems = (this.state.items || []).reduce(
      (filteredSections, section) => {
        const selectedItems = section.data.filter(item => {
          const label = (getValue && getValue(item)) || getTitle(item) || '';
          return label.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
        filteredSections.push({
          title: section.title,
          data: selectedItems,
        });
        return filteredSections;
      },
      [],
    );
    this.setState({
      filteredItems,
    });
  }

  renderHeader() {
    return null;
  }

  renderItems(): any {
    const {header = () => null} = this.props;
    return (
      <SectionList
        contentContainerStyle={styles.list}
        testID="test:id/selectItem"
        accessibilityLabel="selectItem"
        accessible={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={10}
        sections={this.state.filteredItems}
        keyExtractor={this.getItemKey}
        renderItem={this.renderItem}
        renderSectionHeader={this.renderSectionHeader}
        ListEmptyComponent={null}
        ListHeaderComponent={header()}
        ItemSeparatorComponent={Select.renderSeparator}
        getItemLayout={Select.getItemLayout}
      />
    );
  }
}
const styles = EStyleSheet.create({
  sectionHeader: {
    padding: UNIT * 2,
    paddingBottom: UNIT,
    backgroundColor: '$background',
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
  list: {
    paddingBottom: UNIT * 4,
  },
});
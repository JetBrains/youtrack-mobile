/* @flow */

import type {Node} from 'React';
import React from 'react';
import {SectionList, Text, View} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import Select from './select';

import {mainText, secondaryText} from '../common-styles/typography';
import {UNIT} from '../variables/variables';

//$FlowFixMe
export default class SelectSectioned extends Select {

  renderSectionHeader: ((any) => void | Node) = ({section}: Object) => {
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

    const filteredItems = (this.state.items || []).reduce((filteredSections, section) => {
      const selectedItems = section.data.filter(item => {
        const label = (getValue && getValue(item)) || getTitle(item) || '';
        return label.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      });
      filteredSections.push({
        title: section.title,
        data: selectedItems,
      });
      return filteredSections;
    }, []);
    this.setState({filteredItems});
  }

  renderItems(): any {
    const {header = () => null} = this.props;
    return (
      <SectionList
        contentContainerStyle={styles.list}

        testID="selectItems"
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
  searchText: {
    ...mainText,
    fontWeight: '500',
    color: '$text',
  },
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

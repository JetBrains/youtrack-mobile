/* @flow */
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React, {PureComponent} from 'react';
import {
  UNIT,
  AGILE_COLLAPSED_COLUMN_WIDTH,
  COLOR_MEDIUM_GRAY
} from '../../components/variables/variables';
import type {AgileColumn} from '../../flow/Agile';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import {secondaryText} from '../../components/common-styles/issue';

type Props = {
  style?: ViewStyleProp,
  columns: Array<AgileColumn>,
  onCollapseToggle: (column: AgileColumn) => any,
};

export default class BoardHeader extends PureComponent<Props, void> {
  node: ?Object;

  setNativeProps(...args: Array<any>) {
    if (!this.node) {
      return;
    }
    this.node.setNativeProps(...args);
  }

  render() {
    const {columns, onCollapseToggle, style} = this.props;

    if (!columns || !columns.length) { //YTM-835
      return null;
    }

    return (
      <View
        style={[styles.tableHeader, style]}
        ref={component => this.node = component}
      >
        {columns.map((col, index) => {
          const agileColumn = col.agileColumn || {};
          const columnPresentation = (agileColumn.fieldValues || [])
            .map(val => val.presentation)
            .join(', ');

          return (
            <TouchableOpacity
              style={[
                styles.tableHeaderItem,
                index === columns.length - 1 &&
                  styles.tableHeaderItemWithoutBorder,
                col.collapsed && styles.collapsedHeaderItem
              ]}
              key={col.id}
              onPress={() => onCollapseToggle(col)}
            >
              <Text numberOfLines={1} style={styles.columnText}>
                {columnPresentation}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row'
  },
  tableHeaderItem: {
    flex: 1,
    paddingRight: UNIT / 2,
    paddingBottom: UNIT,
    borderBottomWidth: 0.5,
    borderColor: COLOR_MEDIUM_GRAY
  },
  tableHeaderItemWithoutBorder: {
    borderRightWidth: 0
  },
  collapsedHeaderItem: {
    flex: 0,
    width: AGILE_COLLAPSED_COLUMN_WIDTH,
    minWidth: AGILE_COLLAPSED_COLUMN_WIDTH
  },
  columnText: {
    ...secondaryText,
    textTransform: 'uppercase'
  }
});

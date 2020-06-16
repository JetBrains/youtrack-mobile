/* @flow */

import React, {PureComponent} from 'react';

import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import {
  UNIT,
  COLOR_PINK
} from '../../components/variables/variables';
import {isAllColumnsCollapsed} from './agile-board__helper';
import {AGILE_COLLAPSED_COLUMN_WIDTH} from '../../components/agile-column/agile-column';

import {secondaryText} from '../../components/common-styles/typography';

import type {AgileColumn} from '../../flow/Agile';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

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
                index === 0 ? styles.tableHeaderItemFirst : null,
                index === columns.length - 1 ? styles.tableHeaderItemWithoutBorder : null,
                col.collapsed && styles.collapsedHeaderItem,
                isAllColumnsCollapsed(columns) && styles.collapsedHeaderItemAllCollapsed
              ]}
              key={col.id}
              onPress={() => onCollapseToggle(col)}
            >
              <Text numberOfLines={1} style={[styles.columnText, col.collapsed ? styles.columnTextCollapsed : null]}>
                {columnPresentation}
                {col.collapsed && <Text style={styles.columnTextCollapsed}>...</Text>}
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
    paddingTop: UNIT * 1.5,
    paddingBottom: UNIT * 1.5,
    paddingRight: UNIT / 2,
  },
  tableHeaderItemFirst: {
    marginLeft: UNIT * 2
  },
  tableHeaderItemWithoutBorder: {
    borderRightWidth: 0
  },
  collapsedHeaderItem: {
    flex: 0,
    width: AGILE_COLLAPSED_COLUMN_WIDTH,
    minWidth: AGILE_COLLAPSED_COLUMN_WIDTH
  },
  collapsedHeaderItemAllCollapsed: {
    flex: 1,
    width: null
  },
  columnText: {
    ...secondaryText,
    textTransform: 'uppercase'
  },
  columnTextCollapsed: {
    color: COLOR_PINK
  }
});

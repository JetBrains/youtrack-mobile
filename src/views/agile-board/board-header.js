/* @flow */
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React, {PureComponent} from 'react';
import {
  UNIT,
  AGILE_COLLAPSED_COLUMN_WIDTH,
  COLOR_DARK_BORDER,
  COLOR_FONT_GRAY,
  COLOR_BLACK
} from '../../components/variables/variables';
import type {AgileColumn} from '../../flow/Agile';

type Props = {
  style?: any,
  columns: Array<AgileColumn>,
  onCollapseToggle: (column: AgileColumn) => any
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
    flexDirection: 'row',
    backgroundColor: COLOR_BLACK
  },
  tableHeaderItem: {
    flex: 1,
    padding: UNIT / 2,
    paddingLeft: UNIT,
    paddingTop: 0,
    paddingBottom: UNIT,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLOR_DARK_BORDER
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
    color: COLOR_FONT_GRAY
  }
});

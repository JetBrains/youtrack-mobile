import React, {PureComponent} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {UNIT} from 'components/variables';
import {isAllColumnsCollapsed} from './agile-board__helper';
import {AGILE_COLLAPSED_COLUMN_WIDTH} from 'components/agile-common/agile-common';
import {secondaryText} from 'components/common-styles';
import type {BoardColumn} from 'types/Agile';
import type {ViewStyleProp} from 'types/Internal';
type Props = {
  style?: ViewStyleProp;
  columns?: BoardColumn[];
  onCollapseToggle: (column: BoardColumn) => any;
};
export default class BoardHeader extends PureComponent<Props, void> {
  node: Record<string, any> | null | undefined;

  setNativeProps(...args: any[]) {
    if (!this.node) {
      return;
    }

    this.node.setNativeProps(...args);
  }

  render(): React.ReactNode {
    const {columns, onCollapseToggle, style} = this.props;

    if (!columns || !columns.length) {
      //YTM-835
      return null;
    }

    return (
      <View
        style={[styles.tableHeader, style]}
        ref={component => (this.node = component)}
      >
        {columns.map((col, index) => {
          const agileColumn = col.agileColumn || {};
          const columnPresentation = (agileColumn.fieldValues || [])
            .map(val => val.presentation)
            .join(', ');
          return (
            <TouchableOpacity
              testID="agile-column-header"
              accessibilityLabel="agile-column-header"
              accessible={true}
              style={[
                styles.tableHeaderItem,
                index === columns.length - 1
                  ? styles.tableHeaderItemWithoutBorder
                  : null,
                col.collapsed && styles.collapsedHeaderItem,
                isAllColumnsCollapsed(columns) &&
                  styles.collapsedHeaderItemAllCollapsed,
              ]}
              key={col.id}
              onPress={() => onCollapseToggle(col)}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.columnText,
                  col.collapsed ? styles.columnTextCollapsed : null,
                ]}
              >
                {columnPresentation}
                {col.collapsed && (
                  <Text style={styles.columnTextCollapsed}>...</Text>
                )}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}
const styles = EStyleSheet.create({
  tableHeader: {
    flexDirection: 'row',
    marginLeft: UNIT * 2,
  },
  tableHeaderItem: {
    flex: 1,
    paddingTop: UNIT * 1.5,
    paddingBottom: UNIT * 1.5,
    paddingRight: UNIT / 2,
  },
  tableHeaderItemWithoutBorder: {
    borderRightWidth: 0,
  },
  collapsedHeaderItem: {
    flex: 0,
    width: AGILE_COLLAPSED_COLUMN_WIDTH,
    minWidth: AGILE_COLLAPSED_COLUMN_WIDTH,
  },
  collapsedHeaderItemAllCollapsed: {
    flex: 1,
    width: null,
  },
  columnText: {...secondaryText, color: '$icon', textTransform: 'uppercase'},
  columnTextCollapsed: {
    color: '$link',
  },
});

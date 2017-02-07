/* @flow */
import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {UNIT, COLOR_GRAY} from '../../../components/variables/variables';

const COL_WIDTH = 200;

const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: 'row'
  },
  tableHeaderItem: {
    width: COL_WIDTH,
    alignItems: 'center',
    padding: UNIT/2,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLOR_GRAY
  },
});

type Props = {
  columns: Array<string>
};

export default function BoardHeader(props: Props) {
  const {columns} = props;
  return (
    <View style={styles.tableHeader}>
      {columns.map(col => {
        return (
          <View style={styles.tableHeaderItem} key={col}>
            <Text numberOfLines={1}>{col}</Text>
          </View>
        );
      })}
    </View>
  );
}

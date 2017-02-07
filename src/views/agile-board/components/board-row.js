/* @flow */
import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { UNIT, COLOR_GRAY } from '../../../components/variables/variables';
import AgileCard from '../../../components/agile-card/agile-card';

const COL_WIDTH = 160;

const styles = StyleSheet.create({
  rowContainer: {},
  rowHeader: {
    padding: UNIT
  },
  row: {
    flexDirection: 'row'
  },
  column: {
    width: COL_WIDTH,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLOR_GRAY
  }
});

type Props = {
  row: any
};

function renderIssue(issue) {
  return <AgileCard key={issue.id} issue={issue} />;
}

function renderCell(cell) {
  return (
    <View key={cell.id} style={styles.column}>
      {cell.issues.map(renderIssue)}
    </View>
  );
}

export default function BoardRow(props: Props) {
  const { row } = props;

  return (
    <View style={styles.rowContainer}>

      <View style={styles.rowHeader}>
        <Text>{row.issue ? row.issue.summary : 'Uncategorized Cards'}</Text>
      </View>

      <View style={styles.row}>
        {row.cells.map(renderCell)}
      </View>

    </View>
  );
}

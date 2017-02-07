/* @flow */
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { UNIT, COLOR_GRAY, COLOR_PINK } from '../../../components/variables/variables';
import AgileCard from '../../../components/agile-card/agile-card';
import ApiHelper from '../../../components/api/api__helper';

const COL_WIDTH = 160;

const styles = StyleSheet.create({
  rowContainer: {},
  rowHeader: {
    padding: UNIT
  },
  headerIssueId: {
    color: COLOR_PINK
  },
  rowHeaderText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  row: {
    flexDirection: 'row'
  },
  column: {
    width: COL_WIDTH,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLOR_GRAY
  },
  card: {
    marginBottom: UNIT * 2
  }
});

type Props = {
  style?: any,
  row: any,
  onTapIssue: (issue: IssueOnList) => any
};

function renderIssue(issue: IssueOnList, props) {
  const {onTapIssue = (issue) => {}} = props;

  return <TouchableOpacity key={issue.id} onPress={() => onTapIssue(issue)}>
    <AgileCard issue={issue} style={styles.card}/>
  </TouchableOpacity>;
}

function renderCell(cell, props) {
  return (
    <View key={cell.id} style={styles.column}>
      {cell.issues.map(issue => renderIssue(issue, props))}
    </View>
  );
}

export default function BoardRow(props: Props) {
  const { row, style } = props;

  return (
    <View style={[styles.rowContainer, style]}>

      <View style={styles.rowHeader}>
        <Text style={styles.headerIssueId}>
          {row.issue && ApiHelper.getIssueId(row.issue)}
        </Text>
        <Text style={styles.rowHeaderText}>
          {row.issue ? row.issue.summary : 'Uncategorized Cards'}
        </Text>
      </View>

      <View style={styles.row}>
        {row.cells.map(cell => renderCell(cell, props))}
      </View>

    </View>
  );
}

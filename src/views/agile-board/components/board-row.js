/* @flow */
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { UNIT, AGILE_COLUMN_MIN_WIDTH, COLOR_GRAY, COLOR_PINK } from '../../../components/variables/variables';
import AgileCard from '../../../components/agile-card/agile-card';
import ApiHelper from '../../../components/api/api__helper';
import {arrowRightGray, arrowDownGray} from '../../../components/icon/icon';

type Props = {
  style?: any,
  row: BoardRow,
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
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={() => {}}
        >
          <Image source={arrowRightGray} style={styles.collapseIcon}/>
          <Text style={styles.rowHeaderText}>
            {row.issue ? row.issue.summary : 'Uncategorizedf Cards'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        {row.cells.map(cell => renderCell(cell, props))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {},
  rowHeader: {
    padding: UNIT
  },
  headerIssueId: {
    marginLeft: UNIT * 2,
    marginBottom: UNIT/2,
    color: COLOR_PINK
  },
  rowHeaderText: {
    fontSize: 17,
    marginLeft: UNIT / 2,
    fontWeight: 'bold'
  },
  row: {
    flexDirection: 'row'
  },
  column: {
    width: AGILE_COLUMN_MIN_WIDTH,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: COLOR_GRAY
  },
  card: {
    marginBottom: UNIT * 2
  },
  collapseButton: {
    flexDirection: 'row',
  },
  collapseIcon: {
    width: 12,
    height: 12,
    marginTop: UNIT/2,
    resizeMode: 'contain'
  }
});

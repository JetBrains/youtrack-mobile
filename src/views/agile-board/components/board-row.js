/* @flow */
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { UNIT, AGILE_COLUMN_MIN_WIDTH, COLOR_GRAY, COLOR_FONT_GRAY, COLOR_PINK } from '../../../components/variables/variables';
import AgileCard from '../../../components/agile-card/agile-card';
import ApiHelper from '../../../components/api/api__helper';
import {arrowRightGray, arrowDownGray} from '../../../components/icon/icon';
import type {AgileBoardRow} from '../../../flow/Agile';
import type {IssueOnList} from '../../../flow/Issue';

type Props = {
  style?: any,
  row: AgileBoardRow,
  onTapIssue: (issue: IssueOnList) => any,
  onCollapseToggle: (row: AgileBoardRow) => any
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
  const { row, style, onCollapseToggle } = props;
  const isResolved = row.issue && row.issue.resolved;

  return (
    <View style={[styles.rowContainer, style]}>

      <View style={styles.rowHeader}>
        <Text style={[styles.headerIssueId, isResolved && styles.resolvedIssueText]}>
          {row.issue && ApiHelper.getIssueId(row.issue)}
        </Text>
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={() => onCollapseToggle(row)}
        >
          <Image source={row.collapsed ? arrowRightGray: arrowDownGray} style={styles.collapseIcon}/>
          <Text style={[styles.rowHeaderText, isResolved && styles.resolvedIssueText]}>
            {row.issue ? row.issue.summary : 'Uncategorizedf Cards'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        {!row.collapsed && row.cells.map(cell => renderCell(cell, props))}
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
  resolvedIssueText: {
    color: COLOR_FONT_GRAY,
    textDecorationLine: 'line-through'
  },
  rowHeaderText: {
    fontSize: 17,
    marginLeft: UNIT / 2,
    fontWeight: 'bold'
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: COLOR_GRAY
  },
  column: {
    width: AGILE_COLUMN_MIN_WIDTH,
    borderRightWidth: 0.5,
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

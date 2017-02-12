/* @flow */
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { UNIT, AGILE_COLUMN_MIN_WIDTH, AGILE_COLLAPSED_COLUMN_WIDTH, COLOR_GRAY, COLOR_FONT_GRAY, COLOR_PINK } from '../../../components/variables/variables';
import AgileCard from '../../../components/agile-card/agile-card';
import ApiHelper from '../../../components/api/api__helper';
import {arrowRightGray, arrowDownGray} from '../../../components/icon/icon';
import type {AgileBoardRow, BoardCell} from '../../../flow/Agile';
import type {IssueOnList} from '../../../flow/Issue';

type Props = {
  style?: any,
  row: AgileBoardRow,
  collapsedColumnIds: Array<string>,
  onTapIssue: (issue: IssueOnList) => any,
  onCollapseToggle: (row: AgileBoardRow) => any
};

function renderIssue(issue: IssueOnList, onTapIssue) {
  return <TouchableOpacity key={issue.id} onPress={() => onTapIssue(issue)}>
    <AgileCard issue={issue} style={styles.card}/>
  </TouchableOpacity>;
}

function renderIssuqSquare(issue: IssueOnList) {
    return <View key={issue.id} style={styles.issueSquare}/>;
}

function renderCell(cell: BoardCell, collapsed: boolean, onTapIssue) {
  return (
    <View key={cell.id} style={[styles.column, collapsed && styles.columnCollapsed]}>
      {cell.issues.map(issue => {
        return collapsed ? renderIssuqSquare(issue) : renderIssue(issue, onTapIssue);
      })}
    </View>
  );
}

export default function BoardRow(props: Props) {
  const { row, style, collapsedColumnIds, onCollapseToggle, onTapIssue} = props;
  const isResolved = row.issue && row.issue.resolved;

  return (
    <View style={[styles.rowContainer, style]}>

      <View style={styles.rowHeader}>

        {row.issue && <TouchableOpacity onPress={() => onTapIssue(row.issue)}>
          <Text style={[styles.headerIssueId, isResolved && styles.resolvedIssueText]}>
            {ApiHelper.getIssueId(row.issue)}
          </Text>
        </TouchableOpacity>}

        <TouchableOpacity
          style={styles.collapseButton}
          onPress={() => onCollapseToggle(row)}
        >
          <Image source={row.collapsed ? arrowRightGray: arrowDownGray} style={styles.collapseIcon}/>
          <Text style={[styles.rowHeaderText, isResolved && styles.resolvedIssueText]}>
            {row.id === 'orphans' ? 'Uncategorized Cards' : (row.issue && row.issue.summary || row.name)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        {!row.collapsed && row.cells.map(cell => {
          const isCellCollapsed = collapsedColumnIds.includes(cell.column.id);
          return renderCell(cell, isCellCollapsed, onTapIssue);
        })}
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
  columnCollapsed: {
    width: AGILE_COLLAPSED_COLUMN_WIDTH,
    paddingTop: UNIT - 2,
    paddingLeft: 2,
    paddingRight: 2,
    flexDirection: 'row',
    flexWrap: 'wrap'
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
  },
  issueSquare: {
    width: 8,
    height: 8,
    margin: 2,
    borderWidth: 1,
    borderColor: 'silver'
  }
});

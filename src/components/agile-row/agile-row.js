/* @flow */
import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import AgileCard from '../agile-card/agile-card';
import ApiHelper from '../api/api__helper';
import {addGray, arrowRightGray, arrowDownGray} from '../icon/icon';
import styles from './agile-row.styles';
import type {AgileBoardRow, BoardCell} from '../../flow/Agile';
import type {IssueOnList} from '../../flow/Issue';
import {getPriotityField} from '../issue-formatter/issue-formatter';

type Props = {
  style?: any,
  row: AgileBoardRow,
  collapsedColumnIds: Array<string>,
  onTapIssue: (issue: IssueOnList) => any,
  onTapCreateIssue: (columnId: string, cellId: string) => any,
  onCollapseToggle: (row: AgileBoardRow) => any
};

function renderIssue(issue: IssueOnList, onTapIssue) {
  return <TouchableOpacity key={issue.id} onPress={() => onTapIssue(issue)}>
    <AgileCard issue={issue} style={styles.card}/>
  </TouchableOpacity>;
}

function renderIssueSquare(issue: IssueOnList) {
    const priorityField = getPriotityField(issue);

    const color = priorityField ? priorityField.value.color : null;
    return <View
      key={issue.id}
      style={[styles.issueSquare, color && {backgroundColor: color.background}]}
    />;
}

function renderCell(cell: BoardCell, collapsed: boolean, onTapIssue, onTapCreateIssue, lastColumn) {
  return (
    <View key={cell.id} style={[
        styles.column,
        collapsed && styles.columnCollapsed,
        lastColumn && styles.columnWithoutBorder
      ]}
    >
      {cell.issues.map(issue => {
        return collapsed ? renderIssueSquare(issue) : renderIssue(issue, onTapIssue);
      })}
      {!collapsed && <TouchableOpacity onPress={() => onTapCreateIssue(cell.column.id, cell.id)} style={styles.addCardButton}>
        <Image style={styles.addCardIcon} source={addGray}/>
      </TouchableOpacity>}
    </View>
  );
}

export default function BoardRow(props: Props) {
  const { row, style, collapsedColumnIds, onCollapseToggle, onTapIssue, onTapCreateIssue} = props;
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
        {!row.collapsed && row.cells.map((cell, index) => {
          const isCellCollapsed = collapsedColumnIds.includes(cell.column.id);
          const lastColumn = index === row.cells.length - 1;
          return renderCell(cell, isCellCollapsed, onTapIssue, onTapCreateIssue, lastColumn);
        })}
      </View>

    </View>
  );
}

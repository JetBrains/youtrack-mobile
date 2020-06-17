/* @flow */

import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import ApiHelper from '../api/api__helper';
import {IconAngleDownRight} from '../icon/icon';
import AgileRowColumn from './agile-row__column';
import {getPriotityField} from '../issue-formatter/issue-formatter';
import {COLOR_DARK} from '../variables/variables';
import {isAllColumnsCollapsed} from '../../views/agile-board/agile-board__helper';

import styles from './agile-row.styles';

import type {AgileBoardRow, BoardCell, BoardColumn} from '../../flow/Agile';
import type {IssueOnList} from '../../flow/Issue';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type RenderIssueCard = (issue: IssueOnList) => any;

type Props = {
  style?: ViewStyleProp,
  row: AgileBoardRow,
  collapsedColumnIds: Array<string>,
  onTapIssue: (issue: IssueOnList) => any,
  onTapCreateIssue: (columnId: string, cellId: string) => any,
  onCollapseToggle: (row: AgileBoardRow) => any,
  renderIssueCard: RenderIssueCard,
  zoomedIn?: boolean,
  columns: Array<BoardColumn>
};

function renderCollapsedCard(issue: IssueOnList) {
  const priorityField = getPriotityField(issue);

  const color = priorityField?.value?.color;
  return (
    <View
      testID="agileRowColumnCollapsedCard"
      key={issue.id}
      style={[styles.issueSquare, color && {backgroundColor: color.background}]}
    />
  );
}

function renderCollapsedColumn(cell: BoardCell, columnPositionData: Object, isAllCollapsed: boolean) {
  if (cell.issues) {
    return (
      <View
        testID="agileRowColumnCollapsed"
        key={cell.id}
        style={[
          styles.column,
          styles.columnCollapsed,
          isAllCollapsed ? styles.columnCollapsedAll : null,
          columnPositionData.firstColumn ? styles.columnFirst : null,
          columnPositionData.lastColumn ? styles.columnWithoutBorder : null
        ]}>
        <View style={styles.columnCollapsed}>
          {cell.issues.map(renderCollapsedCard)}
        </View>
      </View>
    );
  }
}

export default function BoardRow(props: Props) {
  const {
    row,
    style,
    collapsedColumnIds,
    onCollapseToggle,
    onTapIssue,
    onTapCreateIssue,
    renderIssueCard,
    zoomedIn,
    columns
  } = props;

  const isResolved = row.issue && row.issue.resolved;

  return (
    <View
      testID="agileRow"
      style={[styles.rowContainer, style]}
    >
      <View
        testID="agileRowHeader"
        style={[
          styles.rowHeader,
          !zoomedIn ? styles.rowHeaderZoomedOut : null,
        ]}>

        <TouchableOpacity
          testID="agileRowCollapseButton"
          style={styles.collapseButton}
          onPress={() => onCollapseToggle(row)}
        >
          <IconAngleDownRight
            style={styles.collapseButtonIcon}
            isDown={!row.collapsed}
            size={19}
            color={COLOR_DARK}
          />
          <Text style={[
            styles.rowHeaderText,
            !zoomedIn ? styles.rowHeaderTextZoomedOut : null,
            isResolved && styles.issueIdResolved
          ]}>
            {row.id === 'orphans' ? 'Uncategorized Cards' : (row.issue && row.issue.summary || row.name)}
          </Text>
        </TouchableOpacity>

        {Boolean(row.issue) && (
          <TouchableOpacity onPress={() => onTapIssue(row.issue)}>
            <Text
              testID="agileRowIssueId"
              style={[
                styles.headerIssueId,
                isResolved && styles.issueResolved,
                !zoomedIn ? styles.headerIssueIdZoomedOut : null,
              ]}
            >
              {ApiHelper.getIssueId(row.issue)}
            </Text>
          </TouchableOpacity>
        )}

      </View>

      <View style={styles.row}>
        {!row.collapsed && row.cells.map((cell, index) => {
          const isCellCollapsed = collapsedColumnIds.includes(cell.column.id);
          const lastColumn = index === row.cells.length - 1;

          if (isCellCollapsed) {
            return renderCollapsedColumn(cell, {firstColumn: index === 0, lastColumn: index === row.cells.length - 1}, isAllColumnsCollapsed(columns));
          }

          return (
            <AgileRowColumn
              testID="agileRowColumn"
              key={cell.id}
              cell={cell}
              onTapCreateIssue={onTapCreateIssue}
              lastColumn={lastColumn}
              renderIssueCard={renderIssueCard}
            />
          );
        })}
      </View>

    </View>
  );
}

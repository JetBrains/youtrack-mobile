import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import ApiHelper from '../api/api__helper';
import AgileRowColumn from './agile-row__column';
import {getPriorityField} from '../issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {IconAngleDownRight} from '../icon/icon';
import {isAllColumnsCollapsed} from 'views/agile-board/agile-board__helper';
import styles from './agile-row.styles';
import type {AgileBoardRow, BoardCell, BoardColumn} from 'types/Agile';
import type {IssueOnListExtended} from 'types/Issue';
import type {ViewStyleProp} from 'types/Internal';
import type {UITheme} from 'types/Theme';

type RenderIssueCard = (issue: IssueOnListExtended) => any;
type Props = {
  style?: ViewStyleProp;
  row: AgileBoardRow;
  collapsedColumnIds: string[];
  onTapIssue: (issue: IssueOnListExtended) => any;
  onTapCreateIssue?: (columnId: string, cellId: string) => any;
  onCollapseToggle: (row: AgileBoardRow) => any;
  renderIssueCard: RenderIssueCard;
  zoomedIn?: boolean;
  columns: BoardColumn[];
  uiTheme: UITheme;
};

function renderCollapsedCard(issue: IssueOnListExtended) {
  const priorityField = getPriorityField(issue);
  const color = priorityField?.value?.color;
  return (
    <View
      testID="agileRowColumnCollapsedCard"
      key={issue.id}
      style={[
        styles.issueSquare,
        color && {
          backgroundColor: color.background,
        },
      ]}
    />
  );
}

function renderCollapsedColumn(
  cell: BoardCell,
  columnPositionData: Record<string, any>,
  isAllCollapsed: boolean,
) {
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
          columnPositionData.lastColumn ? styles.columnWithoutBorder : null,
        ]}
      >
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
    columns,
    uiTheme,
  } = props;

  if (!row) {
    return null;
  }

  const isResolved: boolean = !!row?.issue?.resolved;
  return (
    <View testID="agileRow" style={style}>
      <View
        testID="agile-row-header"
        accessibilityLabel="agile-row-header"
        accessible={true}
        style={[styles.rowHeader, !zoomedIn ? styles.rowHeaderZoomedOut : null]}
      >
        <TouchableOpacity
          testID="agileRowCollapseButton"
          style={styles.collapseButton}
          onPress={() => onCollapseToggle(row)}
        >
          <IconAngleDownRight
            style={styles.collapseButtonIcon}
            isDown={!row.collapsed}
            size={19}
            color={uiTheme.colors.$text}
          />
          <Text
            style={[
              styles.rowHeaderText,
              !zoomedIn ? styles.rowHeaderTextZoomedOut : null,
              isResolved && styles.issueIdResolved,
            ]}
          >
            {row.id === 'orphans'
              ? i18n('Uncategorized Cards')
              : (row.issue && row.issue.summary) || row.name}
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

      {Boolean(!row.collapsed && row.cells) && (
        <View testID="agileRowCells" style={styles.row}>
          {row.cells.map((cell, index) => {
            const isCellCollapsed = collapsedColumnIds.includes(cell.column.id);
            const lastColumn = index === row.cells.length - 1;

            if (isCellCollapsed) {
              return renderCollapsedColumn(
                cell,
                {
                  firstColumn: index === 0,
                  lastColumn: index === row.cells.length - 1,
                },
                isAllColumnsCollapsed(columns),
              );
            }

            return (
              <AgileRowColumn
                testID="agileRowColumn"
                key={cell.id}
                cell={cell}
                onTapCreateIssue={onTapCreateIssue}
                lastColumn={lastColumn}
                renderIssueCard={renderIssueCard}
                zoomedIn={zoomedIn}
                columnsLength={columns.length}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

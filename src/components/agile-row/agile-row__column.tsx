import React from 'react';
import {TouchableOpacity} from 'react-native';
import {AGILE_TABLET_CARD_WIDTH} from '../agile-common/agile-common';
import {DropZone} from '../draggable';
import {IconAdd} from '../icon/icon';
import {isSplitView} from '../responsive/responsive-helper';
import styles from './agile-row.styles';
import type {BoardCell} from 'flow/Agile';
import type {IssueFull} from 'flow/Issue';
import type {UITheme} from 'flow/Theme';
type ColumnProps = {
  cell: BoardCell;
  onTapCreateIssue?: (...args: Array<any>) => any;
  lastColumn: boolean;
  renderIssueCard: (issue: IssueFull) => any;
  uiTheme: UITheme;
  zoomedIn?: boolean;
  columnsLength: number;
};
export default function AgileRowColumn(props: ColumnProps): React.ReactNode {
  const {cell, uiTheme, zoomedIn, columnsLength} = props;
  const issues: Array<IssueFull> = cell.issues || [];
  return (
    <DropZone
      style={[styles.column, props.lastColumn && styles.columnWithoutBorder]}
      data={{
        columnId: cell.column.id,
        cellId: cell.id,
        issueIds: issues.map(issue => issue.id),
        columnsLength,
      }}
    >
      {issues.map(props.renderIssueCard)}

      <TouchableOpacity
        disabled={!props.onTapCreateIssue}
        onPress={() =>
          props.onTapCreateIssue &&
          props.onTapCreateIssue(cell.column.id, cell.id)
        }
        style={[
          styles.addCardButton,
          isSplitView() && zoomedIn && columnsLength > 3
            ? {
                width: AGILE_TABLET_CARD_WIDTH,
              }
            : null,
        ]}
      >
        <IconAdd
          color={
            props.onTapCreateIssue
              ? uiTheme.colors.$link
              : uiTheme.colors.$disabled
          }
          size={18}
        />
      </TouchableOpacity>
    </DropZone>
  );
}

import React from 'react';
import {TouchableOpacity} from 'react-native';

import IconPlus from 'components/icon/assets/plus.svg';
import {AGILE_TABLET_CARD_WIDTH} from 'components/agile-common/agile-common';
import {DropZone} from '../draggable';
import {isSplitView} from 'components/responsive/responsive-helper';

import styles from './agile-row.styles';

import type {BoardCell} from 'types/Agile';
import type {IssueOnList} from 'types/Issue';
import type {UITheme} from 'types/Theme';

interface ColumnProps {
  cell: BoardCell;
  onTapCreateIssue?: (cellColumnId: string, cellId: string) => any;
  lastColumn: boolean;
  renderIssueCard: (issue: IssueOnList) => any;
  uiTheme: UITheme;
  zoomedIn?: boolean;
  columnsLength: number;
}

export default function AgileRowColumn(props: ColumnProps): React.ReactNode {
  const {cell, uiTheme, zoomedIn, columnsLength} = props;
  const issues = cell.issues || [];
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
        onPress={() => {
          props?.onTapCreateIssue?.(cell.column.id, cell.id);
        }}
        style={[
          styles.addCardButton,
          isSplitView() && zoomedIn && columnsLength > 3 ? {width: AGILE_TABLET_CARD_WIDTH} : null,
        ]}
      >
        <IconPlus
          color={props.onTapCreateIssue ? uiTheme.colors.$link : uiTheme.colors.$disabled}
          width={18}
          height={18}
        />
      </TouchableOpacity>
    </DropZone>
  );
}

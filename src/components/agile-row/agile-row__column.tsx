import React from 'react';
import {TouchableOpacity} from 'react-native';

import {IconAdd} from 'components/icon/icon';
import {AGILE_TABLET_CARD_WIDTH} from 'components/agile-common/agile-common';
import {DropZone} from '../draggable';
import {isSplitView} from 'components/responsive/responsive-helper';

import styles from './agile-row.styles';

import type {BoardCell} from 'types/Agile';
import type {IssueOnList} from 'types/Issue';

interface ColumnProps {
  cell: BoardCell;
  onTapCreateIssue?: (cellColumnId: string, cellId: string) => void;
  lastColumn: boolean;
  renderIssueCard: (issue: IssueOnList) => React.ReactNode;
  zoomedIn?: boolean;
  columnsLength: number;
  testID?: string;
}

export default function AgileRowColumn(props: ColumnProps) {
  const {cell, zoomedIn, columnsLength, testID} = props;
  const issues = cell.issues || [];
  return (
    <DropZone
      testID={testID}
      style={[styles.column, props.lastColumn && styles.columnWithoutBorder]}
      data={{
        columnId: cell.column.id,
        cellId: cell.id,
        issueIds: issues.map(issue => issue.id),
        columnsLength,
      }}
    >
      {issues.map(props.renderIssueCard)}

      {props.onTapCreateIssue &&
        <TouchableOpacity
          onPress={() => {
            props?.onTapCreateIssue?.(cell.column.id, cell.id);
          }}
          style={[
            styles.addCardButton,
            isSplitView() && zoomedIn && columnsLength > 3 ? {width: AGILE_TABLET_CARD_WIDTH} : null,
          ]}
        >
          <IconAdd
            color={styles.link.color}
            size={18}
          />
        </TouchableOpacity>
      }
    </DropZone>
  );
}

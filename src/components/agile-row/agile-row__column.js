/* @flow */

import React from 'react';
import {TouchableOpacity} from 'react-native';
import { DropZone } from '../draggable';
import {IconAdd} from '../icon/icon';

import styles from './agile-row.styles';

import type {BoardCell} from '../../flow/Agile';
import type {IssueOnList} from '../../flow/Issue';
import type {UITheme} from '../../flow/Theme';

type ColumnProps = {
  cell: BoardCell,
  onTapCreateIssue: Function,
  lastColumn: boolean,
  renderIssueCard: (issue: IssueOnList) => any,
  uiTheme: UITheme
}

export default function AgileRowColumn(props: ColumnProps) {
  const {cell, uiTheme} = props;
  const issues: Array<IssueOnList> = cell.issues || [];

  return (
    <DropZone
      style={[styles.column, props.lastColumn && styles.columnWithoutBorder]}
      data={{
        columnId: cell.column.id,
        cellId: cell.id,
        issueIds: issues.map(issue => issue.id)
      }}
    >
      {issues.map(props.renderIssueCard)}

      <TouchableOpacity
        onPress={() => props.onTapCreateIssue(cell.column.id, cell.id)}
        style={styles.addCardButton}
      >
        <IconAdd color={uiTheme.colors.$link} size={18}/>
      </TouchableOpacity>
    </DropZone>
  );
}

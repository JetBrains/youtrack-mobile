/* @flow */
import React from 'react';
import {Image, TouchableOpacity} from 'react-native';
import styles from './agile-row.styles';
import { DropZone } from '../draggable';
import {addGray} from '../icon/icon';
import type {BoardCell} from '../../flow/Agile';
import type {IssueOnList} from '../../flow/Issue';

type ColumnProps = {
  cell: BoardCell,
  onTapCreateIssue: Function,
  lastColumn: boolean,
  renderIssueCard: (issue: IssueOnList) => any
}

export default function AgileRowColumn(props: ColumnProps) {
  const {cell} = props;

  return (
    <DropZone
      style={[styles.column, props.lastColumn && styles.columnWithoutBorder]}
      data={{
        columnId: cell.column.id,
        cellId: cell.id,
        issueIds: props.cell.issues.map(issue => issue.id)
      }}
    >
      {props.cell.issues.map(props.renderIssueCard)}
      <TouchableOpacity onPress={() => props.onTapCreateIssue(cell.column.id, cell.id)} style={styles.addCardButton}>
        <Image style={styles.addCardIcon} source={addGray}/>
      </TouchableOpacity>
    </DropZone>
  );
}

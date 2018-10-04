/* @flow */
import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import styles from './agile-row.styles';
import {addGray} from '../icon/icon';
import type {BoardCell} from '../../flow/Agile';
import type {IssueOnList} from '../../flow/Issue';

type ColumnProps = {
  cell: BoardCell,
  onTapCreateIssue: Function,
  lastColumn: boolean,
  dragOver: boolean, // From <DropZone/>
  renderIssueCard: (issue: IssueOnList) => any
}

export default function AgileRowColumn(props: ColumnProps) {
  return (
    <View style={[styles.column, props.lastColumn && styles.columnWithoutBorder]}>
      {props.cell.issues.map(props.renderIssueCard)}
      <TouchableOpacity onPress={() => props.onTapCreateIssue(props.cell.column.id, props.cell.id)} style={styles.addCardButton}>
        <Image style={styles.addCardIcon} source={addGray}/>
      </TouchableOpacity>
    </View>
  );
}

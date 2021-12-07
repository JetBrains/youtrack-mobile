/* @flow */

import type {Node} from 'React';
import React from 'react';
import {TouchableOpacity} from 'react-native';

import {DropZone} from '../draggable';
import {IconAdd} from '../icon/icon';
import {isSplitView} from '../responsive/responsive-helper';

import styles from './agile-row.styles';

import type {BoardCell} from '../../flow/Agile';
import type {IssueFull} from '../../flow/Issue';
import type {UITheme} from '../../flow/Theme';

type ColumnProps = {
  cell: BoardCell,
  onTapCreateIssue: Function,
  lastColumn: boolean,
  renderIssueCard: (issue: IssueFull) => any,
  uiTheme: UITheme,
  zoomedIn?: boolean,
}

export default function AgileRowColumn(props: ColumnProps): Node {
  const {cell, uiTheme, zoomedIn} = props;
  const issues: Array<IssueFull> = cell.issues || [];

  return (
    <DropZone
      style={[styles.column, props.lastColumn && styles.columnWithoutBorder]}
      data={{
        columnId: cell.column.id,
        cellId: cell.id,
        issueIds: issues.map(issue => issue.id),
      }}
    >
      {issues.map(props.renderIssueCard)}

      <TouchableOpacity
        onPress={() => props.onTapCreateIssue(cell.column.id, cell.id)}
        style={[
          styles.addCardButton,
          isSplitView() && zoomedIn ? styles.addCardButtonTablet : null,
        ]}
      >
        <IconAdd color={uiTheme.colors.$link} size={18}/>
      </TouchableOpacity>
    </DropZone>
  );
}

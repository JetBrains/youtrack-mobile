/* @flow */

import type {Node} from 'React';
import React from 'react';
import {FlatList, TouchableOpacity} from 'react-native';

import { DropZone } from '../draggable';
import {cardBottomMargin, getAgileCardHeight} from '../agile-card/agile-card';
import {IconAdd} from '../icon/icon';

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
  zoomedIn?: boolean
}

export default function AgileRowColumn(props: ColumnProps): Node {
  const {cell, uiTheme, zoomedIn} = props;
  const issues: Array<IssueFull> = cell.issues || [];

  function renderCard({item}: IssueFull) {
    return props.renderIssueCard(item);
  }

  function getId(issue: IssueFull) {
    return issue.id;
  }

  function getItemLayout(items: ?Array<IssueFull>, index: number) {
    const height = getAgileCardHeight();
    const offset = (height + cardBottomMargin) * index;
    return {
      length: height,
      offset: offset,
      index,
    };
  }

  return (
    <DropZone
      style={[styles.column, props.lastColumn && styles.columnWithoutBorder]}
      data={{
        columnId: cell.column.id,
        cellId: cell.id,
        issueIds: issues.map(issue => issue.id),
      }}
    >

      <FlatList
        scrollEnabled={false}
        data={issues}
        keyExtractor={getId}
        renderItem={renderCard}
        getItemLayout={getItemLayout}
        extraData={zoomedIn}
        ListFooterComponent={
          <TouchableOpacity
            onPress={() => props.onTapCreateIssue(cell.column.id, cell.id)}
            style={styles.addCardButton}
          >
            <IconAdd color={uiTheme.colors.$link} size={18}/>
          </TouchableOpacity>
        }
      />
    </DropZone>
  );
}

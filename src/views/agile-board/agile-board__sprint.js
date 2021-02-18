/* @flow */

import React, {Component} from 'react';

import AgileCard from '../../components/agile-card/agile-card';
import BoardRow from '../../components/agile-row/agile-row';
import {Draggable} from '../../components/draggable/';

import type {AnyIssue} from '../../flow/Issue';
import type {AgileBoardRow, Board, SprintFull} from '../../flow/Agile';
import type {UITheme} from '../../flow/Theme';

type Props = {
  sprint: SprintFull,
  zoomedIn: boolean,
  canRunCommand: (issue: AnyIssue) => boolean,
  onTapIssue: (issue: AnyIssue) => void,
  onTapCreateIssue: (columnId: string, cellId: string) => void,
  onCollapseToggle: (row: AgileBoardRow) => void,
  uiTheme: UITheme
};


export default class AgileBoardSprint extends Component<Props, void> {

  shouldComponentUpdate(nextProps: Props): boolean {
    return (
      this.props.sprint !== nextProps.sprint ||
      this.props.zoomedIn !== nextProps.zoomedIn ||
      this.props.uiTheme !== nextProps.uiTheme
    );
  }

  getCollapsedColumnIds = () => {
    return (this.props.sprint?.board?.columns || []).filter(col => col.collapsed).map(col => col.id);
  }

  createCommonRowProps = () => {
    const {onTapIssue, onTapCreateIssue, onCollapseToggle, uiTheme} = this.props;

    return {
      collapsedColumnIds: this.getCollapsedColumnIds(),
      renderIssueCard: this.renderCard,
      onTapIssue,
      onTapCreateIssue,
      onCollapseToggle,
      uiTheme

    };
  };

  renderCard = (issue: AnyIssue) => {
    const {sprint, zoomedIn, canRunCommand, onTapIssue, uiTheme} = this.props;
    const canDrag = sprint.agile.isUpdatable || canRunCommand(issue);

    return (
      <Draggable
        key={issue.id}
        data={issue.id}
        onPress={() => onTapIssue(issue)}
        disabled={!canDrag}
      >
        <AgileCard
          issue={issue}
          estimationField={sprint.agile.estimationField}
          zoomedIn={zoomedIn}
          uiTheme={uiTheme}
        />
      </Draggable>
    );
  };

  renderOrphan = (board: Board) => {
    const {zoomedIn} = this.props;

    return (
      <BoardRow
        testID="agileBoardSprintOrphan"
        key="orphan"
        row={board.orphanRow}
        zoomedIn={zoomedIn}
        columns={board.columns}
        {...this.createCommonRowProps()}
      />
    );
  };

  render() {
    const {sprint, zoomedIn} = this.props;
    const board: Board = sprint?.board;

    if (!sprint || !board) {
      return null;
    }

    const isOrphansAtTheTop: boolean = sprint.agile.orphansAtTheTop;
    const hideOrphansSwimlane: boolean = sprint.agile?.hideOrphansSwimlane;
    const orphan: AgileBoardRow = !hideOrphansSwimlane && this.renderOrphan(board);

    return (
      <>
        {isOrphansAtTheTop && orphan}

        {(board.trimmedSwimlanes || []).map((swimlane: Object & { id: string }) => {
          return (
            <BoardRow
              testID="agileBoardSprintRow"
              key={swimlane.id}
              row={swimlane}
              zoomedIn={zoomedIn}
              columns={board.columns}
              {...this.createCommonRowProps()}
            />
          );
        })}

        {!isOrphansAtTheTop && orphan}
      </>
    );
  }
}

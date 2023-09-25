import React, {Component} from 'react';
import AgileCard from 'components/agile-card/agile-card';
import BoardRow from 'components/agile-row/agile-row';
import {AGILE_TABLET_CARD_WIDTH} from 'components/agile-common/agile-common';
import Draggable from 'components/draggable/draggable';
import {isSplitView} from 'components/responsive/responsive-helper';
import type {AgileBoardRow, Board, SprintFull} from 'types/Agile';
import type {AnyIssue} from 'types/Issue';
import type {UIThemeName, UIThemeColors, BarStyle} from 'types/Theme';
import type {UITheme} from 'types/Theme';
type Props = {
  sprint: SprintFull;
  zoomedIn: boolean;
  canRunCommand: (issue: AnyIssue) => boolean;
  onTapIssue: (issue: AnyIssue) => void;
  onTapCreateIssue?: (columnId: string, cellId: string) => void;
  onCollapseToggle: (row: AgileBoardRow) => void;
  uiTheme: UITheme;
};
export default class AgileBoardSprint extends Component<Props, void> {
  shouldComponentUpdate(nextProps: Props): boolean {
    return (
      this.props.sprint !== nextProps.sprint ||
      this.props.zoomedIn !== nextProps.zoomedIn ||
      this.props.uiTheme !== nextProps.uiTheme
    );
  }

  getCollapsedColumnIds: () => Array<string> = () => {
    return (this.props.sprint?.board?.columns || [])
      .filter(col => col.collapsed)
      .map(col => col.id);
  };
  createCommonRowProps: () => {
    collapsedColumnIds: string[];
    onCollapseToggle: (row: AgileBoardRow) => void;
    onTapCreateIssue?: (columnId: string, cellId: string) => void;
    onTapIssue: (issue: AnyIssue) => void;
    renderIssueCard: (issue: AnyIssue) => Node;
    uiTheme: {
      androidSummaryFontWeight: string;
      barStyle: BarStyle;
      colors: UIThemeColors;
      dark: boolean;
      mode: string;
      name: UIThemeName;
    };
  } = () => {
    const {
      onTapIssue,
      onTapCreateIssue,
      onCollapseToggle,
      uiTheme,
    } = this.props;
    return {
      collapsedColumnIds: this.getCollapsedColumnIds(),
      renderIssueCard: this.renderCard,
      onTapIssue,
      onTapCreateIssue,
      onCollapseToggle,
      uiTheme,
    };
  };
  renderCard: (issue: AnyIssue)=> React.ReactNode = (issue: AnyIssue) => {
    const {sprint, zoomedIn, canRunCommand, onTapIssue, uiTheme} = this.props;
    const canDrag: boolean = sprint.agile.isUpdatable || canRunCommand(issue);
    const cardWidth: number | null | undefined =
      isSplitView() && zoomedIn && sprint?.board?.columns?.length > 3
        ? AGILE_TABLET_CARD_WIDTH
        : undefined;
    return (
      <Draggable
        key={issue.id}
        data={issue.id}
        onPress={() => onTapIssue(issue)}
        disabled={!canDrag}
        style={
          cardWidth && {
            width: AGILE_TABLET_CARD_WIDTH,
          }
        }
      >
        <AgileCard
          issue={issue}
          estimationField={sprint.agile.estimationField}
          zoomedIn={zoomedIn}
          uiTheme={uiTheme}
          cardWidth={cardWidth}
          colorCoding={sprint.agile.colorCoding}
        />
      </Draggable>
    );
  };
  renderOrphan: (board: Board)=> React.ReactNode = (board: Board) => {
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

  render(): React.ReactNode {
    const {sprint, zoomedIn} = this.props;
    const board: Board = sprint?.board;

    if (!sprint || !board) {
      return null;
    }

    const isOrphansAtTheTop: boolean = !!sprint.agile?.orphansAtTheTop;
    const hideOrphansSwimlane: boolean = sprint.agile?.hideOrphansSwimlane;
    const orphan: AgileBoardRow =
      !hideOrphansSwimlane && this.renderOrphan(board);
    return (
      <>
        {isOrphansAtTheTop && orphan}

        {(board.trimmedSwimlanes || []).map(
          (
            swimlane: Record<string, any> & {
              id: string;
            },
          ) => {
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
          },
        )}

        {!isOrphansAtTheTop && orphan}
      </>
    );
  }
}

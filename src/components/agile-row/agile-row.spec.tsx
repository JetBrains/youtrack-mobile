import React from 'react';

import {render} from '@testing-library/react-native';

import mocks from 'test/mocks';
import BoardRow from './agile-row';
import {DEFAULT_THEME} from 'components/theme/theme';

import type {AgileBoardRow, BoardCell, BoardColumn} from 'types/Agile';
import type {IssueOnList} from 'types/Issue';
import {DragContext} from 'components/draggable/drag-container';

const cellMock = {
  id: 'id',
  row: {
    id: 'orphans',
  },
  column: {
    id: 'id',
    collapsed: false,
  },
  issues: [],
};

describe('<BoardRow/>', () => {
  let issueMock: IssueOnList;
  beforeEach(() => {
    issueMock = mocks.createIssueMock();
  });

  describe('Render', () => {
    it('should not render a row', () => {
      const {queryByTestId} = renderComponent(undefined as unknown as AgileBoardRow, false);

      expect(queryByTestId('agileRowHeader')).toBeNull();
    });

    it('should not render empty cells', () => {
      const {queryByTestId} = renderComponent({collapsed: false} as unknown as AgileBoardRow, false);
      expect(queryByTestId('agileRowCells')).toBeNull();
    });

    it('should not render cells if collapsed', () => {
      const {queryByTestId} = renderComponent(
        {
          collapsed: true,
          cells: [cellMock as unknown as BoardCell],
        } as unknown as AgileBoardRow,
        false
      );
      expect(queryByTestId('agileRowCells')).toBeNull();
    });

    it('should render a header', () => {
      const {getByTestId} = renderComponent(createRowMock(), false);
      expect(getByTestId('agile-row-header')).toBeTruthy();
    });

    it('should render a collapse button', () => {
      const {getByTestId} = renderComponent(createRowMock(), false);
      expect(getByTestId('agileRowCollapseButton')).toBeTruthy();
    });

    it('should render cells', () => {
      const {getByTestId} = renderComponent(createRowMock(), false);
      expect(getByTestId('agileRowCells')).toBeTruthy();
    });

    describe('Issue id', () => {
      const rowMock = createRowMock({
        issue: {
          idReadable: 'X-1',
        },
      });

      it('should not render an issue readable id', () => {
        const {queryByTestId} = renderComponent(createRowMock());
        expect(queryByTestId('agileRowIssueId')).toBeNull();
      });

      it('should render an issue readable id', () => {
        const {getByTestId} = renderComponent(rowMock);
        expect(getByTestId('agileRowIssueId')).toBeTruthy();
      });
    });

    describe('Column', () => {
      it('should render an expanded column', () => {
        const {getByTestId, queryByTestId} = renderComponent(createRowMock());

        expect(getByTestId('agileRowColumn')).toBeTruthy();
        expect(queryByTestId('agileRowColumnCollapsed')).toBeNull();
      });

      describe('Collapsed column', () => {
        const collapsedColumnIdMock = 'columnIdCollapsed';
        let rowWithCollapsedColumnMock: AgileBoardRow;
        beforeEach(() => {
          rowWithCollapsedColumnMock = createRowMock({
            cells: [
              {
                id: '',
                issues: [issueMock],
                column: {
                  id: collapsedColumnIdMock,
                  collapsed: true,
                },
              },
            ],
          });
        });

        it('should render a collapsed column', () => {
          const {queryByTestId} = renderComponent(rowWithCollapsedColumnMock, true, [collapsedColumnIdMock]);

          expect(queryByTestId('agileRowColumn')).toBeNull();
          expect(queryByTestId('agileRowColumnCollapsed')).toBeTruthy();
        });

        it('should render a color-coded rect represents a card', () => {
          const {getByTestId} = renderComponent(rowWithCollapsedColumnMock, true, [collapsedColumnIdMock]);
          expect(getByTestId('agileRowColumnCollapsedCard')).toBeTruthy();
        });
      });
    });

    describe('Row', () => {
      it('should render a row', () => {
        const {getByTestId} = renderComponent(createRowMock({collapsed: false}));
        expect(getByTestId('agileRow')).toBeTruthy();
      });

      it('should not render a collapsed row', () => {
        const {queryByTestId} = renderComponent(createRowMock({collapsed: true}));
        expect(queryByTestId('agileRowColumn')).toBeNull();
      });
    });
  });

  function renderComponent(row: AgileBoardRow, zoomedIn: boolean = true, collapsedColumnIds: string[] = []) {
    const columns = [{}, {}] as BoardColumn[];
    return render(
      <DragContext.Provider
        value={{
          dragging: null,
          registerOnDragStart: () => {},
          registerOnDrag: () => {},
          registerOnDrop: () => {},
          removeZone: () => {},
          onInitiateDrag: () => {},
          dropZones: [],
          updateZone: () => {},
        }}
      >
        <BoardRow
          collapsedColumnIds={collapsedColumnIds}
          columns={columns}
          row={row}
          zoomedIn={zoomedIn}
          uiTheme={DEFAULT_THEME}
          onCollapseToggle={() => {}}
          onTapIssue={() => {}}
          renderIssueCard={() => {}}
          onTapCreateIssue={() => {}}
        />
      </DragContext.Provider>
    );
  }

  function createRowMock(params: object = {}): AgileBoardRow {
    return {
      id: 'rowMockId',
      name: 'orphans',
      summary: 'summary',
      cells: [cellMock],
      ...params,
    } as unknown as AgileBoardRow;
  }
});

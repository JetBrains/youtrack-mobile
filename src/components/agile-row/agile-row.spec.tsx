import React from 'react';
import {shallow} from 'enzyme';
import mocks from '../../../test/mocks';
import BoardRow from './agile-row';
import {buildStyles, DEFAULT_THEME} from '../theme/theme';
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
  let wrapper;
  let issueMock;
  beforeAll(() => buildStyles(DEFAULT_THEME.mode, DEFAULT_THEME));
  beforeEach(() => {
    issueMock = mocks.createIssueMock();
  });
  describe('Render', () => {
    beforeEach(() => {
      doShallow(createRowMock(), false);
    });
    it('should not render a row', () => {
      doShallow(null, false);
      expect(findByTestId('agileRowHeader')).toHaveLength(0);
    });
    it('should not render empty cells', () => {
      doShallow(
        {
          collapsed: false,
        },
        false,
      );
      expect(findByTestId('agileRowCells')).toHaveLength(0);
    });
    it('should not render cells if collapsed', () => {
      doShallow(
        {
          collapsed: true,
          cells: [cellMock],
        },
        false,
      );
      expect(findByTestId('agileRowCells')).toHaveLength(0);
    });
    it('should render a header', () => {
      expect(findByTestId('agile-row-header')).toHaveLength(1);
    });
    it('should render a collapse button', () => {
      expect(findByTestId('agileRowCollapseButton')).toHaveLength(1);
    });
    it('should render cells', () => {
      expect(findByTestId('agileRowCells')).toHaveLength(1);
    });
    describe('Issue id', () => {
      const rowMock = createRowMock({
        issue: {
          idReadable: 'X-1',
        },
      });
      it('should not render an issue readable id', () => {
        expect(findByTestId('agileRowIssueId')).toHaveLength(0);
      });
      it('should render an issue readable id', () => {
        doShallow(rowMock);
        expect(findByTestId('agileRowIssueId')).toHaveLength(1);
      });
    });
    describe('Column', () => {
      it('should render an expanded column', () => {
        expect(findByTestId('agileRowColumn')).toHaveLength(1);
        expect(findByTestId('agileRowColumnCollapsed')).toHaveLength(0);
      });
      describe('Collapsed column', () => {
        beforeEach(() => {
          const collapsedColumnIdMock = 'columnIdCollapsed';
          const rowMock = createRowMock({
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
          doShallow(rowMock, true, [collapsedColumnIdMock]);
        });
        it('should render a collapsed column', () => {
          expect(findByTestId('agileRowColumn')).toHaveLength(0);
          expect(findByTestId('agileRowColumnCollapsed')).toHaveLength(1);
        });
        it('should render a color-coded rect represents a card', () => {
          expect(findByTestId('agileRowColumnCollapsedCard')).toHaveLength(1);
        });
      });
    });
    describe('Row', () => {
      it('should render a row', () => {
        doShallow(
          createRowMock({
            collapsed: false,
          }),
        );
        expect(findByTestId('agileRow')).toHaveLength(1);
      });
      it('should not render a collapsed row', () => {
        doShallow(
          createRowMock({
            collapsed: true,
          }),
        );
        expect(findByTestId('agileRowColumn')).toHaveLength(0);
      });
    });
  });

  function doShallow(
    row,
    zoomedIn: boolean = true,
    collapsedColumnIds: Array<string> | null | undefined = [],
  ) {
    wrapper = shallow(
      <BoardRow
        collapsedColumnIds={collapsedColumnIds}
        columns={[{}, {}]}
        row={row}
        zoomedIn={zoomedIn}
        uiTheme={DEFAULT_THEME}
      />,
    );
  }

  function findByTestId(testId) {
    return (
      wrapper &&
      wrapper.find({
        testID: testId,
      })
    );
  }

  function createRowMock(...args) {
    return Object.assign(
      {
        id: 'rowMockId',
        name: 'orphans',
        summary: 'summary',
        cells: [cellMock],
      },
      ...args,
    );
  }
});
import debouce from 'lodash.debounce';
import {cleanup, screen, fireEvent} from '@testing-library/react-native';

import SelectSectioned from 'components/select/select-sectioned';
import {ISelectProps} from './select';
import {renderTestSelectComponent} from 'components/select/select-spec-helper';

jest.mock('react-native-portalize', () => ({
  Portal: 'View',
}));

jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  FadeIn: {duration: jest.fn()},
}));

jest.mock('lodash.debounce');


describe('<SelectSectioned/>', () => {
  const dataItemsMock = [
    {
      title: 'foo title',
      data: [{name: 'foo'}],
    },
    {
      title: 'bar title',
      data: [{name: 'bar'}],
    },
  ];
  let dataSourceMock: jest.Mock;

  beforeEach(() => {
    dataSourceMock = jest.fn().mockResolvedValue(dataItemsMock);
    (debouce as jest.Mock).mockImplementationOnce((fn: (...args: any[]) => any) => fn);
  });
  afterEach(cleanup);

  it('should render Select', async () => {
    doRender({dataSource: dataSourceMock});

    await expect(screen.getByTestId('test:id/select')).toBeTruthy();
    await expect(screen.getByTestId('test:id/selectInput')).toBeTruthy();
    await expect(screen.getByTestId('test:id/selectListSectioned')).toBeTruthy();
    await expect(screen.getAllByTestId('test:id/selectListItem')).toHaveLength(2);
  });

  it('should filter list items', async () => {
    const queryMock = 'f';
    doRender({
      dataSource: (q) => dataSourceMock(q),
    });
    fireEvent.changeText(screen.getByTestId('test:id/selectInput'), queryMock);

    expect(dataSourceMock).toHaveBeenCalledWith(queryMock);
  });


  function doRender(props: Partial<ISelectProps> = {}) {
    return renderTestSelectComponent({...props, Component: SelectSectioned});
  }

});

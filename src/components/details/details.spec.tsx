import React from 'react';
import {Text} from 'react-native';
import {render, cleanup, fireEvent} from '@testing-library/react-native';
import Details from './details';
import {buildStyles, DEFAULT_THEME} from '../theme/theme';
let rendererMock;
describe('<Details/>', () => {
  beforeAll(() => buildStyles(DEFAULT_THEME.mode, DEFAULT_THEME));
  beforeEach(() => {
    jest.restoreAllMocks();
    rendererMock = jest.fn();
  });
  afterEach(cleanup);
  describe('Render', () => {
    const contentTextMock = 'text';
    it('should render component', async () => {
      const {getByTestId} = doRender(null, rendererMock);
      expect(getByTestId('details').props).toBeDefined();
    });
    it('should show details` content', () => {
      const {getByTestId} = doRender(null, () => (
        <Text testID="content">{contentTextMock}</Text>
      ));
      fireEvent.press(getByTestId('details'));
      expect(getByTestId('content').props.children).toEqual(contentTextMock);
    });
    it('should hide details` content', () => {
      const {getByTestId} = doRender(null, () => (
        <Text testID="content">{contentTextMock}</Text>
      ));
      fireEvent.press(getByTestId('details'));
      fireEvent.press(getByTestId('details'));
      expect(() => getByTestId('content')).toThrow();
    });
  });

  function doRender(title, renderer) {
    return render(<Details title={title} renderer={renderer} />);
  }
});
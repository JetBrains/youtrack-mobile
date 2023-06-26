import React from 'react';
import {render, cleanup, fireEvent} from '@testing-library/react-native';
import Diff from './diff';
import {buildStyles, DEFAULT_THEME} from '../theme/theme';


describe('<Diff/>', () => {
  let text1;
  let text2;
  beforeAll(() => buildStyles(DEFAULT_THEME.mode, DEFAULT_THEME));
  beforeEach(() => {
    jest.restoreAllMocks();
    text1 = 'ABCy';
    text2 = 'xABC';
  });
  afterEach(cleanup);


  describe('Render', () => {
    it('should render component', () => {
      const {getByTestId} = doRender(text1, text2);
      expect(getByTestId('diff').props).toBeDefined();
    });
    it('should render difference', async () => {
      const {getByTestId} = doRender(text1, text2);
      fireEvent.press(getByTestId('details'));
      expect(getByTestId('diffText').props).toBeDefined();
      expect(getByTestId('diffInsert').props).toBeDefined();
      expect(getByTestId('diffDelete').props).toBeDefined();
      expect(getByTestId('diffEqual').props).toBeDefined();
    });
  });

  function doRender(text1, text2, title) {
    return render(<Diff title={title} text1={text1} text2={text2} />);
  }
});

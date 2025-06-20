import React from 'react';

import {cleanup, render, screen} from '@testing-library/react-native';

import AgileCard from './agile-card';
import Mocks from 'test/mocks';
import {DEFAULT_THEME} from 'components/theme/theme';

import {IssueOnListExtended} from 'types/Issue';

describe('<AgileCard/>', () => {
  let issueMock: IssueOnListExtended;

  beforeEach(() => {
    cleanup();
    Mocks.setStorage({});
    issueMock = Mocks.createIssueMock();
  });

  it('should render a card', () => {
    render(<AgileCard issue={issueMock} uiTheme={DEFAULT_THEME}/>);

    expect(screen.getByTestId('test:id/agileCard')).toBeTruthy();
  });

  it('should show summary', () => {
    render(<AgileCard issue={issueMock} uiTheme={DEFAULT_THEME} />);

    expect(screen.getByTestId('test:id/agileCardSummary')).toBeTruthy();
  });
});

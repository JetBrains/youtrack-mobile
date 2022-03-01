import React from 'react';
import { shallow } from 'enzyme';

import AgileCard from './agile-card';
import Mocks from '../../../test/mocks';
import {buildStyles, DEFAULT_THEME} from '../theme/theme';

describe('<AgileCard/>', () => {
  let issueMock;

  beforeAll(() => buildStyles(DEFAULT_THEME.mode, DEFAULT_THEME));

  beforeEach(() => {
    Mocks.setStorage({});
    issueMock = Mocks.createIssueMock();
  });

  it('should init', () => {
    const wrapper = shallow(<AgileCard issue={issueMock} />);

    expect(wrapper).toBeDefined();
  });

  it('should show summary', () => {
    const wrapper = shallow(<AgileCard issue={issueMock} />);
    const summary = wrapper.find({testID: 'card-summary'}).children();

    expect(summary.text()).toEqual(issueMock.summary);
  });
});

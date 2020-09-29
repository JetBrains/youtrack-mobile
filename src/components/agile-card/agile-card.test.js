import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import AgileCard from './agile-card';
import Mocks from '../../../test/mocks';
import {buildStyles} from '../theme/theme';

describe('<AgileCard/>', () => {
  let issueMock;

  beforeAll(() => buildStyles());

  beforeEach(() => {
    Mocks.setStorage({});
    issueMock = Mocks.createIssueMock();
  });

  it('should init', () => {
    const wrapper = shallow(<AgileCard issue={issueMock} />);

    expect(wrapper).toBeDefined();
  });

  it('should render snapshot', () => {
    const tree = shallow(<AgileCard issue={issueMock} />);

    expect(toJson(tree)).toMatchSnapshot();
  });

  it('should show summary', () => {
    const wrapper = shallow(<AgileCard issue={issueMock} />);
    const summary = wrapper.find({testID: 'card-summary'}).children();

    expect(summary.text()).toEqual(issueMock.summary);
  });
});

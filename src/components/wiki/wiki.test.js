import React from 'react';
import {shallow} from 'enzyme';

import Wiki from './wiki';

describe('<Wiki/>', () => {
  it('should init', () => {
    let wrapper = shallow(<Wiki></Wiki>);
    wrapper.should.be.defined;
  });

  it('should render just text', () => {
    let wrapper = shallow(<Wiki>foo bar</Wiki>);
    wrapper.html().should.contain('foo bar')
  });

  it('should render bold text', () => {
    let wrapper = shallow(<Wiki>*foo*</Wiki>);
    const boldTextNode = wrapper.findWhere(component => component.props().style && component.props().style.fontWeight === 'bold');
    boldTextNode.length.should.equal(1);
  });
});

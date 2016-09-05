import React from 'react';
import {shallow} from 'enzyme';
import {COLOR_LIGHT_GRAY} from '../variables/variables';

import Wiki from './wiki';

describe('<Wiki/>', () => {
  it('should init', () => {
    const wrapper = shallow(<Wiki></Wiki>);
    wrapper.should.be.defined;
  });

  it('should render just text', () => {
    const wrapper = shallow(<Wiki>foo bar</Wiki>);
    wrapper.html().should.contain('foo bar');
  });

  it('should render bold text', () => {
    const wrapper = shallow(<Wiki>*foo*</Wiki>);
    const boldTextNode = wrapper.findWhere(component => component.props().style && component.props().style.fontWeight === 'bold');
    boldTextNode.length.should.equal(1);
  });

  it('should render image', () => {
    const wrapper = shallow(<Wiki>!http://example.com/foo.png!</Wiki>);
    const imageNode = wrapper.findWhere(component => component.props().source);
    imageNode.length.should.equal(1);
  });

  it('should parse url', () => {
    const wrapper = shallow(<Wiki>foo bar http://some.url test test</Wiki>);
    const node = wrapper.findWhere(component => component.text() === 'http://some.url');
    node.length.should.equal(1);
  });

  it('should parse [link]', () => {
    const wrapper = shallow(<Wiki>foo bar [http://some.url]</Wiki>);
    const node = wrapper.findWhere(component => component.text() === 'http://some.url');
    node.length.should.equal(1);
    wrapper.html().should.not.contain('[http');
  });

  it('should parse [http://link title]', () => {
    const wrapper = shallow(<Wiki>foo bar [http://some.url title]</Wiki>);
    const node = wrapper.findWhere(component => component.text() === 'title');
    node.length.should.equal(1);
    wrapper.html().should.not.contain('[http');
  });

  it('should parse <link>', () => {
    const wrapper = shallow(<Wiki>{'foo bar <http://some.url>'}</Wiki>);
    const node = wrapper.findWhere(component => component.text() === 'http://some.url');
    node.length.should.equal(1);
    wrapper.html().should.not.contain('<http');
  });

  it('should parse {{monospace}}', () => {
    const wrapper = shallow(<Wiki>{'foo {{monospace}} bar'}</Wiki>);
    const node = wrapper.findWhere(component => component.props().style && component.props().style.fontFamily === 'Courier New');
    node.length.should.equal(1);
  });

  it('should parse inline code', () => {
    const wrapper = shallow(<Wiki>`some code`</Wiki>);
    const node = wrapper.findWhere(component => component.props().style && component.props().style.fontFamily === 'Courier');
    node.length.should.equal(1);
  });

  it('should parse code block', () => {
    const wrapper = shallow(<Wiki>
      ```{'\n'}
      some code{'\n'}
      ```
    </Wiki>);
    const node = wrapper.findWhere(component => component.props().style && component.props().style.backgroundColor === COLOR_LIGHT_GRAY);
    node.length.should.equal(1);
  });
});

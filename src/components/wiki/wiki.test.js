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

  it('should render colored text', () => {
    const wrapper = shallow(<Wiki>{'{color:green}text{color}'}</Wiki>);
    const colorTextNode = wrapper.find({testID: 'color-text'});
    const style = colorTextNode.props().style;

    style.should.contain({color: 'green'});
  });

  it('should render quote', () => {
    const wrapper = shallow(<Wiki>`
    > This is quote
    `</Wiki>);
    wrapper.should.be.defined;
  });

  it('should render HR', () => {
    const wrapper = shallow(<Wiki>----</Wiki>);

    wrapper.find({testID: 'hr'}).length.should.equal(1);
  });

  it('should render first level heading', () => {
    const wrapper = shallow(<Wiki>
    =Level 1 header=
    </Wiki>);

    const title = wrapper.find({testID: 'heading'});
    title.prop('style').should.contain({fontSize: 24});
    title.should.contain.html('Level 1 header');
  });

  it('should render second level heading', () => {
    const wrapper = shallow(<Wiki>
    ==Level 2 header==
    </Wiki>);

    const title = wrapper.find({testID: 'heading'});
    title.prop('style').should.contain({fontSize: 22});
    title.should.contain.html('Level 2 header');
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

  it('should render {noformat}', () => {
    const wrapper = shallow(<Wiki>
      {'{noformat}some text with *markup*{noformat}'}
    </Wiki>);

    wrapper.find({testID: 'noformat'}).children().should.contain.text('some text with *markup*');
  });

  it('should render not numbered list', () => {
    const wrapper = shallow(<Wiki>{`
* first
* second
* third
      `}</Wiki>);

      wrapper.find({testID: 'list-container'}).should.have.length(1);

      const items = wrapper.find({testID: 'list-item'});
      items.should.have.length(3);

      items.first().should.contain.html('• first\n');

  });

      it.skip('should render nested list', () => {
    const wrapper = shallow(<Wiki>{`
* top
*# inline 1
*# inline 2
      `}</Wiki>);

      wrapper.find({testID: 'list-container'}).should.have.length(1);

      const items = wrapper.find({testID: 'list-item'});
      items.should.have.length(3);

      items.at(1).should.contain.html('1 inline 1\n');
  });

    it.skip('should render two lists near', () => {
    const wrapper = shallow(<Wiki>{`
* first
* second

# first numbered
# second numbered
      `}</Wiki>);

      wrapper.find({testID: 'list-container'}).should.have.length(2);

      const items = wrapper.find({testID: 'list-item'});
      items.should.have.length(4);

  });
});

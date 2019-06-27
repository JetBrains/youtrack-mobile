import React from 'react';
import {shallow} from 'enzyme';

import ColorField from '../color-field/color-field';


const fieldBackgroundColorMock = '#000';
const fieldForegroundColorMock = '#FFF';
const fieldTextMock = 'Test custom field';

describe('<ColorField/>', () => {
  let fieldMock;

  beforeEach(() => {
    fieldMock = {
      name: fieldTextMock,
      color: {
        id: 4,
        background: fieldBackgroundColorMock,
        foreground: fieldForegroundColorMock
      }
    };
  });

  it('should render a component', () => {
    const wrapper = doShallow();

    wrapper.should.be.defined;
  });

  it('should not throw an exception if `text` prop is not provided', () => {
    expect(() => doShallow(null)).not.toThrow();
  });


  describe('Render text', () => {
    it('should render first letter of color field', () => {
      const wrapper = doShallow();

      wrapper.find({testID: 'color-field-value'}).children().should.have.text(fieldTextMock[0]);
    });

    it('should render whole text of color field', () => {
      const wrapper = shallow(<ColorField text={fieldMock.name} fullText={true} color={fieldMock.color}/>);

      wrapper.find({testID: 'color-field-value'}).children().should.have.text(fieldMock.name);
    });
  });


  describe('Colorize', () => {
    it('should set background color', () => {
      const container = doShallow().find({testID: 'color-field-value-wrapper'});
      const backgroundColor = container.props().style[1].backgroundColor;

      backgroundColor.should.equal(backgroundColor);
    });

    it('should set foreground color', () => {
      const container = doShallow().find({testID: 'color-field-value'});
      const foregroundColor = container.props().style[1].color;

      foregroundColor.should.equal(fieldForegroundColorMock);
    });
  });


  function doShallow(name = fieldMock.name, color = fieldMock.color, fullText = null) {
    return shallow(<ColorField text={name} color={color} fullText={fullText}/>);
  }
});

import React from 'react';
import {shallow} from 'enzyme';

import ColorField from '../color-field/color-field';

describe('< ColorField / >', () => {

it('should render children when supplied the items prop', () => {
  let field = [
    'test'
  ];
  field.color = {
    fg: 'red',
    bg: 'white'
  }
  let wrapper = shallow(<OurComponent field={field}/>);

  expect(wrapper).to.define;
});

})
;

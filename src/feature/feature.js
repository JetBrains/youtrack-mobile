/* @flow */
/*global __DEV__*/

import {Component} from 'react';

type Props = {
  children: any
};

export default class Feature extends Component<Props, void> {
  render() {
    return __DEV__ ? this.props.children : null;
  }
}

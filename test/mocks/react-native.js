
import React from 'react';

const ReactNative = React;

export const PropTypes = React.PropTypes;

const StyleSheet = {
  create: (style) => style
};

const createComponent = (type) => {
  return React.createClass({
    displayName: type,
    propTypes: {
      children: React.PropTypes.node
    },
    render() {
      return <div {...this.props}>{this.props.children}</div>;
    }
  });
};

const View = createComponent('View');
const Text = createComponent('Text');
const Image = createComponent('Image');

export {StyleSheet, View, Text, Image};

export default ReactNative;


import React from 'react';
import ReactNativeMocks from 'react-native-mock/build/react-native';

function commonRender(props) {
  return <div {...props}>{props.children}</div>;
}

class View extends ReactNativeMocks.View {
  render() {
    return commonRender(this.props);
  }
}

class Text extends ReactNativeMocks.Text {
  render() {
    return commonRender(this.props);
  }
}

class Image extends ReactNativeMocks.Image {
  render() {
    return commonRender(this.props);
  }
}

ReactNativeMocks.View = View;
ReactNativeMocks.Text = Text;
ReactNativeMocks.Image = Image;

module.exports = ReactNativeMocks;

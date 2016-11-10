
import React from 'react';
import ReactNativeMocks from 'react-native-mock/build/react-native';

global.ErrorUtils = {
  getGlobalHandler: () => {},
  setGlobalHandler: () => {}
};

function makeRenderable(componentClass) {
  return class extends componentClass {
    render() {
      return <div>{this.props.children}</div>;
    }
  };
}


ReactNativeMocks.View = makeRenderable(ReactNativeMocks.View);
ReactNativeMocks.Text = makeRenderable(ReactNativeMocks.Text);
ReactNativeMocks.Platform.select = (obj) => obj.ios;

ReactNativeMocks.NativeModules.RNDeviceInfo = {
  uniqueId: 'unique-id',
  userAgent: 'user-agent'
};

module.exports = ReactNativeMocks;

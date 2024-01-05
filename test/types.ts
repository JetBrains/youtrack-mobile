import {ImageStyle, StyleProp, TextStyle, ViewStyle} from 'react-native';

interface JestNativeMatchers<R extends any> {
  toHaveProp(attr: string, value?: unknown): R;
  toHaveStyle(style: StyleProp<ViewStyle | TextStyle | ImageStyle>): R;
}

declare global {
  namespace jest {
    interface Matchers<R> extends JestNativeMatchers<R> {}
  }
}

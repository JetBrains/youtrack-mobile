import React, {PureComponent} from 'react';
import {Modal, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {ThemeContext} from '../theme/theme-context';
import type {ModalOrientation, ModalAnimationType} from 'flow/ModalView';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import {Orientation, AnimationType} from 'flow/ModalView';
import type {Theme} from 'flow/Theme';
type DefaultProps = {
  onRequestClose: () => any;
  supportedOrientations: Array<ModalOrientation>;
  animationType: ModalAnimationType;
};
type Props = {
  visible?: boolean;
  transparent?: boolean;
  animationType?: ModalAnimationType;
  supportedOrientations?: Array<ModalOrientation>;
  onRequestClose?: () => any;
  style?: ViewStyleProp | null | undefined;
  children: any;
  testID?: string;
};
export default class ModalView extends PureComponent<Props, void> {
  static defaultProps: DefaultProps = {
    onRequestClose: () => {},
    supportedOrientations: [Orientation.PORTRAIT, Orientation.LANDSCAPE],
    animationType: AnimationType.NONE,
  };

  render(): React.ReactNode {
    const {
      visible,
      transparent,
      animationType,
      supportedOrientations,
      onRequestClose,
      children,
      style = {},
      testID = 'modalView',
    } = this.props;
    const baseStyle: ViewStyleProp = {
      flex: 1,
    };
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return (
            <Modal
              testID={testID}
              visible={visible}
              transparent={transparent}
              animationType={animationType}
              supportedOrientations={supportedOrientations}
              onRequestClose={onRequestClose}
            >
              <SafeAreaProvider>
                <SafeAreaView
                  style={[
                    baseStyle,
                    transparent === true
                      ? null
                      : {
                          backgroundColor: theme.uiTheme.colors.$background,
                        },
                  ]}
                >
                  <View style={[baseStyle, style]}>{children}</View>
                </SafeAreaView>
              </SafeAreaProvider>
            </Modal>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

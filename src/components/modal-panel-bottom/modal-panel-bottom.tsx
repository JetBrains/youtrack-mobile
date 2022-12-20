import React from 'react';
import Header from '../header/header';
import ModalView from '../modal-view/modal-view';
import {IconClose} from '../icon/icon';
import {Text, View} from 'react-native';
import styles from './modal-panel-bottom.style';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
type Props = {
  children?: any;
  onHide: () => void;
  testID?: string;
  title?: string;
  style?: ViewStyleProp;
};

const ModalPanelBottom = (props: Props) => {
  return (
    <ModalView
      transparent={true}
      animationType="slide"
      testID={props.testID}
      style={styles.container}
    >
      <Header
        style={[
          styles.header,
          !props.title && {
            minHeight: 0,
          },
        ]}
        rightButton={<IconClose size={21} color={styles.link.color} />}
        onRightButtonClick={props.onHide}
      >
        {props.title ? (
          <Text selectable={true} style={styles.title}>
            {props.title}
          </Text>
        ) : null}
      </Header>
      <View style={[styles.content, props.style]}>{props.children}</View>
    </ModalView>
  );
};

export default React.memo<Props>(ModalPanelBottom) as React$AbstractComponent<
  Props,
  unknown
>;
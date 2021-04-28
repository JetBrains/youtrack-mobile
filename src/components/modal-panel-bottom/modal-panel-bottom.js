/* @flow */

import React from 'react';

import Header from '../header/header';
import ModalView from '../modal-view/modal-view';
import {IconClose} from '../icon/icon';
import {Text, View} from 'react-native';

import styles from './modal-panel-bottom.style';

type Props = {
  children?: any,
  onHide: () => void,
  testID?: string,
  title?: string,
}


const ModalPanelBottom = (props: Props) => {
  return (
    <ModalView
      transparent={true}
      animationType="slide"
      testID={props}
      style={styles.container}
    >
      <View style={styles.content}>
        <Header
          leftButton={<IconClose size={21} color={styles.link.color}/>}
          onBack={props.onHide}
        >
          {props.title ? <Text style={styles.title}>{props.title}</Text> : null}
        </Header>

        {props.children}
      </View>
    </ModalView>
  );
};

export default (React.memo<Props>(ModalPanelBottom): React$AbstractComponent<Props, mixed>);

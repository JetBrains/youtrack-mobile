/* @flow */

import React, {useState} from 'react';
import {View, Text, Switch, ScrollView} from 'react-native';

import Header from '../header/header';
import ModalView from '../modal-view/modal-view';
import Router from '../router/router';
import {flushStoragePart, getStorageState} from '../storage/storage';
import {IconClose} from '../icon/icon';

import styles from './feature-view.style';

import type {Node} from 'React';

type Props = {
  onHide?: Function,
};


const FeaturesDebugSettings = (props: Props): Node => {
  const {onHide = () => Router.pop(true)} = props;
  const getForceHandsetMode: () => boolean = (): boolean => !!getStorageState().forceHandsetMode;

  const [forceHandsetMode, updateForceHandsetMode] = useState(getForceHandsetMode());

  return (
    <ModalView
      animationType="slide"
    >
      <View style={styles.container}>
        <Header
          showShadow={true}
          leftButton={<IconClose size={21} color={styles.closeButton.color} style={styles.closeButton}/>}
          onBack={onHide}
          title="Debug settings"
        />

        <ScrollView>
          <View
            style={styles.featuresListItem}
          >
            <Text
              style={styles.featuresListItemText}
            >
              Force handset mode
            </Text>
            <Switch
              value={forceHandsetMode}
              onValueChange={async () => {
                await flushStoragePart({forceHandsetMode: !forceHandsetMode});
                updateForceHandsetMode(!forceHandsetMode);
              }}
            />
          </View>
        </ScrollView>
      </View>
    </ModalView>
  );
};

export default FeaturesDebugSettings;

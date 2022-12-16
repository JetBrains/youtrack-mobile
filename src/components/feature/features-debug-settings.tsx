/* @flow */

import React, {useState} from 'react';
import {View, Text, Switch, ScrollView, TouchableOpacity} from 'react-native';

import Header from '../header/header';
import ModalView from '../modal-view/modal-view';
import Router from '../router/router';
import {clearCachesAndDrafts, flushStoragePart, getStorageState} from '../storage/storage';
import {confirmation} from '../confirmation/confirmation';
import {IconClose} from '../icon/icon';
import {notify} from '../notification/notification';

import styles from './feature-view.style';

import type {Node} from 'react';

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
          <View
            style={styles.featuresListItem}
          >
            <TouchableOpacity
              onPress={() => {
                confirmation('Clear cached data?', 'Clear now').then(async () => {
                  await clearCachesAndDrafts();
                  notify('Storage cleared');
                });
              }}
            >
              <Text style={styles.button}>Clear storage</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ModalView>
  );
};

export default FeaturesDebugSettings;

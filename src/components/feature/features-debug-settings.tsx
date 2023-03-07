import * as React from 'react';
import {View, Text, Switch, ScrollView, TouchableOpacity} from 'react-native';

import Header from 'components/header/header';
import ModalView from 'components/modal-view/modal-view';
import Router from 'components/router/router';
import {
  clearCachesAndDrafts,
  flushStoragePart,
  getStorageState,
} from 'components/storage/storage';
import {confirmation} from 'components/confirmation/confirmation';
import {IconClose} from 'components/icon/icon';
import {notify} from 'components/notification/notification';

import styles from './feature-view.style';

type Props = {
  onHide?: (...args: any[]) => any;
};

const FeaturesDebugSettings = (props: Props): React.ReactNode => {
  const {onHide = () => Router.pop(true)} = props;

  const [featuresState, updateFeaturesState] = React.useState<{
    forceHandsetMode: boolean,
    noTabsNotifications: boolean,
  }>({
    forceHandsetMode: !!getStorageState().forceHandsetMode,
    noTabsNotifications: !!getStorageState().noTabsNotifications,
  });

  return (
    <ModalView animationType="slide">
      <View style={styles.container}>
        <Header
          showShadow={true}
          leftButton={
            <IconClose
              size={21}
              color={styles.closeButton.color}
              style={styles.closeButton}
            />
          }
          onBack={onHide}
          title="Debug settings"
        />

        <ScrollView>
          <View style={styles.featuresListItem}>
            <Text style={styles.featuresListItemText}>Force handset mode</Text>
            <Switch
              value={featuresState.forceHandsetMode}
              onValueChange={async () => {
                await flushStoragePart({forceHandsetMode: !featuresState.forceHandsetMode});
                updateFeaturesState(state => ({...state, forceHandsetMode: !featuresState.forceHandsetMode}));
              }}
            />
          </View>
          <View style={styles.featuresListItem}>
            <Text style={styles.featuresListItemText}>Non-tab Notifications</Text>
            <Switch
              value={featuresState.noTabsNotifications}
              onValueChange={async () => {
                await flushStoragePart({noTabsNotifications: !featuresState.noTabsNotifications});
                updateFeaturesState(state => (
                  {...state, noTabsNotifications: !featuresState.noTabsNotifications})
                );
              }}
            />
          </View>
          <View style={styles.featuresListItem}>
            <TouchableOpacity
              onPress={() => {
                confirmation('Clear cached data?', 'Clear now').then(
                  async () => {
                    await clearCachesAndDrafts();
                    notify('Storage cleared');
                  },
                );
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

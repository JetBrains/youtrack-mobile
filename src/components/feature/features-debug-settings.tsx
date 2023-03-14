import * as React from 'react';
import {View, Text, Switch, ScrollView, TouchableOpacity} from 'react-native';

import Header from 'components/header/header';
import ModalView from 'components/modal-view/modal-view';
import Router from 'components/router/router';
import {
  clearCachesAndDrafts,
  flushStoragePart,
  getStorageState, InboxThreadsCache,
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
    mergedNotifications: boolean,
  }>({
    forceHandsetMode: !!getStorageState().forceHandsetMode,
    mergedNotifications: !!getStorageState().mergedNotifications,
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
            <Text style={styles.featuresListItemText}>Merged Notifications</Text>
            <Switch
              value={featuresState.mergedNotifications}
              onValueChange={async () => {
                const inboxThreadsCache: InboxThreadsCache | null = getStorageState().inboxThreadsCache;
                await flushStoragePart({
                  mergedNotifications: !featuresState.mergedNotifications,
                  inboxThreadsCache: {
                    unreadOnly: inboxThreadsCache?.unreadOnly,
                    lastVisited: inboxThreadsCache?.lastVisited,
                  },
                });
                updateFeaturesState(state => (
                  {...state, mergedNotifications: !featuresState.mergedNotifications})
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

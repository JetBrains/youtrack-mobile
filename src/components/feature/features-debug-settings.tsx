import * as React from 'react';
import {View, Text, Pressable, Switch, ScrollView} from 'react-native';

import Header from 'components/header/header';
import ModalView from 'components/modal-view/modal-view';
import Router from 'components/router/router';
import {
  clearCachesAndDrafts,
  flushStoragePart,
  getStorageState,
  InboxThreadsCache,
  populateStorage,
  StorageState,
} from 'components/storage/storage';
import {confirmation} from 'components/confirmation/confirmation';
import {IconClose} from 'components/icon/icon';
import {notify} from 'components/notification/notification';

import styles from './feature-view.style';

type Props = {
  onHide?: (...args: any[]) => any;
};

interface State {
  forceHandsetMode: boolean | null;
  mergedNotifications: boolean | null;
}

const FeaturesDebugSettings = (props: Props) => {
  const {onHide = () => Router.pop(true)} = props;

  const getState = (): State => {
    const storageState = getStorageState();
    return {forceHandsetMode: storageState.forceHandsetMode, mergedNotifications: storageState.mergedNotifications};
  };

  const [featuresState, updateFeaturesState] = React.useState<State>(getState());

  const toggleStorageValue = async (name: keyof State, storageExtraData: Partial<StorageState> = {}) => {
    await flushStoragePart({
      [name]: !featuresState[name],
      ...storageExtraData,
    });
    updateFeaturesState(state => ({...state, [name]: !featuresState[name]}));
  };

  const features = [
    {
      text: 'Force handset mode',
      value: featuresState.forceHandsetMode,
      onValueChange: async () => {
        await toggleStorageValue('forceHandsetMode');
      },
    },
    {
      text: 'Merged notifications',
      value: featuresState.mergedNotifications,
      onValueChange: async () => {
        const inboxThreadsCache: InboxThreadsCache | null = getStorageState().inboxThreadsCache;
        await toggleStorageValue('mergedNotifications', {
          inboxThreadsCache: {
            ...inboxThreadsCache,
            unreadOnly: !!inboxThreadsCache?.unreadOnly,
            lastVisited: inboxThreadsCache?.lastVisited || 0,
          },
        });
      },
    },
  ];

  const renderSwitchItem = ({
    value,
    text,
    onValueChange,
  }: {
    value: boolean | null;
    text: string;
    onValueChange: (value: boolean) => Promise<void>;
  }) => {
    return (
      <View style={styles.featuresListItem} key={text}>
        <Text style={styles.featuresListItemText}>{text}</Text>
        <Switch value={!!value} onValueChange={onValueChange} />
      </View>
    );
  };

  return (
    <ModalView>
      <View style={styles.container}>
        <Header
          showShadow={true}
          leftButton={<IconClose color={styles.closeButton.color} style={styles.closeButton} />}
          onBack={onHide}
          title="Debug settings"
        />

        <ScrollView>
          {features.map(renderSwitchItem)}
          <View style={styles.featuresListItem}>
            <Pressable
              onPress={() => {
                confirmation('Clear cached data?', 'Clear now').then(async () => {
                  await clearCachesAndDrafts();
                  await populateStorage();
                  notify('Storage cleared');
                  updateFeaturesState(getState());
                });
              }}
            >
              <Text style={styles.button}>Clear storage</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </ModalView>
  );
};

export default FeaturesDebugSettings;

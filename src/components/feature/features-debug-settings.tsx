import React from 'react';
import {View, Text, Switch, ScrollView} from 'react-native';

import Header from 'components/header/header';
import ModalView from 'components/modal-view/modal-view';
import Router from 'components/router/router';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {IconClose} from 'components/icon/icon';

import type {InboxThreadsCache, StorageState} from 'components/storage/storage';

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

  const toggleStorageValue = async (name: keyof State, data: Partial<StorageState> = {}) => {
    await flushStoragePart({
      [name]: !featuresState[name],
      ...data,
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

        <ScrollView>{features.map(renderSwitchItem)}</ScrollView>
      </View>
    </ModalView>
  );
};

export default FeaturesDebugSettings;

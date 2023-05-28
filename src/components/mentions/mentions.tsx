import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Avatar from 'components/avatar/avatar';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';

import styles from './mentions.styles';

import type {User} from 'types/User';

type Props = {
  isLoading: boolean;
  mentions:
    | {
        users: User[];
      }
    | null
    | undefined;
  onApply: (user: User) => any;
  style?: Record<string, any>;
};


export default function Mentions(props: Props): JSX.Element {
  const AVATAR_SIZE: number = 24;
  const {mentions, isLoading, onApply, style} = props;
  return (
    <ScrollView
      style={style}
      contentContainerStyle={styles.suggestionsContainer}
      keyboardShouldPersistTaps="always"
    >
      <>
        {(mentions?.users || []).map(user => {
          return (
            <TouchableOpacity
              key={user.id}
              style={styles.suggestionItem}
              onPress={() => onApply(user)}
            >
              <Avatar
                userName={user.fullName}
                size={AVATAR_SIZE}
                source={{
                  uri: user.avatarUrl,
                }}
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE,
                }}
              />
              <Text style={styles.suggestionName}>{user.login}</Text>
              <Text style={styles.suggestionDescription}>
                {' '}
                {getEntityPresentation(user)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </>

      {isLoading && (
        <View style={styles.suggestionsLoadingMessage}>
          <ActivityIndicator color={styles.link.color} />
        </View>
      )}
    </ScrollView>
  );
}

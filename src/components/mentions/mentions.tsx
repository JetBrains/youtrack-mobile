import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Avatar from '../avatar/avatar';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import styles from './mentions.styles';
import type {User} from 'flow/User';
import type {ViewStyleProp} from 'flow/Internal';
type Props = {
  isLoading: boolean;
  mentions:
    | {
        users: Array<User>;
      }
    | null
    | undefined;
  onApply: (user: User) => any;
  style?: ViewStyleProp;
};
export default function Mentions(props: Props): React.ReactNode {
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

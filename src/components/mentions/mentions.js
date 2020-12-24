/* @flow */

import React from 'react';
import {View, Text, ActivityIndicator, ScrollView} from 'react-native';

import {TouchableOpacity} from 'react-native-gesture-handler';

import Avatar from '../avatar/avatar';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';

import styles from './mentions.styles';

import type {User} from '../../flow/User';

type Props = {
  isLoading: boolean,
  mentions: ?{ users: Array<User> },
  onApply: (user: User) => any
};


export default function Mentions(props: Props) {
  const AVATAR_SIZE: number = 24;
  const {mentions, isLoading, onApply} = props;

  return (
    <ScrollView
      contentContainerStyle={styles.suggestionsContainer}
      keyboardShouldPersistTaps="handled"
    >

      <View style={styles.suggestionsLoadingMessage}>
        {isLoading && !mentions && <ActivityIndicator color={styles.link.color}/>}
      </View>

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
                source={{uri: user.avatarUrl}}
                style={{
                  width: AVATAR_SIZE,
                  height: AVATAR_SIZE
                }}/>
              <Text style={styles.suggestionName}>{user.login}</Text>
              <Text style={styles.suggestionDescription}> {getEntityPresentation(user)}</Text>
            </TouchableOpacity>
          );
        })
        }

      </>

    </ScrollView>
  );
}

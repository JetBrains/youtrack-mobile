import React from 'react';
import {Text, View} from 'react-native';

import styles from './helpdesk-feedback.styles';

import {FeedbackFormReporter} from 'views/helpdesk-feedback';

import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import Avatar from 'components/avatar/avatar';

const HelpDeskFeedbackReporterOption = ({user}: {user: FeedbackFormReporter}) => {
  const avatarUrl = user.profile.avatar.url;
  return (
    <View style={styles.selectUserOption}>
      {!!avatarUrl && <Avatar size={32} source={{uri: avatarUrl}} userName={user.name} />}
      <View style={styles.selectUserOptionInfo}>
        <Text style={styles.text}>{getEntityPresentation(user)}</Text>
        {!!user.profile?.email?.email && (
          <View>
            <Text numberOfLines={2} style={styles.selectText}>{user.profile.email.email}</Text>
          </View>
        )}
      </View>
      <View style={styles.selectUserDescription}>
        <Text numberOfLines={2} style={[styles.selectText, styles.selectUserDescriptionText]}>{user.login}</Text>
      </View>
    </View>
  );
};

export default HelpDeskFeedbackReporterOption;

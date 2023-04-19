import React from 'react';
import {Clipboard, Linking, Text, TouchableOpacity, View} from 'react-native';

import Avatar from 'components/avatar/avatar';
import ImageWithProgress from 'components/image/image-with-progress';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconClone} from 'components/icon/icon';
import {notify} from 'components/notification/notification';
import {useUserCardAsync} from 'components/hooks/use-user-card-async';

import styles from './user-card.styles';

import {User} from 'types/User';
import {getStorageState} from 'components/storage/storage';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import {usePermissions} from 'components/hooks/use-permissions';


const UserCard = ({
  user,
  onShowReportedIssues,
  onMention,
}: {
  user: User,
  onShowReportedIssues?: (query: string) => void,
  onMention?: (userLogin: string) => void,
}): JSX.Element | null => {
  const issuePermissions: IssuePermissions = usePermissions();
  const canReadUserBasic: boolean = !!issuePermissions?.canReadUserBasic?.(user);
  const canReadUser: boolean = !!issuePermissions?.canReadUser?.(user);

  const loadedUser: User | null = useUserCardAsync(user.id);
  const serverURL: string | undefined = getStorageState()?.config?.backendUrl;
  const usr: User = {...loadedUser, ...user};

  return canReadUserBasic || canReadUser ? (
    <View
      testID="test:id/userCard"
      accessibilityLabel="userCard"
      accessible={true}
      style={styles.container}
    >
      <View style={styles.generalInfo}>
        <View>
          <View style={styles.avatar}>
            <Avatar
              userName={usr.name}
              style={styles.avatarImage}
              source={{uri: usr.avatarUrl}}
              size={64}
            />
          </View>
          {!!usr.issueRelatedGroup?.icon && (
            <ImageWithProgress
              testID="test:id/userCardRelatedGroup"
              accessibilityLabel="userCardRelatedGroup"
              accessible={true}
              style={styles.groupIcon}
              source={{uri: usr.issueRelatedGroup?.icon}}
            />
          )}
        </View>
        <Text
          testID="test:id/userCardName"
          accessibilityLabel="userCardName"
          accessible={true}
          onPress={() => {
            if (serverURL) {
              Linking.openURL(`${serverURL}/users/${usr.login}`);
            }
          }}
          style={styles.userName}
          selectable={true}
        >
          {getEntityPresentation(usr)}
        </Text>
        <Text
          style={styles.label}
          selectable={true}
        >
          {usr?.login}
        </Text>
      </View>

      {!!usr?.email && canReadUser && <>
        <Text style={styles.label}>{i18n('Email')}</Text>
        <View style={styles.blockInfo}>
          <Text
            testID="test:id/userCardEmail"
            accessibilityLabel="userCardEmail"
            accessible={true}
            style={styles.text}
            selectable={true}
          >
            {usr?.email}
          </Text>
          <TouchableOpacity
            hitSlop={HIT_SLOP}
            disabled={!usr?.email}
            onPress={() => {
              Clipboard.setString(usr.email as string);
              notify(i18n('Copied'));
            }}
          >
            <IconClone
              size={14}
              color={styles.iconCopy.color}
            />
          </TouchableOpacity>
        </View>
      </>}

      {!!usr.login && onShowReportedIssues && (
        <TouchableOpacity
          testID="test:id/userCardReportedIssuesButton"
          accessibilityLabel="userCardReportedIssuesButton"
          accessible={true}
          onPress={() => onShowReportedIssues(`created by: ${usr.login}`)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {i18n('View reported issues')}
          </Text>
        </TouchableOpacity>
      )}

      {typeof onMention === 'function' && (
        <TouchableOpacity
          testID="test:id/userCardMentionButton"
          accessibilityLabel="userCardMentionButton"
          accessible={true}
          onPress={() => onMention(`@${usr.login} `)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {i18n('@Mention in a comment')}
          </Text>
        </TouchableOpacity>
      )}

    </View>
  ) : null;
};


export default React.memo(UserCard);

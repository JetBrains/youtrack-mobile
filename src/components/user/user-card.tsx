import React from 'react';
import {Clipboard, Linking, Text, TouchableOpacity, View} from 'react-native';

import Avatar from 'components/avatar/avatar';
import ImageWithProgress from 'components/image/image-with-progress';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {getStorageState} from 'components/storage/storage';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconClone} from 'components/icon/icon';
import {notify} from 'components/notification/notification';
import {useBottomSheetContext} from 'components/bottom-sheet';
import {usePermissions} from 'components/hooks/use-permissions';
import {useUserCardAsync} from 'components/hooks/use-user-card-async';

import styles from './user-card.styles';

import {User} from 'types/User';


const UserCard = ({user, onMention}: { user: User, onMention?: (userLogin: string) => void}): JSX.Element | null => {
  const {closeBottomSheet} = useBottomSheetContext();
  const issuePermissions: IssuePermissions = usePermissions();
  const canReadUserBasic: boolean = !!issuePermissions?.canReadUserBasic?.(user);
  const canReadUser: boolean = !!issuePermissions?.canReadUser?.(user);

  const loadedUser: User | null = useUserCardAsync(user.id);
  const usr: User = {...loadedUser, ...user};

  React.useEffect(() => {
    usage.trackEvent('Show user card');
  }, []);

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
            usage.trackEvent('User card: press visit profile');
            const serverURL: string | undefined = getStorageState()?.config?.backendUrl;
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

      {!!usr.login && (
        <TouchableOpacity
          testID="test:id/userCardReportedIssuesButton"
          accessibilityLabel="userCardReportedIssuesButton"
          accessible={true}
          onPress={() => {
            usage.trackEvent('User card: view reported issues');
            Router.Issues({searchQuery: `created by: ${usr.login}`});
            closeBottomSheet();
          }}
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
          onPress={() => {
            usage.trackEvent('User card: mention in a comment');
            onMention(`@${usr.login} `);
          }}
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

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import IssuePermissions from 'components/issue-permissions/issue-permissions';
import StreamTimestamp from './activity__stream-timestamp';
import UserCard from 'components/user/user-card';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {useBottomSheetContext} from 'components/bottom-sheet';
import {usePermissions} from 'components/hooks/use-permissions';

import styles from './activity__stream.styles';

import type {Activity} from 'types/Activity';
import {User} from 'types/User';


const StreamUserInfo = ({activityGroup}: { activityGroup: Activity }): JSX.Element => {
  const issuePermissions: IssuePermissions = usePermissions();

  const getUser = (): User => activityGroup.author;
  const canReadCard: boolean = (
    issuePermissions?.canReadUserBasic?.(getUser()) ||
    issuePermissions?.canReadUser?.(getUser())
  );

  const {openBottomSheet} = useBottomSheetContext();

  return (
    <TouchableOpacity
      disabled={!canReadCard}
      style={styles.activityAuthor}
      onPress={() => {
        openBottomSheet({
          withHandle: false,
          children: <UserCard user={getUser()}/>,
        });
      }}
    >
      <Text style={styles.activityAuthorName}>
        {getEntityPresentation(getUser())}
      </Text>
      {!!activityGroup.timestamp && <StreamTimestamp timestamp={activityGroup.timestamp}/>}
    </TouchableOpacity>
  );
};


export default React.memo(StreamUserInfo);

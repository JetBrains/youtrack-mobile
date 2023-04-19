import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {useDispatch} from 'react-redux';

import IssuePermissions from 'components/issue-permissions/issue-permissions';
import Router from 'components/router/router';
import StreamTimestamp from './activity__stream-timestamp';
import UserCard from 'components/user/user-card';
import {addMentionToDraftComment} from 'actions/app-actions';
import {DraftCommentData} from 'types/CustomFields';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {useBottomSheetContext} from 'components/bottom-sheet';
import {usePermissions} from 'components/hooks/use-permissions';

import styles from './activity__stream.styles';

import type {Activity} from 'types/Activity';
import {User} from 'types/User';
import {useCardData} from 'components/hooks/use-card-data';
import {AnyIssue} from 'types/Issue';
import {Article} from 'types/Article';


const StreamUserInfo = ({activityGroup}: { activityGroup: Activity }): JSX.Element => {
  const dispatch = useDispatch();
  const issuePermissions: IssuePermissions = usePermissions();
  const data: DraftCommentData = useCardData();

  const getUser = (): User => activityGroup.author;
  const canComment = (): boolean => (
    !!data?.entity && (
      issuePermissions.canCommentOn(data.entity as AnyIssue) ||
      issuePermissions.articleCanCommentOn(data.entity as Article)
    )
  );
  const getUserName = (): string => getEntityPresentation(getUser());
  const canReadCard: boolean = (
    issuePermissions?.canReadUserBasic?.(getUser()) ||
    issuePermissions?.canReadUser?.(getUser())
  );


  const {openBottomSheet, closeBottomSheet} = useBottomSheetContext();

  const onShowUserCard = () => {
    openBottomSheet({
      withHandle: false,
      children: (
        <UserCard
          user={getUser()}
          onShowReportedIssues={(searchQuery: string) => {
            closeBottomSheet();
            Router.Issues({searchQuery});
          }}
          onMention={canComment() ? async () => {
            closeBottomSheet();
            dispatch(addMentionToDraftComment(getUser().login));
          } : undefined}
        />
      ),
    });
  };

  return (
    <TouchableOpacity
      disabled={!canReadCard}
      style={styles.activityAuthor}
      onPress={onShowUserCard}
    >
      <Text style={styles.activityAuthorName}>
        {getUserName()}
      </Text>
      {!!activityGroup.timestamp && <StreamTimestamp timestamp={activityGroup.timestamp}/>}
    </TouchableOpacity>
  );
};


export default React.memo(StreamUserInfo);

/* @flow */

import React, {useEffect, useState} from 'react';

import ReactionsPanel from './issue__activity-reactions-dialog';
import usage from '../../../components/usage/usage';
import {ActivityStream} from '../../../components/activity-stream/activity__stream';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../../../components/analytics/analytics-ids';
import {SkeletonIssueActivities} from '../../../components/skeleton/skeleton';

import type {ActivityStreamProps, ActivityStreamPropsReaction} from '../../../components/activity-stream/activity__stream';
import type {IssueComment} from '../../../flow/CustomFields';
import type {Reaction} from '../../../flow/Reaction';

type Props = ActivityStreamProps & {
  issueId: string
};


const IssueActivityStream = (props: Props) => {
  const [reactionState, setReactionState] = useState({
    isReactionsPanelVisible: false,
    currentComment: null,
  });

  const [activities, setActivities] = useState(null);
  useEffect(() => {
    setActivities(props.activities);
  });

  const selectReaction = (comment: IssueComment, reaction: Reaction) => {
    usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Add reaction to comment');
    hideReactionsPanel();
    // $FlowFixMe
    return props.onReactionSelect(props.issueId, comment, reaction, props.activities, (activities, error) => {
      if (!error) {
        setActivities(activities);
      }
    });
  };

  const hideReactionsPanel = () => setReactionState({isReactionsPanelVisible: false, currentComment: null});

  if (!props.activities) {
    return <SkeletonIssueActivities/>;
  }
  return (
    <>
      <IssueStream
        {...props}
        activities={activities}
        onReactionPanelOpen={(comment: IssueComment) => {
          setReactionState({
            isReactionsPanelVisible: true,
            currentComment: comment,
          });
        }}
        onSelectReaction={selectReaction}
      />

      {reactionState.isReactionsPanelVisible && (
        <ReactionsPanel
          onSelect={(reaction: Reaction) => {
            selectReaction(reactionState.currentComment, reaction);
          }}
          onHide={hideReactionsPanel}
        />
      )}
    </>
  );
};

const isActivitiesEqual = (prev, next): boolean => {
  return !!prev && !!next && prev.activities === next.activities;
};

export const IssueStream = React.memo<ActivityStreamProps & ActivityStreamPropsReaction>(
  ActivityStream, isActivitiesEqual
);
export default React.memo<Props>(IssueActivityStream, isActivitiesEqual);


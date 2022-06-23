/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import Diff from 'components/diff/diff';
import getEventTitle from 'components/activity/activity__history-title';
import Star from 'components/star/star';
import StreamAttachments from './activity__stream-attachment';
import StreamHistoryTextChange from './activity__stream-history__text-change';
import StreamLink from './activity__stream-link';
import {DEFAULT_WORK_TIME_SETTINGS} from 'components/time-tracking/time-tracking__default-settings';
import {getActivityEventTitle} from './activity__stream-helper';
import {getTextValueChange} from 'components/activity/activity__history-value';
import {i18n} from 'components/i18n/i18n';
import {isActivityCategory} from 'components/activity/activity__category';
import {UNIT} from 'components/variables/variables';

import styles from './activity__stream.styles';

import type {Activity, ActivityChangeText} from 'flow/Activity';
import type {CustomField} from 'flow/CustomFields';
import type {TextValueChangeParams} from 'components/activity/activity__history-value';
import type {WorkTimeSettings} from 'flow/Work';

type Props = {
  activity: Activity,
  customFields?: CustomField[],
  workTimeSettings?: WorkTimeSettings,
}

const renderAttachmentChange = (activity: Object) => {
  const removed: Array<any> = activity.removed || [];
  const added: Array<any> = activity.added || [];
  const addedAndLaterRemoved: Array<any> = added.filter(it => !it.url);
  const addedAndAvailable: Array<any> = added.filter(it => it.url);
  const hasAddedAttachments: boolean = addedAndAvailable.length > 0;

  return (
    <View key={activity.id}>
      {hasAddedAttachments && (
        <StreamAttachments attachments={addedAndAvailable}/>
      )}
      {addedAndLaterRemoved.length > 0 && addedAndLaterRemoved.map(
        it => <Text style={styles.activityAdded} key={it.id}>{it.name}</Text>
      )}

      {removed.length > 0 &&
        <Text style={hasAddedAttachments && {marginTop: UNIT / 2}}>{activity.removed.map((it, index) =>
          <Text key={it.id}>
            {index > 0 && ', '}
            <Text style={styles.activityRemoved}>{it.name}</Text>
          </Text>
        )}
        </Text>}
    </View>
  );
};


const StreamHistoryChange = ({activity, customFields, workTimeSettings = DEFAULT_WORK_TIME_SETTINGS}: Props) => {
  const getTextChange = (activity: Activity, issueFields: ?Array<Object>): ActivityChangeText => {
    const getParams = (isRemovedValue: boolean): TextValueChangeParams => ({
      activity,
      issueFields,
      workTimeSettings,
      isRemovedValue,
    });

    return {
      added: getTextValueChange(getParams(false)),
      removed: getTextValueChange(getParams(true)),
    };
  };

  const renderTextValueChange = (activity: Activity, issueFields?: Array<Object>) => {
    const textChange: ActivityChangeText = getTextChange(activity, issueFields);
    const isTextDiff: boolean = (
      isActivityCategory.description(activity) ||
      isActivityCategory.summary(activity)
    );

    return (
      <View style={styles.activityTextValueChange}>
        {isTextDiff && (
          <Diff
            title={getEventTitle(activity, true)}
            text1={textChange.removed}
            text2={textChange.added}
          />
        )}
        {!isTextDiff && <StreamHistoryTextChange activity={activity} textChange={textChange}/>}
      </View>
    );
  };

  const renderVotesChange = (activity: Activity) => {
    const votesBefore: number = activity.removed ? parseInt(activity.removed) : 0;
    const votesAfter: number = activity.added ? parseInt(activity.added) : 0;
    const isAdded: boolean = votesAfter > votesBefore;

    return (
      <View style={styles.activityTextValueChange}>
        <Text style={styles.activityAdded}>
          {isAdded ? '+' : '-'}1. {i18n('Total votes')}: {votesAfter}
        </Text>
      </View>
    );
  };

  const renderActivityByCategory = (activity: Activity) => {
    switch (true) {
    case Boolean(isActivityCategory.star(activity)):
      return (
        <Text>
          <Text style={styles.activityLabel}>{getActivityEventTitle(activity)}</Text>
          <Star
            style={styles.activityStarTagIcon}
            size={16}
            canStar={true}
            hasStar={!!activity.added?.length}
            onStarToggle={() => {}}
          />
        </Text>
      );
    case Boolean(
      isActivityCategory.tag(activity) ||
      isActivityCategory.customField(activity) ||
      isActivityCategory.sprint(activity) ||
      isActivityCategory.work(activity) ||
      isActivityCategory.description(activity) ||
      isActivityCategory.summary(activity) ||
      isActivityCategory.project(activity) ||
      isActivityCategory.issueResolved(activity)
    ):
      return renderTextValueChange(activity, customFields);
    case Boolean(isActivityCategory.link(activity)):
      return <StreamLink activity={activity}/>;
    case Boolean(isActivityCategory.attachment(activity)):
      return renderAttachmentChange(activity);
    case Boolean(isActivityCategory.visibility(activity)):
      return <StreamHistoryTextChange activity={activity} textChange={getTextChange(activity, [])}/>;
    case Boolean(isActivityCategory.totalVotes(activity)):
      return renderVotesChange(activity);
    }
    return null;
  };

  return <View style={styles.activityChange}>{renderActivityByCategory(activity)}</View>;
};

export default StreamHistoryChange;

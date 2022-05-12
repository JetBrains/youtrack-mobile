/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import Diff from 'components/diff/diff';
import getEventTitle from 'components/activity/activity__history-title';
import StreamAttachments from './activity__stream-attachment';
import StreamHistoryTextChange from './activity__stream-history__text-change';
import StreamLink from './activity__stream-link';
import {DEFAULT_WORK_TIME_SETTINGS} from 'components/time-tracking/time-tracking__default-settings';
import {getTextValueChange} from 'components/activity/activity__history-value';
import {isActivityCategory} from 'components/activity/activity__category';
import {UNIT} from 'components/variables/variables';

import styles from './activity__stream.styles';

import type {Activity, ActivityChangeText} from 'flow/Activity';
import type {TextValueChangeParams} from 'components/activity/activity__history-value';
import type {WorkTimeSettings} from 'flow/Work';

type Props = {
  activity: Activity,
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


const StreamHistoryChange = ({activity, workTimeSettings = DEFAULT_WORK_TIME_SETTINGS}: Props) => {
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

  const renderActivityByCategory = (activity: Activity) => {
    switch (true) {
    case Boolean(
      isActivityCategory.tag(activity) ||
      isActivityCategory.customField(activity) ||
      isActivityCategory.sprint(activity) ||
      isActivityCategory.work(activity) ||
      isActivityCategory.description(activity) ||
      isActivityCategory.summary(activity) ||
      isActivityCategory.project(activity)
    ):
      return renderTextValueChange(activity);
    case Boolean(isActivityCategory.link(activity)):
      return <StreamLink activity={activity}/>;
    case Boolean(isActivityCategory.attachment(activity)):
      return renderAttachmentChange(activity);
    case Boolean(isActivityCategory.visibility(activity)):
      return <StreamHistoryTextChange activity={activity} textChange={getTextChange(activity, [])}/>;
    }
    return null;
  };

  return <View style={styles.activityChange}>{renderActivityByCategory(activity)}</View>;
};

export default StreamHistoryChange;

import React from 'react';
import {Text} from 'react-native';
import CustomFieldChangeDelimiter from '../custom-field/custom-field__change-delimiter';
import {getActivityEventTitle} from './activity__stream-helper';
import {isActivityCategory} from '../activity/activity__category';
import styles from './activity__stream.styles';
import type {Activity, ActivityChangeText} from 'types/Activity';

const isMultiValueActivity = (activity: Activity) => {
  if (isActivityCategory.customField(activity)) {
    const field = activity.field;

    if (!field) {
      return false;
    }

    return (
      field.customField &&
      field.customField.fieldType &&
      field.customField.fieldType.isMultiValue
    );
  }

  if (
    Array.isArray(activity?.added)
      ? activity?.added?.length > 1
      : Array.isArray(activity?.removed)
      ? activity?.removed?.length > 1
      : false
  ) {
    return true;
  }

  return false;
};

const StreamHistoryTextChange = ({
  activity,
  textChange,
}: {
  activity: Activity;
  textChange: ActivityChangeText;
}) => {
  const isMultiValue: boolean = isMultiValueActivity(activity);
  return (
    <Text>
      <Text style={styles.activityLabel}>
        {getActivityEventTitle(activity)}
      </Text>

      <Text
        style={[
          styles.activityText,
          isMultiValue || (textChange.removed && !textChange.added)
            ? styles.activityRemoved
            : null,
        ]}
      >
        {textChange.removed}
      </Text>

      {Boolean(textChange.removed && textChange.added) && (
        <Text style={styles.activityText}>
          {isMultiValue ? ', ' : CustomFieldChangeDelimiter}
        </Text>
      )}

      <Text style={styles.activityText}>{textChange.added}</Text>
    </Text>
  );
};

export default StreamHistoryTextChange;

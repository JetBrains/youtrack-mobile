import React from 'react';

import IconPrOpen from '@jetbrains/icons/pr-open.svg';

import IconPrDeclined from '@jetbrains/icons/pr-close.svg';
import IconPrMerged from '@jetbrains/icons/pr-merged-20px.svg';
import {IconHistory, IconHourGlass, IconVcs} from 'components/icon/icon';
import {pullRequestState} from './activity__stream-vcs-helper';

import styles from './activity__stream.styles';

import {ActivityGroup} from 'types/Activity';

const defaultSize = 18;

const ActivityIcon = ({activityGroup}: {activityGroup: ActivityGroup}): React.JSX.Element => {
  let icon;
  const iconColor: string = styles.activityIcon.color;

  switch (true) {
    case activityGroup.vcs != null:
      const iconProps = {fill: iconColor, color: iconColor, width: defaultSize, height: defaultSize};

      if (activityGroup.vcs?.pullRequest) {
        switch (activityGroup.vcs.added[0].state.id) {
          case pullRequestState.OPEN: {
            icon = <IconPrOpen {...iconProps} />;
            break;
          }
          case pullRequestState.MERGED: {
            icon = <IconPrMerged {...iconProps} />;
            break;
          }
          case pullRequestState.DECLINED: {
            icon = <IconPrDeclined {...iconProps} />;
            break;
          }
        }
      } else {
        icon = <IconVcs {...iconProps} />;
      }
      break;
    case activityGroup.work != null:
      icon = <IconHourGlass size={20} color={iconColor} />;
      break;
    default:
      icon = <IconHistory size={20} color={iconColor} />;
  }

  return icon as React.ReactElement;
};

export default ActivityIcon;

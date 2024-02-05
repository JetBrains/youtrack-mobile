import React from 'react';

import IconPrOpen from '@jetbrains/icons/pr-open.svg';
import IconVcs from '@jetbrains/icons/commit.svg';

import IconPrDeclined from 'components/icon/assets/pull-request-declined.svg';
import IconPrMerged from 'components/icon/assets/pull-request-merged.svg';
import {IconHistory, IconWork} from 'components/icon/icon';
import {pullRequestState} from './activity__stream-vcs-helper';

import styles from './activity__stream.styles';

import {ActivityGroup} from 'types/Activity';

const defaultSize = 18;

const ActivityIcon = ({activityGroup}: {activityGroup: ActivityGroup}): React.JSX.Element => {
  let icon;
  const iconColor: string = styles.activityIcon.color;

  switch (true) {
    case activityGroup.vcs != null:
      const iconProps = {fill: iconColor, width: defaultSize, height: defaultSize};

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
      icon = <IconWork size={17} color={iconColor} />;
      break;
    default:
      icon = <IconHistory size={defaultSize} color={iconColor} />;
  }

  return icon as React.ReactElement;
};

export default ActivityIcon;

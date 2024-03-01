import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';

import IconChevronRight from 'components/icon/assets/shevron_small_right.svg';
import {getLinkedIssuesTitle} from './linked-issues-helper';
import {i18n} from 'components/i18n/i18n';

import styles from './linked-issues.style';

import type {IssueLink} from 'types/CustomFields';

interface Props {
  issueLinks: IssueLink[];
  onPress: () => any;
}

const LinkedIssuesTitle = (props: Props) => {
  const {issueLinks = [], onPress} = props;
  const linkedIssuesTitle: string = issueLinks.length > 0 ? getLinkedIssuesTitle(issueLinks) : '';
  return linkedIssuesTitle ? (
    <>
      <TouchableOpacity style={styles.linkedIssuesButton} onPress={onPress}>
        <View style={styles.linkedIssuesTitle}>
          <Text style={styles.linkedIssuesTitleText}>{i18n('Linked issues')}</Text>
          {linkedIssuesTitle.length > 0 && (
            <AnimatedView animation="fadeIn" duration={500} useNativeDriver>
              <Text style={styles.linkedIssuesTitleTextDetails}>{linkedIssuesTitle}</Text>
            </AnimatedView>
          )}
        </View>
        <IconChevronRight
          width={26}
          height={26}
          style={styles.linkedIssuesButtonIcon}
          color={styles.linkedIssuesTitleIcon.color}
        />
      </TouchableOpacity>
      <View style={styles.linkedIssuesTitleSeparator} />
    </>
  ) : null;
};

export default React.memo<Props>(LinkedIssuesTitle);

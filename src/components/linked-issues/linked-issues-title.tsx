import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {View as AnimatedView} from 'react-native-animatable';
import {i18n} from 'components/i18n/i18n';
import {IconAngleRight} from '../icon/icon';
import {getLinkedIssuesTitle} from './linked-issues-helper';
import styles from './linked-issues.style';
import type {IssueLink} from 'types/CustomFields';
type Props = {
  issueLinks: IssueLink[];
  onPress: () => any;
};

const LinkedIssuesTitle = (props: Props): React.ReactNode => {
  const {issueLinks = [], onPress} = props;
  const linkedIssuesTitle: string =
    issueLinks.length > 0 ? getLinkedIssuesTitle(issueLinks) : '';
  return linkedIssuesTitle ? (
    <TouchableOpacity style={styles.linkedIssuesButton} onPress={onPress}>
      <View style={styles.linkedIssuesTitle}>
        <Text style={styles.linkedIssuesTitleText}>
          {i18n('Linked issues')}
        </Text>
        {linkedIssuesTitle.length > 0 && (
          <AnimatedView animation="fadeIn" duration={500} useNativeDriver>
            <Text style={styles.linkedIssuesTitleTextDetails}>
              {linkedIssuesTitle}
            </Text>
          </AnimatedView>
        )}
      </View>
      <IconAngleRight
        size={18}
        color={styles.linkedIssuesTitleIcon.color}
      />
    </TouchableOpacity>
  ) : null;
};

export default React.memo<Props>(LinkedIssuesTitle) as React$AbstractComponent<
  Props,
  unknown
>;

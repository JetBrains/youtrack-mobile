import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {View as AnimatedView} from 'react-native-animatable';
import {i18n} from 'components/i18n/i18n';
import {IconAngleRight} from '../icon/icon';
import {getLinkedIssuesTitle} from './linked-issues-helper';
import styles from './linked-issues.style';
import type {IssueLink} from 'flow/CustomFields';
import type {Node} from 'react';
type Props = {
  issueLinks: Array<IssueLink>;
  onPress: () => any;
};

const LinkedIssuesTitle = (props: Props): Node => {
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
        color={styles.linkedIssuesTitleTextDetails.color}
      />
    </TouchableOpacity>
  ) : null;
};

export default React.memo<Props>(LinkedIssuesTitle) as React$AbstractComponent<
  Props,
  unknown
>;
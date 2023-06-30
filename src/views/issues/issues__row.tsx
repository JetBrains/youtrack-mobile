import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import ColorField from 'components/color-field/color-field';
import Tags from 'components/tags/tags';
import {
  getPriotityField,
  getEntityPresentation,
  getReadableID,
} from 'components/issue-formatter/issue-formatter';
import {ytDate} from 'components/date/date';
import Avatar from 'components/avatar/avatar';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './issues.styles';

import type {AnyIssue} from 'types/Issue';
import type {BundleValue} from 'types/CustomFields';
import type {ViewStyleProp} from 'types/Internal';

type Props = {
  issue: AnyIssue;
  onClick: (...args: any[]) => any;
  onTagPress?: (query: string) => any;
  style?: ViewStyleProp;
};

export default class IssueRow extends Component<Props, void> {
  shouldComponentUpdate(nextProps: Props): boolean {
    return ['tags', 'links', 'fields', 'resolved', 'summary'].some(
      (issueFieldName: string) => {
        return (
          nextProps.issue[issueFieldName] !== this.props.issue[issueFieldName]
        );
      },
    );
  }

  renderPriority(): React.ReactNode {
    const priorityField = getPriotityField(this.props.issue);

    if (
      !priorityField ||
      !priorityField.value ||
      priorityField.value.length === 0
    ) {
      return null;
    }

    const values: BundleValue[] = [].concat(priorityField.value);
    const LAST = values.length - 1;
    return (
      <ColorField
        style={styles.priorityWrapper}
        text={values[LAST].name}
        color={values[LAST].color}
      />
    );
  }

  render(): React.ReactNode {
    const {issue, onTagPress, style} = this.props;
    return (
      <ThemeContext.Consumer>
        {() => {
          return (
            <TouchableOpacity
              style={style}
              onPress={() => this.props.onClick(issue)}
              testID="test:id/issueRow"
              accessibilityLabel="issue-row"
              accessible={false}
            >
              <View>
                <View testID="test:id/issueRowDetails" style={styles.rowLine}>
                  {this.renderPriority()}
                  <Text
                    style={[
                      styles.headLeft,
                      issue.resolved
                        ? {
                            textDecorationLine: 'line-through',
                          }
                        : null,
                    ]}
                  >
                    {getReadableID(issue)}
                  </Text>

                  {Boolean(issue.updated || issue.reporter) && (
                    <View style={styles.headRight}>
                      {!!issue.updated && (
                        <Text style={styles.secondaryText}>{`${ytDate(
                          issue.updated,
                        )}  `}</Text>
                      )}
                      {!!issue?.reporter && (
                        <Avatar
                          userName={getEntityPresentation(issue.reporter)}
                          size={20}
                          source={{
                            uri: issue.reporter?.avatarUrl,
                          }}
                        />
                      )}
                    </View>
                  )}
                </View>

                <Text
                  style={[
                    styles.summary,
                    issue.resolved ? styles.resolved : null,
                  ]}
                  numberOfLines={2}
                  testID="test:id/issueRowSummary"
                  accessible={true}
                >
                  {issue.summary}
                </Text>

                {onTagPress && issue.tags?.length > 0 && (
                  <Tags
                    tags={issue.tags}
                    onTagPress={onTagPress}
                    style={styles.tags}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

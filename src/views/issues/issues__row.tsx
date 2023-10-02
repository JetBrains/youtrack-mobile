import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import ColorField from 'components/color-field/color-field';
import Tags from 'components/tags/tags';
import {
  getPriotityField,
  getEntityPresentation,
  getReadableID,
} from 'components/issue-formatter/issue-formatter';
import {IssuesSettings} from 'views/issues/index';
import {ytDate} from 'components/date/date';
import Avatar from 'components/avatar/avatar';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './issues.styles';

import type {IssueOnList} from 'types/Issue';
import type {BundleValue} from 'types/CustomFields';
import type {ViewStyleProp} from 'types/Internal';

interface Props {
  hideId?: boolean;
  issue: IssueOnList;
  onClick: (...args: any[]) => any;
  onTagPress?: (query: string) => any;
  style?: ViewStyleProp;
  settings?: IssuesSettings;
}

export default class IssueRow<P extends Props, S = {}> extends Component<P, S> {
  shouldComponentUpdate(nextProps: P): boolean {
    return ['tags', 'links', 'fields', 'resolved', 'summary'].some(
      (issueFieldName: string) => {
        // @ts-ignore
        return nextProps.issue[issueFieldName] !== this.props.issue[issueFieldName];
      },
    );
  }

  renderPriority(customStyle?: any, text?: string): React.ReactNode {
    const priorityField = getPriotityField(this.props.issue);

    if (
      !priorityField ||
      !priorityField.value ||
      Array.isArray(priorityField.value) && priorityField.value?.length === 0
    ) {
      return null;
    }

    const values: BundleValue[] = [].concat(priorityField.value as any);
    const LAST = values.length - 1;
    return <ColorField
      style={[styles.priorityWrapper, customStyle]}
      text={text || values[LAST].name}
      color={values[LAST].color}
    />;
  }

  renderReporter() {
    const {issue} = this.props;
    return (
      issue.updated || issue.reporter ? (
        <View style={styles.reporter}>
          {this.renderDate()}
          {this.renderAvatar()}
        </View>
      ) : null
    );
  }

  renderAvatar() {
    const {issue} = this.props;
    return (
      issue.reporter ? (
        <Avatar
          userName={getEntityPresentation(issue.reporter)}
          size={20}
          source={{
            uri: issue.reporter?.avatarUrl,
          }}
        />
      ) : null
    );
  }

  renderDate() {
    const {issue} = this.props;
    return issue.updated ? <Text style={styles.secondaryText}>{`${ytDate(issue.updated)}  `}</Text> : null;
  }

  renderId(customStyle?: any, id?: string) {
    const {issue} = this.props;
    const readableId: string = id || getReadableID(issue);
    return readableId ? <Text
      style={[
        styles.readableId,
        customStyle ? customStyle : issue.resolved ? [styles.issueIdResolved, styles.resolved] : null,
      ]}
    >
      {readableId}
    </Text> : null;
  }

  renderDescription() {
    const {issue} = this.props;
    const description: string | undefined = issue.trimmedDescription || issue.description;
    return description ? (
      <View style={styles.description}>
        <Text
          style={styles.secondaryText}
          numberOfLines={3}
          testID="test:id/issueRowDescription"
          accessible={true}
        >
          {description.replace(/\n+/g, '\n')}
        </Text>
      </View>
    ) : null;
  }

  renderSummary() {
    const {issue, settings} = this.props;
    const mode: number = typeof settings?.view.mode === 'number' ? settings?.view.mode : 2;
    return issue.summary ? (
      <Text
        style={[
          styles.summary,
          issue.resolved ? styles.resolved : null,
          mode === 0 && styles.summaryCompact,
        ]}
        numberOfLines={mode + 1}
        testID="test:id/issueRowSummary"
        accessible={true}
      >
        {issue.summary}
      </Text>
    ) : null;
  }

  renderTags() {
    const {issue, onTagPress} = this.props;
    return onTagPress && (issue?.tags || []).length > 0 ? (
      <Tags
        tags={issue.tags || []}
        onTagPress={onTagPress}
        style={styles.tags}
      />
    ) : null;
  }

  renderContent() {
    return (
      <View style={styles.issueRow}>
        <View
          testID="test:id/issueRowDraftDetails"
          style={styles.rowLine}
        >
          {this.renderPriority()}
          {this.renderId()}
          {this.renderReporter()}
        </View>

        {this.renderSummary()}
        {this.renderDescription()}
        {this.renderTags()}
      </View>
    );
  }

  render(): React.ReactNode {
    const {issue, style} = this.props;
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
              {this.renderContent()}
            </TouchableOpacity>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

export class IssueRowCompact<P extends Props, S = {}> extends IssueRow<P, S> {
  renderPriority(): React.ReactNode {
    return super.renderPriority(styles.priorityWrapperCompact, ' ');
  }

  renderReporter() {
    const {issue} = this.props;
    return (
      issue.reporter ? (
        <View style={[
          styles.reporter,
          styles.reporterCompact,
        ]}>
          {this.renderAvatar()}
        </View>
      ) : null
    );
  }

  renderId() {
    const {issue, hideId} = this.props;
    const idReadable: string | undefined = issue.idReadable;
    return (
      hideId
        ? null
        : idReadable ? super.renderId(styles.readableIdCompact, idReadable.split('-')[0]) : null
    );
  }

  renderContent(): React.JSX.Element {
    return (
      <View style={[
        styles.issueRow,
        styles.rowLine,
      ]}>
        <View
          testID="test:id/issueRowDetails"
          style={styles.rowLine}
        >
          {this.renderPriority()}
        </View>

        {this.renderSummary()}
        <>
          {this.renderId()}
          {this.renderReporter()}
        </>
      </View>
    );
  }
}

export class IssueRowDraft<P extends Props, S = {}> extends IssueRow<P, S> {

  renderProjectName() {
    return (
      <Text style={styles.draftTextId}>
        {`${this.props.issue?.project?.shortName} `}
      </Text>
    );
  }

  renderSummary() {
    return this.props.issue.summary ? (
      <Text style={styles.draftText}>
        {this.props.issue.summary}
      </Text>
    ) : null;
  }


  renderContent(): React.JSX.Element {
    return (
      <View style={styles.draft}>
        <Text numberOfLines={3}>
          {this.renderProjectName()}
          {this.renderSummary()}
        </Text>
      </View>
    );
  }
}

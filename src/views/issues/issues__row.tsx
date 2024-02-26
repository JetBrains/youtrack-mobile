import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import Avatar from 'components/avatar/avatar';
import ColorField from 'components/color-field/color-field';
import IconHDTicket from 'components/icon/assets/menu_helpdesk.svg';
import IconPaused from '@jetbrains/icons/paused.svg';
import Tags from 'components/tags/tags';
import {
  getPriorityField,
  getEntityPresentation,
  getReadableID,
  getAssigneeField,
  getSLAFields,
} from 'components/issue-formatter/issue-formatter';
import {i18n, i18nPlural} from 'components/i18n/i18n';
import {IssuesSettings} from 'views/issues/index';
import {ThemeContext} from 'components/theme/theme-context';
import {ytDate} from 'components/date/date';

import styles, {DUAL_AVATAR_SIZE} from './issues.styles';

import {BaseIssue, IssueOnList} from 'types/Issue';
import {BundleValue, CustomFieldBase} from 'types/CustomFields';
import {FieldValue} from 'types/CustomFields';
import {ViewStyleProp} from 'types/Internal';

interface Props {
  hideId?: boolean;
  issue: IssueOnList;
  onClick: (...args: any[]) => any;
  onTagPress?: (query: string) => any;
  style?: ViewStyleProp;
  settings?: IssuesSettings;
  helpdeskMode: boolean;
}

export default class IssueRow<P extends Props, S = {}> extends Component<P, S> {
  shouldComponentUpdate(nextProps: P): boolean {
    const issueProperties = ['tags', 'links', 'fields', 'resolved', 'summary'] as (keyof BaseIssue)[];
    return issueProperties.some(
      (issueFieldName) => {
        return nextProps.issue[issueFieldName] !== this.props.issue[issueFieldName];
      },
    );
  }

  renderSLAPausedTag(text: string) {
    return (
      <ColorField
        style={styles.slaFieldPaused}
        color={{
          id: '',
          foreground: styles.slaFieldPaused.color,
          background: '',
        }}
        text={text}
        fullText={true}
      >
        <IconPaused
          style={styles.slaFieldPausedIcon}
          fill={styles.slaFieldPausedIcon.color}
          width={13}
          height={13}
        />
      </ColorField>
    );
  }

  createSLADateTagColor(f: CustomFieldBase) {
    return {
      id: '',
      foreground: styles.slaField.color,
      background:
        new Date().getTime() > f.value
          ? styles.slaFieldOverdue.backgroundColor
          : styles.slaField.backgroundColor,
    };
  }

  renderSLADateTag(f: CustomFieldBase) {
    return (
      <View style={styles.slaFieldsItem}>
        <ColorField
          color={this.createSLADateTagColor(f)}
          text={ytDate(f.value as number)}
          fullText={true}
        />
      </View>
    );
  }

  renderSLA() {
    const slaFields = getSLAFields(this.props.issue);
    return (
      <View style={styles.slaFields}>
        {slaFields.map((f: CustomFieldBase) =>
          f.pausedTime ? this.renderSLAPausedTag(i18n('Paused')) : this.renderSLADateTag(f)
        )}
      </View>
    );
  }

  renderPriority(customStyle?: any, text?: string): React.ReactNode {
    const priorityField = getPriorityField(this.props.issue);

    if (
      !priorityField?.value ||
      (Array.isArray(priorityField?.value) && priorityField.value?.length === 0)
    ) {
      return null;
    }

    const values: BundleValue[] = [].concat(priorityField.value as any);
    const LAST = values.length - 1;
    return (
      <ColorField
        style={[styles.priorityWrapper, customStyle]}
        text={text || values[LAST].name}
        color={values[LAST].color}
      />
    );
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
    const assigneeField: CustomFieldBase | null = this.props.helpdeskMode ? getAssigneeField(issue) : null;
    const assigneeFieldValue = assigneeField?.value as (FieldValue | null);

    return (
      <View style={styles.dualAvatarWrapper}>
        {issue.reporter && (
          <View style={assigneeFieldValue?.avatarUrl && styles.leftAvatarWrapper}>
            <Avatar
              userName={getEntityPresentation(issue.reporter)}
              size={20}
              source={{uri: issue.reporter?.avatarUrl}}
            />
          </View>
        )}
        {assigneeFieldValue?.avatarUrl && (
          <View style={styles.rightAvatarWrapper}>
            <Avatar
              style={styles.rightAvatar}
              userName={getEntityPresentation(assigneeFieldValue)}
              size={DUAL_AVATAR_SIZE}
              source={{uri: assigneeFieldValue?.avatarUrl}}
            />
          </View>
        )}
      </View>
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
    const priorityEl = this.renderPriority();
    const helpdeskParams = {
      iconSize: priorityEl ? 13 : 19,
      style: priorityEl ? styles.helpDeskIconWrapper : styles.helpDeskIcon,
    };
    return (
      <View style={styles.issueRow}>
        <View testID="test:id/issueRowDraftDetails" style={styles.rowLine}>
          {priorityEl}
          {this.props.helpdeskMode && (
            <View style={helpdeskParams.style}>
              <IconHDTicket
                color={helpdeskParams.style.color}
                width={helpdeskParams.iconSize}
                height={helpdeskParams.iconSize}
              />
            </View>
          )}
          {this.renderId()}
          {this.renderReporter()}
        </View>

        {this.renderSummary()}
        {this.renderDescription()}
        {this.renderSLA()}
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
    const { issue } = this.props;
    return issue.reporter ? (
      <View style={[styles.reporter, styles.reporterCompact]}>
        {this.renderAvatar()}
      </View>
    ) : null;
  }

  renderId() {
    const { issue, hideId } = this.props;
    return hideId || !issue.idReadable
      ? null
      : super.renderId(
          styles.readableIdCompact,
          issue.idReadable.split('-')[0]
        );
  }

  formatDistanceToBreach(date: number): string {
    const minutesLeft = Math.floor((date - Date.now()) / 1000 / 60);
    const minutesAbsolute = Math.abs(minutesLeft);
    if (minutesAbsolute < 90) {
      return i18nPlural(
        minutesAbsolute,
        '{{minutesAbsolute}}m',
        '{{minutesAbsolute}}m',
        {minutesAbsolute},
      );
    }
    const hoursLeft = Math.floor(minutesAbsolute / 60);
    if (hoursLeft < 24) {
      return i18nPlural(
        hoursLeft,
        '{{hoursLeft}}h',
        '{{hoursLeft}}h',
        {hoursLeft},
      );
    }
    const daysLeft = Math.floor(hoursLeft / 24);
    return i18nPlural(
      daysLeft,
      '{{daysLeft}}d',
      '{{daysLeft}}d',
      {daysLeft},
    );
  }

  renderSLADateTag(f: CustomFieldBase) {
    const prefix = new Date().getTime() > f.value ? '-' : '';
    return (
      <ColorField
        style={styles.slaFieldTag}
        color={this.createSLADateTagColor(f)}
        text={`${prefix}${this.formatDistanceToBreach(f.value as number)}`}
        fullText={true}
      />
    );
  }

  renderSLAPausedTag() {
    return <View style={styles.slaFieldPausedCompact}>{super.renderSLAPausedTag('')}</View>;
  }

  renderContent() {
    return (
      <View style={[styles.issueRow, styles.rowLine]}>
        <View testID="test:id/issueRowDetails" style={styles.rowLine}>
          {this.renderPriority()}
        </View>

        {this.renderSummary()}
        {this.props.helpdeskMode && this.renderSLA()}
        {this.renderId()}
        {this.renderReporter()}
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


  renderContent() {
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

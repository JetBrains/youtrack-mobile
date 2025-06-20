import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import Avatar from 'components/avatar/avatar';
import ColorField from 'components/color-field/color-field';
import CustomFieldSLA from 'components/custom-field/custom-field-sla';
import IconHDTicket from 'components/icon/assets/menu_helpdesk.svg';
import Tags from 'components/tags/tags';
import {
  getPriorityField,
  getEntityPresentation,
  getReadableID,
  getAssigneeField,
  getSLAFields,
} from 'components/issue-formatter/issue-formatter';
import {isHelpdeskProject} from 'components/helpdesk';
import {IssuesSettings} from 'views/issues/index';
import {ThemeContext} from 'components/theme/theme-context';
import {ytDate} from 'components/date/date';

import styles, {DUAL_AVATAR_SIZE} from './issues.styles';

import {BaseIssue, IssueOnListExtended} from 'types/Issue';
import {BundleValue, CustomFieldBase} from 'types/CustomFields';
import {FieldValue} from 'types/CustomFields';
import {TextStyleProp, ViewStyleProp} from 'types/Internal';

interface Props {
  hideId?: boolean;
  issue: IssueOnListExtended;
  onClick: (issue: IssueOnListExtended) => void;
  onTagPress?: (query: string) => void;
  style?: ViewStyleProp;
  settings?: IssuesSettings;
  helpdeskMode?: boolean;
  absDate?: boolean;
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

  renderSLA(absDate: boolean, style?: ViewStyleProp) {
    if (!this.props.helpdeskMode) {
      return null;
    }
    const slaFields = getSLAFields(this.props.issue);
    return (
      <View style={[styles.slaFields, style]}>
        {slaFields.map((f: CustomFieldBase) => <CustomFieldSLA key={f.id} field={f} absDate={absDate} />)}
      </View>
    );
  }

  renderPriority(customStyle?: TextStyleProp, text?: string) {
    const priorityField = getPriorityField(this.props.issue);

    if (
      !priorityField?.value ||
      (Array.isArray(priorityField?.value) && priorityField.value?.length === 0)
    ) {
      return null;
    }

    const values: BundleValue[] = new Array().concat(priorityField.value);
    const LAST = values.length - 1;
    return (
      <ColorField
        style={{...styles.priorityWrapper, ...customStyle}}
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

  renderId(customStyle?: ViewStyleProp, id?: string) {
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
          {isHelpdeskProject(this.props.issue) && (
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
        {this.renderSLA(!!this.props.absDate)}
        {this.renderTags()}
      </View>
    );
  }

  render() {
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
  renderPriority() {
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

  renderContent() {
    return (
      <View style={[styles.issueRow, styles.rowLine]}>
        <View testID="test:id/issueRowDetails" style={styles.rowLine}>
          {this.renderPriority()}
        </View>

        {this.renderSummary()}
        {this.props.helpdeskMode && this.renderSLA(false, styles.slaFieldsCompact)}
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

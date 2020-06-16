/* @flow */

import {FlatList, View, Text, RefreshControl, TouchableOpacity} from 'react-native';
import React, {Component} from 'react';

import usage from '../../components/usage/usage';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as inboxActions from './inbox-actions';
import Router from '../../components/router/router';
import {COLOR_PINK, UNIT} from '../../components/variables/variables';
import log from '../../components/log/log';
import {handleRelativeUrl} from '../../components/config/config';
import {getStorageState} from '../../components/storage/storage';
import UserInfo from '../../components/user/user-info';
import Diff from '../../components/diff/diff';
import Wiki from '../../components/wiki/wiki';
import CustomFieldChangeDelimiter from '../../components/custom-field/custom-field__change-delimiter';
import {isReactElement} from '../../util/util';
import ErrorMessage from '../../components/error-message/error-message';

import {elevation1} from '../../components/common-styles/shadow';
import {headerTitle} from '../../components/common-styles/typography';
import styles from './inbox.styles';

import type {InboxState} from './inbox-reducers';
import type {User} from '../../flow/User';
import type {Notification, Metadata, ChangeValue, ChangeEvent, Issue, IssueChange} from '../../flow/Inbox';
import type {AppConfigFilled} from '../../flow/AppConfig';
import type {IssueOnList} from '../../flow/Issue';

const CATEGORY_NAME = 'inbox view';

type Props = InboxState & typeof inboxActions;

type State = {
  isTitlePinned: boolean
};

const Category: Object = {
  CREATED: 'CREATED',
  LINKS: 'LINKS',
  COMMENT: 'COMMENT',
  SUMMARY: 'SUMMARY',
  DESCRIPTION: 'DESCRIPTION',
};

const MAX_TEXT_CHANGE_LENGTH: number = 5000;

class Inbox extends Component<Props, State> {
  static notificationReasons = {
    mentionReasons: 'Mention',
    tagReasons: '',
    savedSearchReasons: '',
    workflow: 'Workflow'
  };
  config: AppConfigFilled;

  constructor(props) {
    super(props);
    this.state = {isTitlePinned: false};
    this.config = getStorageState().config;
    usage.trackScreenView(CATEGORY_NAME);
  }

  componentDidMount() {
    this.refresh();
  }

  refresh = () => {
    this.props.loadInbox();
  };

  goToIssue(issue: Issue) {
    log.debug(`Opening issue "${issue.id}" from notifications`);
    if (issue?.id) {
      Router.SingleIssue({
        issuePlaceholder: {
          id: issue.id,
          summary: issue?.summary,
          description: issue?.description,
          created: issue?.created
        },
        issueId: issue.id
      });
    }
  }

  onLoadMore = () => {
    if (!this.props.loading && this.props.items.length > 0 && this.props.hasMore) {
      this.props.loadInbox(this.props.items.length);
    }
  };

  renderValues(values: Array<ChangeValue>, eventId: string) {
    return (
      values.map((it) => {
        const value = this.getChangeValue(it);
        return (
          <Text
            key={`${eventId}-${value}`}
            numberOfLines={5}
            style={styles.textPrimary}>
            {value}
          </Text>
        );
      })
    );
  }

  isCreateCategory(change): boolean {
    return change.category === Category.CREATED;
  }

  getChangeValue(change): string {
    if (change.category === Category.LINKS) {
      return change.id;
    }

    if (typeof change.name === 'string' && change.name.length > MAX_TEXT_CHANGE_LENGTH) {
      return `${change.name.substr(0, MAX_TEXT_CHANGE_LENGTH)}...`;
    }

    return change.name;
  }

  isEventHasField(event: ChangeEvent, fieldName: string): boolean {
    return Boolean(event && event[fieldName] && event[fieldName].length);
  }

  hasAddedValues(event: ChangeEvent): boolean {
    return this.isEventHasField(event, 'addedValues');
  }

  hasRemovedValues(event: ChangeEvent): boolean {
    return this.isEventHasField(event, 'removedValues');
  }

  renderMultiValueCustomFieldChange(event: ChangeEvent) {
    const combinedChangeValue = (values: Array<ChangeValue> = []) => (
      values.map(it => {
        it.category = event.category;
        return it;
      }).map(this.getChangeValue).join(delimiter)
    );

    const delimiter = ', ';
    const added: string = combinedChangeValue(event.addedValues);
    const removed: string = combinedChangeValue(event.removedValues);
    const hasRemovedChange: boolean = this.hasRemovedValues(event);

    return (
      <Text>
        {hasRemovedChange && <Text style={styles.changeRemoved}>
          {removed}
        </Text>}
        {this.hasAddedValues(event) && (<Text>
          {hasRemovedChange ? delimiter : ''}
          {added}
        </Text>)}
      </Text>
    );
  }

  renderSingleValueCustomFieldChange(event: ChangeEvent) {
    const hasAddedValues: boolean = this.hasAddedValues(event);
    const hasRemovedValues: boolean = this.hasRemovedValues(event);
    const hasDelimiter: boolean = hasAddedValues && hasRemovedValues;

    return (
      <Text>
        {hasRemovedValues && (
          <Text style={!hasAddedValues ? styles.changeRemoved : null}>
            {this.renderValues(event.removedValues, event.entityId)}
          </Text>
        )}
        {hasDelimiter && <Text style={styles.textPrimary}>{CustomFieldChangeDelimiter}</Text>}
        {hasAddedValues && this.renderValues(event.addedValues, event.entityId)}
      </Text>
    );
  }

  renderCustomFieldChange(event: ChangeEvent) {
    return (
      event?.multiValue === true
        ? this.renderMultiValueCustomFieldChange(event)
        : this.renderSingleValueCustomFieldChange(event)
    );
  }

  renderTextDiff(event: IssueChange, title: ?string) {
    return (
      <Diff
        title={title || 'Details'}
        text1={this.getChangeValue(event.removedValues[0])}
        text2={this.getChangeValue(event.addedValues[0])}
      />
    );
  }

  renderLinks(event: ChangeEvent) {
    const issues = [].concat(event.addedValues).concat(event.removedValues);

    return (
      issues.map((issue: IssueOnList) => {
        return (
          <TouchableOpacity key={`${event.entityId}_${issue.entityId}`}>
            <Text onPress={() => Router.SingleIssue({issueId: issue.id})}>
              <Text style={styles.link}>
                {`${issue.id} ${issue.summary}`}
              </Text>
            </Text>
          </TouchableOpacity>
        );
      })
    );
  }

  renderEventItem(event: ChangeEvent) {
    const textChangeEventName = (event: ChangeEvent) => `${event.name} changed`;
    const renderEventName = (event: ChangeEvent) => <Text style={styles.textSecondary}>{event.name}: </Text>;

    if (!this.hasAddedValues(event) && !this.hasRemovedValues(event)) {
      return null;
    }

    switch (true) {

    case event.category === Category.COMMENT: //TODO(xi-eye): filter out text update events
      return (
        <View style={styles.change}>
          {this.hasRemovedValues(event) && (
            this.getChangeValue(event.removedValues[0]).length
              ? this.renderTextDiff(event, textChangeEventName(event))
              : <View>{renderEventName(event)}{this.renderValues(event.addedValues, event.entityId)}</View>
          )}
        </View>
      );

    case event.category === Category.SUMMARY || event.category === Category.DESCRIPTION:
      return (
        this.renderTextDiff(event, textChangeEventName(event))
      );

    case event.category === Category.LINKS:
      return (
        <View style={styles.change}>
          {renderEventName(event)}
          {this.renderLinks(event)}
        </View>
      );

    default:
      return (
        <View style={styles.change}>
          {renderEventName(event)}
          {this.renderCustomFieldChange(event)}
        </View>
      );
    }
  }

  renderEvents(events: Array<ChangeEvent> = []) {
    const nodes = events.reduce((list, event) => {
      const item = this.renderEventItem(event);
      item && list.push(item);
      return list;
    }, []);

    return (
      <View>
        {nodes.map((node, index) =>
          (
            <View
              key={index}
              style={index > 0 ? styles.changeItem : null}
            >
              {node}
            </View>
          )
        )}
      </View>
    );
  }

  isIssueDigestChange(metadata: Metadata): boolean {
    return metadata && metadata.change;
  }

  isWorkflowNotification(metadata: Metadata): boolean {
    return !this.isIssueDigestChange(metadata) && (metadata.body || metadata.text || metadata.subject);
  }

  renderWorkflowNotification(text: string) {
    const title: string = Inbox.notificationReasons.workflow;
    const workflowMetadata: Metadata = {
      reason: {
        [title]: [{title}]
      }
    };

    return (
      <View style={styles.notification}>
        <View><Text style={[styles.textPrimary, styles.notificationIssueInfo]}>{`${title}:`}</Text></View>

        <View style={[styles.notificationContent, styles.notificationContentWorkflow]}>
          <Wiki
            backendUrl={this.config.backendUrl}
            onIssueIdTap={(issueId) => Router.SingleIssue({issueId})}
          >
            {text}
          </Wiki>
        </View>

        {this.renderNotificationReason(workflowMetadata)}
      </View>
    );
  }

  getWorkflowNotificationText(metadata: Metadata): string {
    const PARSE_ERROR_NOTIFICATION: string = '<i>Unable to parse workflow notification.</i>';
    let text: string;

    if (metadata.body && metadata.body.indexOf('<html') === 0) {
      text = `${metadata.subject || ''}\n${metadata.text || ''}`;
      text = text.trim().length ? text.replace(/\s+/g, ' ') : PARSE_ERROR_NOTIFICATION;
    } else {
      text = metadata.body || metadata.text || metadata.subject;
    }

    return text || PARSE_ERROR_NOTIFICATION;
  }

  renderItem(item: Object & { key: string } | Notification) {
    if (isReactElement(item)) {
      return item;
    }

    const metadata: Metadata = item.metadata;
    let renderer = null;

    if (this.isIssueDigestChange(metadata)) {
      renderer = metadata.issue ? this.renderIssueChange(metadata, item.sender) : null;
    } else if (this.isWorkflowNotification(metadata)) {
      renderer = this.renderWorkflowNotification(this.getWorkflowNotificationText(metadata));
    }

    return renderer;
  }

  createAvatarUrl(sender: User): string | null {
    if (!sender.avatarUrl || !this.config || !this.config.backendUrl) {
      return null;
    }
    return handleRelativeUrl(sender.avatarUrl, this.config.backendUrl);
  }

  renderNotificationReason(metadata: Metadata) {
    const _reasons = Object.keys(metadata.reason).reduce((reasons, key) => {
      if (metadata.reason[key].length) {
        return reasons.concat(
          {
            title: Inbox.notificationReasons[key] ? `${Inbox.notificationReasons[key]} ` : '',
            value: metadata.reason[key].map((it: Object) => it.name).join(', ')
          }
        );
      }
      return reasons;
    }, []);

    if (_reasons && _reasons.length) {
      const reasonsPresentation: string = _reasons.map(
        (it) => it.title.trim() + it.value.trim()
      ).filter(Boolean).join(', ');

      if (reasonsPresentation.length > 0) {
        return <View>
          <Text style={styles.reason}>
            {reasonsPresentation}
          </Text>
        </View>;
      }
      return null;
    }
  }

  renderIssueChange(metadata: Metadata, sender: User = {}) {
    const issue: Issue = metadata.issue;
    const onPress = () => this.goToIssue(issue);
    const events: Array<ChangeEvent> = (metadata?.change?.events || []).filter((event) => !this.isCreateCategory(event));
    const avatarURL: string | null = this.createAvatarUrl(sender);
    if (avatarURL) {
      sender.avatarUrl = avatarURL;
    }

    return (
      <View style={styles.notification}>
        <UserInfo style={styles.userInfo} user={sender} timestamp={metadata?.change?.endTimestamp}/>

        <View style={styles.notificationContent}>
          <TouchableOpacity
            style={styles.notificationIssue}
            onPress={onPress}
          >
            <Text>
              {!!issue.id && <Text style={styles.notificationIssueInfo}>{issue.id}</Text>}
              {!!issue.summary && (
                <Text numberOfLines={2} style={styles.notificationIssueInfo}>{` ${issue.summary}`}</Text>
              )}
            </Text>
          </TouchableOpacity>

          {events.length > 0 && (
            <View style={styles.notificationChange}>
              {this.renderEvents(events)}
            </View>
          )}

          {this.renderNotificationReason(metadata)}
        </View>
      </View>
    );
  }

  renderListMessage = () => {
    const {loading, items} = this.props;

    if (!loading && items.length === 0) {
      return (
        <View>
          <Text style={styles.listMessageSmile}>(・_・)</Text>
          <Text
            style={styles.listFooterMessage}
            testID="no-notifications"
          >
            You have no notifications
          </Text>
        </View>
      );
    }

    return null;
  };

  renderRefreshControl = () => {
    return (
      <RefreshControl
        refreshing={this.props.loading}
        onRefresh={this.refresh}
        tintColor={COLOR_PINK}
        testID="refresh-control"
      />
    );
  };

  renderTitle() {
    return (
      <View
        key="activityHeaderTitle"
        style={[
          styles.headerTitle,
          this.state.isTitlePinned ? elevation1 : null
        ]}
      >
        <Text style={headerTitle}>Activity</Text>
      </View>
    );
  }

  onScroll(nativeEvent) {
    const newY = nativeEvent.contentOffset.y;
    this.setState({
      isTitlePinned: newY >= UNIT
    });
  }

  getListData(): Array<React$Element<any> | Notification> {
    const {items, error} = this.props;
    const data: Array<React$Element<any> | Notification> = [];

    if (!error) {
      if (items?.length > 0) {
        data.push(this.renderTitle());
      }
    }

    return data.concat(items);
  }

  render() {
    const {loading, error} = this.props;
    const hasError: boolean = !!error;
    const data: Array<React$Element<any> | Notification> = this.getListData();

    return (
      <View style={styles.container}>

        {hasError && (
          <View style={styles.error}>
            <ErrorMessage error={error}/>
          </View>
        )}

        {!hasError && <FlatList
          removeClippedSubviews={false}
          data={data}
          refreshControl={this.renderRefreshControl()}
          refreshing={loading}
          keyExtractor={(item: Object & { key: string } | Notification) => item.key || item.id}
          renderItem={(listItem) => this.renderItem(listItem.item)}
          onEndReached={this.onLoadMore}
          onEndReachedThreshold={0.1}
          onScroll={(params) => this.onScroll(params.nativeEvent)}
          ListFooterComponent={this.renderListMessage}
          scrollEventThrottle={10}
          stickyHeaderIndices={[0]}
        />}
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {...state.inbox, ...ownProps};
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(inboxActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Inbox);

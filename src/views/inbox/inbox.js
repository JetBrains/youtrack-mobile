/* @flow */
import {FlatList, Image, View, Text, RefreshControl, TouchableOpacity} from 'react-native';
import React, {Component} from 'react';

import styles from './inbox.styles';
import issueStyles from '../single-issue/single-issue.styles';
import Header from '../../components/header/header';
import usage from '../../components/usage/usage';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as inboxActions from './inbox-actions';
import Router from '../../components/router/router';
import {next} from '../../components/icon/icon';
import {openMenu} from '../../actions/app-actions';
import Menu from '../../components/menu/menu';
import {COLOR_PINK, UNIT} from '../../components/variables/variables';
import log from '../../components/log/log';
import {handleRelativeUrl} from '../../components/config/config';
import {getStorageState} from '../../components/storage/storage';
import UserInfo from '../../components/user/user-info';
import Diff from '../../components/diff/diff';
import Wiki from '../../components/wiki/wiki';
import CustomFieldChangeDelimiter from '../../components/custom-field/custom-field__change-delimiter';

import type {InboxState} from './inbox-reducers';
import type {User} from '../../flow/User';
import type {Notification, Metadata, ChangeValue, ChangeEvent, Issue, IssueChange} from '../../flow/Inbox';
import type {AppConfigFilled} from '../../flow/AppConfig';

const CATEGORY_NAME = 'Inbox view';

type AdditionalProps = {
  openMenu: Function
};
type Props = InboxState & typeof inboxActions & AdditionalProps;


class Inbox extends Component<Props, void> {
  static notificationReasons = {
    mentionReasons: 'You are mentioned',
    tagReasons: 'Enabled notifications for tags',
    savedSearchReasons: 'Enabled notifications for saved searches',
    workflow: 'Workflow notification'
  };
  config: AppConfigFilled;

  constructor(props) {
    super(props);
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
    Router.SingleIssue({
      issuePlaceholder: {
        id: issue.id,
        summary: issue.summary,
        description: issue.description,
        created: issue.created
      },
      issueId: issue.id
    });
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

  getChangeValue(change): string {
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
    const delimiter = ', ';
    const added: string = (event.addedValues || []).map(this.getChangeValue).join(delimiter);
    const removed: string = (event.removedValues || []).map(this.getChangeValue).join(delimiter);
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

  renderEventName(event: ChangeEvent) {
    return <Text style={styles.textSecondary}>{event.name}: </Text>;
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

  renderEvents(events: Array<ChangeEvent> = []) {
    const eventNodes = [];

    events.forEach((event: ChangeEvent) => {
      if (!this.hasAddedValues(event) && !this.hasRemovedValues(event)) {
        return;
      }

      switch (true) {
      case event.category === 'COMMENT':
        //TODO(xi-eye): do not show updating comment`s text
        eventNodes.push(
          <View style={styles.change}>
            {this.renderEventName(event)}
            {this.hasRemovedValues(event) && (this.getChangeValue(event.removedValues[0]).length
              ? this.renderTextDiff(event)
              : this.renderValues(event.addedValues, event.entityId))
            }
          </View>
        );
        break;
      case event.category === 'SUMMARY' || event.category === 'DESCRIPTION':
        eventNodes.push(
          this.renderTextDiff(event, `${event.name} changed`)
        );
        break;
      default:
        eventNodes.push(
          <View style={styles.change}>
            {this.renderEventName(event)}
            {this.renderCustomFieldChange(event)}
          </View>
        );
      }
    });

    return (
      <View>
        {eventNodes.map((node, index) => {
          return (
            <View
              key={index}
              style={{marginTop: index > 0 ? UNIT : 0}}
            >
              {node}
            </View>
          );
        })}
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
        <View><Text style={[styles.textPrimary, styles.strong]}>{`${title}:`}</Text></View>

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

  renderNotification(notification: Notification) {
    const metadata: Metadata = notification.metadata;
    let renderer = null;

    if (this.isIssueDigestChange(metadata)) {
      renderer = this.renderIssueChange(notification);
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
        const isMention = key === Inbox.notificationReasons.mentionReasons;
        return reasons.concat(
          {
            title: Inbox.notificationReasons[key] ? `${Inbox.notificationReasons[key]} ` : '',
            value: isMention ? '' : metadata.reason[key].map((it: Object) => it.name).join(', ')
          }
        );
      }
      return reasons;
    }, []);

    if (_reasons && _reasons.length) {
      return <View>
        <Text style={styles.reason}>
          {_reasons.map((it) => it.title + it.value).join('. ')}
        </Text>
      </View>;
    }
  }

  renderIssueChange(notification: Notification) {
    const metadata: Metadata = notification.metadata;
    const onPress = () => this.goToIssue(metadata.issue);
    const sender: User = notification.sender;
    const events: Array<ChangeEvent> = metadata?.change?.events;
    const avatarURL: string | null = this.createAvatarUrl(sender);
    if (avatarURL) {
      sender.avatarUrl = avatarURL;
    }

    return (
      <TouchableOpacity style={styles.notification} onPress={onPress}>
        <View style={styles.header}>
          <Text numberOfLines={2} style={styles.summary}>{metadata.issue.summary}</Text>
          <Image style={styles.arrowImage} source={next}/>
        </View>

        <View style={styles.subHeader}>
          <Text style={styles.issueId}>{metadata.issue.id}</Text>
        </View>

        <UserInfo style={styles.userInfo} user={sender} timestamp={metadata?.change?.endTimestamp}/>

        {Boolean(events && events.length) && (<View style={styles.notificationContent}>
          <View>{this.renderEvents(events)}</View>
        </View>)}

        {this.renderNotificationReason(metadata)}
      </TouchableOpacity>
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
            You have no notifications.
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

  render() {
    const {items, loading, openMenu} = this.props;

    return (
      <Menu>
        <View style={styles.container}>
          <Header
            leftButton={<Text>Menu</Text>}
            onBack={openMenu}
          >
            <Text style={issueStyles.headerText}>Notifications</Text>
          </Header>

          <FlatList
            data={items}
            refreshControl={this.renderRefreshControl()}
            refreshing={loading}
            keyExtractor={notification => notification.id}
            renderItem={(listItem) => this.renderNotification(listItem.item)}
            onEndReached={this.onLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={this.renderListMessage}
          />
        </View>
      </Menu>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {...state.inbox, ...ownProps};
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(inboxActions, dispatch),
    openMenu: () => dispatch(openMenu())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Inbox);

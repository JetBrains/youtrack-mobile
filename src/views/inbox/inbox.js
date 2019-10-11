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
import {COLOR_PINK} from '../../components/variables/variables';
import log from '../../components/log/log';
import {handleRelativeUrl} from '../../components/config/config';
import {getStorageState} from '../../components/storage/storage';
import UserInfo from '../../components/user/user-info';

import type {InboxState} from './inbox-reducers';
import type {User} from '../../flow/User';
import type {Notification, Metadata, ChangeValue, ChangeEvent, Issue} from '../../flow/Inbox';
import type {AppConfigFilled} from '../../flow/AppConfig';

const CATEGORY_NAME = 'Inbox view';

type AdditionalProps = {
  openMenu: Function
};
type Props = InboxState & typeof inboxActions & AdditionalProps;


class Inbox extends Component<Props, void> {
  config: AppConfigFilled;

  constructor(props) {
    super(props);
    this.config = getStorageState().config;
    usage.trackScreenView(CATEGORY_NAME);
  }

  static notificationReasons = {
    mentionReasons: 'You are mentioned',
    tagReasons: 'Enabled notifications for tags',
    savedSearchReasons: 'Enabled notifications for saved searches',
    workflow: 'Workflow notification'
  };

  componentDidMount() {
    this.refresh();
  }

  _renderRefreshControl = () => {
    return <RefreshControl
      refreshing={this.props.loading}
      onRefresh={this.refresh}
      tintColor={COLOR_PINK}
      testID="refresh-control"
    />;
  };

  goToIssue = (issue: Issue) => {
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
  };

  refresh = () => {
    this.props.loadInbox();
  };

  onLoadMore = () => {
    if (!this.props.loading && this.props.items.length > 0 && this.props.hasMore) {
      this.props.loadInbox(this.props.items.length);
    }
  };

  renderChangeValues = (values: Array<ChangeValue>, extraStyles: Object = {}) => values.map(value => (
    <View key={value.name || value.entityId}>
      <Text numberOfLines={5} style={{...styles.textPrimary, ...extraStyles}}>{value.name || value.id}</Text>
    </View>
  ));

  renderComment = (event: ChangeEvent) => (
    <View style={{flexDirection: 'row'}}>
      {this.renderChangeValues(event.addedValues)}
    </View>
  );

  renderSummaryChange = (event: ChangeEvent) => {
    return (
      <View>
        <Text style={styles.textSecondary}>{event.name}:</Text>
        {event.removedValues.length === 0 && this.renderChangeValues(event.addedValues)}
        {this.renderChangeValues(event.removedValues, {textDecorationLine: 'line-through'})}
      </View>
    );
  };

  renderDescriptionChange = (event: ChangeEvent) => (
    <View>
      <Text style={styles.textSecondary}>{event.name}:</Text>
      {this.renderChangeValues(event.addedValues)}
      {this.renderChangeValues(event.removedValues, {textDecorationLine: 'line-through'})}
    </View>
  );

  renderCustomFieldChange = (event: ChangeEvent) => {
    return (
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}>
        <Text style={styles.textSecondary}>{event.name}: </Text>

        {this.renderChangeValues(event.removedValues,
          event.addedValues.length === 0 ? {textDecorationLine: 'line-through'} : {})}

        {Boolean(event.removedValues.length && event.addedValues.length) && <Text style={styles.textPrimary}> → </Text>}

        {this.renderChangeValues(event.addedValues)}
      </View>
    );
  };

  renderEvents = (events: Array<ChangeEvent> = []) => {
    const map = {
      summary: [],
      description: [],
      comments: [],
      customFields: []
    };
    const hasValues = (values: Array<ChangeValue> = []) => values.filter(it => it.id || it.name).length;

    events.forEach((event: ChangeEvent) => {
      if (!hasValues(event.addedValues) && !hasValues(event.removedValues)) {
        return;
      }

      switch (true) {
      case event.category === 'COMMENT':
        map.comments.push(this.renderComment(event));
        break;
      case event.category === 'SUMMARY':
        map.summary.push(this.renderSummaryChange(event));
        break;
      case event.category === 'DESCRIPTION':
        map.description.push(this.renderDescriptionChange(event));
        break;
      default:
        map.customFields.push(this.renderCustomFieldChange(event));
      }
    });

    const renderNode = (node, index: number) => (
      <View
        key={index}
        style={{marginTop: index > 0 ? 6 : 0}}
      >
        {node}
      </View>
    );

    return (
      <View style={{flexShrink: 1}}>
        {[
          ...map.summary,
          ...map.description,
          ...map.customFields,
          ...map.comments
        ].map(renderNode)}
      </View>
    );
  };

  getNotificationText(metadata: Metadata): string {
    const PARSE_ERROR_NOTIFICATION: string = '<i>Unable to show notification text.</i>';
    return metadata && (metadata.body || metadata.text || metadata.subject) || PARSE_ERROR_NOTIFICATION;
  }

  isIssueDigestChange(metadata: Metadata): boolean {
    return metadata && metadata.change;
  }

  renderNotification = ({item}: Notification) => {
    const metadata: Metadata = item.metadata;

    if (this.isIssueDigestChange(metadata)) {
      return this.renderIssueChange(item, metadata);
    }

    if (metadata.subject || metadata.body) { //workflow
      return this.renderWorkflowNotification(this.getNotificationText(metadata));
    }

    return null;
  };

  renderWorkflowNotification = (text: string) => {
    const title: string = 'Workflow notification';

    return (
      <View style={styles.card}>
        <View><Text style={[styles.textPrimary, styles.strong]}>{`${title}:`}</Text></View>

        <View style={[styles.cardContent, styles.cardContentWorkflow]}>
          <Text style={styles.textPrimary}>
            {text}
          </Text>
        </View>

        {this.renderNotificationReason({
          reason: {
            title: [{title}]
          }
        })}
      </View>
    );
  };

  getEvenValueName(value: Object) {
    return value.name;
  }

  createAvatarUrl(sender: User): string | null {
    if (!sender.avatarUrl || !this.config || !this.config.backendUrl) {
      return null;
    }
    return handleRelativeUrl(sender.avatarUrl, this.config.backendUrl);
  }

  renderNotificationReason(metadata: Metadata) {
    if (!metadata.reason) {
      return null;
    }

    const _reasons = Object.keys(metadata.reason).reduce((reasons, key) => {
      if (metadata.reason[key].length) {
        const isMention = key === Inbox.notificationReasons.mentionReasons;
        return reasons.concat(
          {
            title: Inbox.notificationReasons[key] ? `${Inbox.notificationReasons[key]} ` : '',
            value: isMention ? '' : metadata.reason[key].map(this.getEvenValueName).join(', ')
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

  renderIssueChange = (item, metadata) => {
    const onPress = () => this.goToIssue(metadata.issue);
    const sender: User = item.sender;
    const events: Array<ChangeEvent> = metadata?.change?.events;
    const avatarURL: string | null = this.createAvatarUrl(sender);
    if (avatarURL) {
      sender.avatarUrl = avatarURL;
    }

    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.header}>
          <Text numberOfLines={2} style={styles.summary}>{metadata.issue.summary}</Text>
          <Image style={styles.arrowImage} source={next}/>
        </View>

        <View style={styles.subHeader}>
          <Text style={styles.issueId}>{metadata.issue.id}</Text>
        </View>

        <UserInfo style={styles.userInfo} user={sender} timestamp={metadata?.change?.endTimestamp}/>

        {Boolean(events && events.length) && <View style={styles.cardContent}>
          <View>{this.renderEvents(events)}</View>
        </View>}

        {this.renderNotificationReason(metadata)}
      </TouchableOpacity>
    );
  };

  getNotificationId = notification => notification.id;


  _renderListMessage = () => {
    const {loading, items} = this.props;
    if (!loading && items.length === 0) {
      return (
        <View>
          <Text style={styles.listMessageSmile}>(・_・)</Text>
          <Text style={styles.listFooterMessage} testID="no-notifications">You have no notifications</Text>
        </View>
      );
    }

    return null;
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
            refreshControl={this._renderRefreshControl()}
            refreshing={loading}
            keyExtractor={this.getNotificationId}
            renderItem={this.renderNotification}
            onEndReached={this.onLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={this._renderListMessage}
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

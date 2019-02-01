/* @flow */
import {FlatList, Image, View, Text, Platform, RefreshControl, TouchableOpacity} from 'react-native';
import React, {Component} from 'react';

import styles from './inbox.styles';
import issueStyles from '../single-issue/single-issue.styles';
import Header from '../../components/header/header';
import usage from '../../components/usage/usage';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as inboxActions from './inbox-actions';
import type {InboxState} from './inbox-reducers';
import Router from '../../components/router/router';
import {next} from '../../components/icon/icon';
import {openMenu} from '../../actions/app-actions';
import Menu from '../../components/menu/menu';
import {getEntityPresentation, relativeDate} from '../../components/issue-formatter/issue-formatter';
import Avatar from '../../components/avatar/avatar';
import {COLOR_PINK} from '../../components/variables/variables';
import log from '../../components/log/log';

const CATEGORY_NAME = 'Inbox view';

type AdditionalProps = {
  openMenu: Function
};

type ChangeValue = {
  id?: string,
  name: string,
  entityId : string,
  type : string
}

type ChangeEvent = {
  multiValue: boolean,
  entityId: string,
  category?: 'COMMENT' | 'CUSTOM_FIELD' | 'SPRINT' | 'SUMMARY' | 'DESCRIPTION',
  name: String,
  addedValues: Array<ChangeValue>,
  removedValues: Array<ChangeValue>
};

type Reason = {
  type: string,
  name?: string
};

type ReasonCollection = {
  mentionReasons: Array<Reason>,
  tagReasons: Array<Reason>,
  savedSearchReasons: Array<Reason>
};

type Issue = {
  created: number,
  id: string,
  project: {
    entityId: string,
    shortName: string,
    name: string
  },
  resolved: ?boolean,
  starred: ?boolean,
  votes: number,
  summary: string,
  description: string
};

type Metadata = {
  type: string,
  initialNotification: boolean,
  onlyViaDuplicate: boolean,
  issue: Issue,
  change: {
    humanReadableTimeStamp: string,
    startTimestamp: number,
    endTimestamp: number,
    events: Array<ChangeEvent>
  },
  subject: ?string,
  body: ?string,
  header: string,
  reason: ?ReasonCollection
};

type Props = InboxState & typeof inboxActions & AdditionalProps;

class Inbox extends Component<Props, void> {
  constructor(props) {
    super(props);
    usage.trackScreenView(CATEGORY_NAME);
  }

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
      issuePlaceholder: {id: issue.id, summary: issue.summary, description: issue.description, created: issue.created},
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

  drawChangeValues = (values: Array<ChangeValue>, extraStyles: Object = {}) => values.map(value => (
    <View key={value.name || value.entityId}>
      <Text numberOfLines={5} style={{...styles.textPrimary, ...extraStyles}}>{value.name || value.id}</Text>
    </View>
  ));

  drawComment = event => (
    <View style={{flexDirection: 'row'}}>
      {this.drawChangeValues(event.addedValues)}
    </View>
  );

  drawSummaryChange = event => {
    return (
      <View>
        <Text style={styles.textSecondary}>{event.name}:</Text>
        {event.removedValues.length === 0 && this.drawChangeValues(event.addedValues)}
        {this.drawChangeValues(event.removedValues, {textDecorationLine: 'line-through'})}
      </View>
    );
  };

  drawDescriptionChange = event => (
    <View>
      <Text style={styles.textSecondary}>{event.name}:</Text>
      {this.drawChangeValues(event.addedValues)}
      {this.drawChangeValues(event.removedValues, {textDecorationLine: 'line-through'})}
    </View>
  );

  drawCustomFieldChange = event => {
    return (
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        <Text style={styles.textSecondary}>{event.name}: </Text>

        {this.drawChangeValues(event.removedValues, event.addedValues.length === 0 ? {textDecorationLine: 'line-through'} : {})}

        {Boolean(event.removedValues.length && event.addedValues.length) && <Text style={styles.textPrimary}> → </Text>}

        {this.drawChangeValues(event.addedValues)}
      </View>
    );
  };

  getReasonString = (reason: ?ReasonCollection) : string => {
    if (!reason) {
      return '';
    }

    let reasons = [];
    let reasonString = '';

    if (reason.mentionReasons.length > 0) {
      reasons.push('mention');
    }

    reasons = reasons.concat(reason.tagReasons.map(s => s.name));
    reasons = reasons.concat(reason.savedSearchReasons.map(s => s.name));

    const onlyUnique = (value, index, self) => {
      return self.indexOf(value) === index;
    };

    if (reasons.length) {
      reasonString = reasons.filter(onlyUnique).join(', ');
    }

    return reasonString;
  };

  getRestructuredEvents = events => {
    const map = {
      summary: [],
      description: [],
      comments: [],
      customFields: []
    };

    events.forEach((event: ChangeEvent, index: number) => {
      event.addedValues = event.addedValues.filter(v => v.id || v.name);
      event.removedValues = event.removedValues.filter(v => v.id || v.name);

      if (!event.addedValues.length && !event.removedValues.length) {
        return;
      }

      if (event.category === 'COMMENT') {
        map.comments.push(this.drawComment(event));
      } else if (event.category === 'SUMMARY') {
        map.summary.push(this.drawSummaryChange(event));
      } else if (event.category === 'DESCRIPTION') {
        map.description.push(this.drawDescriptionChange(event));
      } else {
        map.customFields.push(this.drawCustomFieldChange(event));
      }
    });

    const wrap = (node, index: number) => (<View key={index} style={{marginTop: index > 0 ? 6 : 0}}>{node}</View>);

    return (
      <View style={{flexShrink: 1}}>
        {[...map.summary, ...map.description, ...map.customFields, ...map.comments].map(wrap)}
      </View>
    );
  };

  renderNotification = ({item}) => {
    const metadata: Metadata = item.metadata;

    const reason = this.getReasonString(metadata.reason);

    if (metadata.change) {
      return this.renderIssueChange(item, metadata, reason);
    } else if (metadata.subject || metadata.body) {
      return this.renderWorkflowNotification(item, metadata, reason);
    } else {
      return null;
    }
  };

  renderWorkflowNotification = (item, metadata, reason) => {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text numberOfLines={2} style={styles.summary}>{metadata.subject}</Text>
        </View>

        {Boolean(reason) && <View style={styles.subHeader}>
          <Text style={styles.reason}>{reason}</Text>
        </View>}

        <View style={styles.cardContent}>
          <Text style={styles.textPrimary}>
            {metadata.body}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.author} numberOfLines={1}>Workflow notification</Text>
        </View>
      </View>
    );
  };

  renderIssueChange = (item, metadata, reason) => {
    const sender = item.sender;

    const onPress = () => this.goToIssue(metadata.issue);

    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.header}>
          <Text numberOfLines={2} style={styles.summary}>{metadata.issue.summary}</Text>
          <Image style={styles.arrowImage} source={next}></Image>
        </View>

        <View style={styles.subHeader}>
          <Text style={styles.issueId}>{metadata.issue.id}</Text>
          <Text style={styles.reason}>{reason}</Text>
        </View>

        <View style={styles.cardContent}>
          {Boolean(sender.avatarUrl) && <Avatar
            style={{marginRight: 10}}
            userName={getEntityPresentation(sender.author)}
            size={40}
            source={{uri: sender.avatarUrl}}
          />}

          {this.getRestructuredEvents(metadata.change.events)}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.author} numberOfLines={1}>{item.sender.login}</Text>
          <Text style={styles.date}>{relativeDate(metadata.change.endTimestamp)}</Text>
        </View>
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

          {Platform.OS == 'ios' && <KeyboardSpacer style={{backgroundColor: 'black'}}/>}
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

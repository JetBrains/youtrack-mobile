/* @flow */
import {FlatList, Image, View, Text, Platform, RefreshControl, TouchableOpacity} from 'react-native';
import React, {Component} from 'react';

import {decode as atob} from 'base-64';
import pako from 'pako';

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
import {getEntityPresentation, relativeDate} from '../../components/issue-formatter/issue-formatter';
import Avatar from '../../components/avatar/avatar';
import {COLOR_PINK} from '../../components/variables/variables';
import log from '../../components/log/log';

const CATEGORY_NAME = 'Inbox view';

type AdditionalProps = {
};

type ChangeValue = {
  name: string,
  entityId : string,
  type : string
}

type ChangeEvent = {
  multiValue: boolean,
  entityId: string,
  category?: 'COMMENT' | 'CUSTOM_FIELD' | 'SPRINT' | 'SUMMARY',
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
  header: string,
  reason: ReasonCollection
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


  handleOnBack = () => {
    const returned = Router.pop();
    if (!returned) {
      Router.IssueList();
    }
  };


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
      issuePlaceholder: issue,
      issueId: issue.id
    });
  };

  refresh = () => {
    this.props.loadInbox();
  };

  drawChangeValues = (values: Array<ChangeValue>, extraStyles: Object = {}) => values.map(value => (
    <View key={value.name || value.entityId}>
      <Text numberOfLines={5} style={{...styles.textPrimary, ...extraStyles}}>{value.name}</Text>
    </View>
  ));

  drawComment = event => (
    <View style={{flexDirection: 'row'}}>
      {this.drawChangeValues(event.addedValues)}
    </View>
  );

  drawSummaryChange = event => (
    <View>
      <Text style={styles.textSecondary}>{event.name}:</Text>
      {this.drawChangeValues(event.removedValues, {textDecorationLine: 'line-through'})}
    </View>
  );

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

        {this.drawChangeValues(event.removedValues)}

        {Boolean(event.removedValues.length && event.addedValues.length) && <Text style={styles.textPrimary}> → </Text>}

        {this.drawChangeValues(event.addedValues)}
      </View>
    );
  };

  getReasonString = (reason: ReasonCollection) : string => {
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

    events.forEach((event, index: number) => {
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

  renderItem = ({item}) => {
    const decoded = atob(item.metadata);
    const sender = item.sender;

    const data = pako.inflate(decoded);

    const strData = String.fromCharCode.apply(null, new Uint16Array(data));

    const metadata: Metadata = JSON.parse(strData);
    const reasonString = this.getReasonString(metadata.reason);

    const onPress = () => this.goToIssue(metadata.issue);

    return (
      <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.header}>
          <Text numberOfLines={2} style={styles.summary}>{metadata.issue.summary}</Text>
          <Image style={styles.arrowImage} source={next}></Image>
        </View>

        <View style={{marginTop: 4, flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.textSecondary}>{metadata.issue.id}</Text>
          <Text style={[styles.textSecondary, styles.reason]}>{reasonString}</Text>
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
          <Text style={{...styles.textSecondary, flexShrink: 1, marginRight: 10}} numberOfLines={1}>{item.sender.login}</Text>
          <Text style={styles.textSecondary}>{relativeDate(new Date(metadata.change.humanReadableTimeStamp))}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Header
          leftButton={<Text>Back</Text>}
          onBack={this.handleOnBack}
        >
          <Text style={issueStyles.headerText}>Notifications</Text>
        </Header>

        <FlatList
          data={this.props.items}
          refreshControl={this._renderRefreshControl()}
          refreshing={this.props.loading}
          keyExtractor={(item, index: number) => index.toString()}
          renderItem={this.renderItem}
        />

        {Platform.OS == 'ios' && <KeyboardSpacer style={{backgroundColor: 'black'}}/>}
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

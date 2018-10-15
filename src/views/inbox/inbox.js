/* @flow */
import {FlatList, Image, View, Text, Platform} from 'react-native';
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
import {getEntityPresentation} from '../../components/issue-formatter/issue-formatter';
import Avatar from '../../components/avatar/avatar';

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
  type: string
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
  reason: {
    mentionReasons: Array<Reason>,
    tagReasons: Array<Reason>,
    savedSearchReasons: Array<Reason>
  }
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

  refresh = () => {
    this.props.loadInbox();
  };

  drawChangeValues = (values: Array<ChangeValue>, styles: Object = {}) => values.map(value => (
    <View style={{flexShrink: 1}} key={value.name || value.entityId}>
      <Text style={styles}>{value.name}</Text>
    </View>
  ));

  drawComment = (event, sender: Object) => (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Avatar
        style={{marginRight: 10}}
        userName={getEntityPresentation(sender.author)}
        size={40}
        source={{uri: sender.avatarUrl}}
      />

      {this.drawChangeValues(event.addedValues)}
    </View>
  );

  drawSummaryChange = event => (
    <View>
      {this.drawChangeValues(event.removedValues, {textDecorationLine: 'line-through'})}
      {this.drawChangeValues(event.addedValues)}
    </View>
  );

  drawCustomFieldChange = event => {
    return (
      <View style={{flexDirection: 'row'}}>
        <Text style={{color: '#555'}}>{event.name}: </Text>

        {this.drawChangeValues(event.removedValues)}

        {Boolean(event.removedValues.length && event.addedValues.length) && <Text> → </Text>}

        {this.drawChangeValues(event.addedValues)}
      </View>
    );
  };

  renderItem = ({item}) => {
    const decoded = atob(item.metadata);

    const data = pako.inflate(decoded);

    const strData = String.fromCharCode.apply(null, new Uint16Array(data));

    const metadata: Metadata = JSON.parse(strData);

    return (
      <View style={{marginBottom: 20, padding: 10, backgroundColor: '#fff', borderBottomColor: '#dfe5eb', borderBottomWidth: 1, borderTopColor: '#dfe5eb', borderTopWidth: 1}}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text numberOfLines={2} style={{flexShrink: 1}}>{metadata.issue.summary}</Text>
          <Image style={styles.arrowImage} source={next}></Image>
        </View>

        <View style={{marginTop: 4, flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: '#555'}}>{metadata.issue.id}</Text>
          <Text style={{color: '#555'}}></Text>
        </View>

        <View style={{marginTop: 10, paddingTop: 10, borderTopColor: '#dfe5eb', borderTopWidth: 1}}>
          {metadata.change.events.map((event, index: number) => {
            let changeComponent;

            if (event.category === 'COMMENT') {
              changeComponent = this.drawComment(event, item.sender);
            } else if (event.category === 'SUMMARY') {
              changeComponent = this.drawSummaryChange(event);
            } else {
              changeComponent = this.drawCustomFieldChange(event);
            }

            return (<View key={index}>{changeComponent}</View>);
          })}
        </View>

        <View style={{marginTop: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{color: '#555', flexShrink: 1, marginRight: 10}} numberOfLines={1}>{item.sender.login}</Text>
          <Text style={{color: '#555'}}>{metadata.change.humanReadableTimeStamp}</Text>
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Header
          leftButton={<Text>Back</Text>}
          onBack={this.handleOnBack}
        >
          <Text style={issueStyles.headerText}>Inbox</Text>
        </Header>

        <FlatList
          data={this.props.items}
          refreshing={this.props.loading}
          onRefresh={this.refresh}
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

/* @flow */
import {FlatList, View, Text, Platform} from 'react-native';
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
  name: String,
  addedValues: Array<ChangeValue>,
  removedValues: Array<ChangeValue>
};

type Reason = {
  type: string
};

type Issue = {
  created: number,
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

  renderItem = ({item, index}) => {
    const decoded = atob(item.metadata);

    const data = pako.inflate(decoded);

    const strData = String.fromCharCode.apply(null, new Uint16Array(data));

    const metadata: Metadata = JSON.parse(strData);

    return (
      <View style={{marginBottom: 20}}>
        {/*<Text>{metadata.header}</Text>*/}
        <Text>{metadata.issue.summary}</Text>
        <Text>{metadata.change.humanReadableTimeStamp}</Text>

        {metadata.change.events.map((event: ChangeEvent, index: number) => (
          <View key={index}>
            <Text>{event.name}</Text>

            {event.addedValues.map((value: ChangeValue) => (
              <View key={value.entityId}>
                <Text>+ {value.name}</Text>
              </View>
            ))}

            {event.removedValues.map((value: ChangeValue) => (
              <View key={value.entityId}>
                <Text>- {value.name}</Text>
              </View>
            ))}
          </View>
        ))}
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

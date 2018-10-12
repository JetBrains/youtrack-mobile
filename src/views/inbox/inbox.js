/* @flow */
import {FlatList, View, Text, Platform} from 'react-native';
import React, {Component} from 'react';

import {decode as atob} from 'base-64';

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

    return (
      <Text key={index}>{JSON.stringify(decoded)}</Text>
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

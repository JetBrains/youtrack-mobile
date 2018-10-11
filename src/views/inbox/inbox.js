/* @flow */
import {ScrollView, View, Text, Platform} from 'react-native';
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

const CATEGORY_NAME = 'Inbox view';

type AdditionalProps = {
  predefinedDraftId: ?string
};
type Props = InboxState & typeof inboxActions & AdditionalProps;

class Inbox extends Component<Props, void> {
  fieldsPanel: Object;

  constructor(props) {
    super(props);
    usage.trackScreenView(CATEGORY_NAME);
  }

  componentDidMount() {
    this.props.loadInbox();
  }

  render() {
    const {
      storeDraftAndGoBack,
    } = this.props;

    return (
      <View style={styles.container}>
        <Header leftButton={<Text>Cancel</Text>}
          onBack={storeDraftAndGoBack}>
          <Text style={issueStyles.headerText}>New Issue</Text>
        </Header>
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
          <View>

          </View>
        </ScrollView>

        {Platform.OS == 'ios' && <KeyboardSpacer style={{backgroundColor: 'black'}}/>}
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {inbox: state.inbox, ...ownProps};
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(inboxActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Inbox);

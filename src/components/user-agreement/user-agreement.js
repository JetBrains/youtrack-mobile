/* @flow */
import React, {Component} from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Linking } from 'react-native';
import { MarkdownView } from 'react-native-markdown-view';

import {connect} from 'react-redux';
import styles, {markdownStyles} from './user-agreement.styles';
import getTopPadding from '../../components/header/header__top-padding';
import {acceptUserAgreement, declineUserAgreement} from '../../actions/app-actions';

import type EndUserAgreement from '../../flow/AppConfig';

type Props = {
  show: boolean,
  agreement: EndUserAgreement,
  onAccept: Function,
  onDecline: Function
};

type State = {
  canAccept: boolean
};

export class UserAgreementView extends Component<Props, State> {
  state = {canAccept: false};

  onScroll = (event: Object) => {
    const SCROLL_GAP = 100;
    const {nativeEvent} = event;
    const isScrolledDown =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
      nativeEvent.contentSize.height - SCROLL_GAP;

    if (isScrolledDown) {
      this.setState({canAccept: true});
    }
  };

  onLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  render() {
    const {show, agreement, onAccept, onDecline} = this.props;
    const {canAccept} = this.state;
    if (!show) {
      return null;
    }

    return (
      <Modal
        animationType="fade"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={[styles.container, {paddingTop: getTopPadding()}]}>
          <ScrollView
            contentContainerStyle={styles.markdownScroll}
            onScroll={this.onScroll}
            scrollEventThrottle={10}
          >
            <MarkdownView
              onLinkPress={this.onLinkPress}
              styles={markdownStyles}
            >
              {agreement.text}
            </MarkdownView>
          </ScrollView>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.button}
              onPress={onAccept}
              disabled={!canAccept}
            >
              <Text style={[styles.buttonText, (!canAccept && styles.buttonTextDisabled)]}>
                {canAccept ? 'Accept' : 'Scroll to accept'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onDecline}>
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    show: state.app.showUserAgreement,
    agreement: state.app.endUserAgreement,
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onAccept: () => dispatch(acceptUserAgreement()),
    onDecline: () => dispatch(declineUserAgreement())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserAgreementView);

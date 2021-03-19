/* @flow */

import React, {Component} from 'react';

import {connect} from 'react-redux';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import Markdown from 'react-native-markdown-display';

import ModalView from '../modal-view/modal-view';

import {acceptUserAgreement, declineUserAgreement} from '../../actions/app-actions';

import {UNIT} from '../variables/variables';

import styles from './user-agreement.styles';

import type {EndUserAgreement} from '../../flow/AppConfig';

type Props = {
  show: boolean,
  agreement: EndUserAgreement,
  onAccept: Function,
  onDecline: Function
};

export class UserAgreementView extends Component<Props, void> {

  onLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  render() {
    const {show, agreement, onAccept, onDecline} = this.props;
    if (!show || !agreement?.text) {
      return null;
    }

    return (
      <ModalView
        animationType="fade"
        transparent={true}
        onRequestClose={() => {}}
      >
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.markdownScroll}
          >
            <Markdown
            >
              {agreement.text}
            </Markdown>
          </ScrollView>
          <View style={styles.buttons}>
            <TouchableOpacity
              hitSlop={{top: UNIT, left: UNIT, bottom: UNIT, right: UNIT}}
              style={styles.button}
              onPress={onAccept}
            >
              <Text style={styles.buttonText}>
                Accept
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onDecline}>
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ModalView>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    show: state.app.showUserAgreement,
    agreement: state.app.endUserAgreement,
    ...ownProps,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onAccept: () => dispatch(acceptUserAgreement()),
    onDecline: () => dispatch(declineUserAgreement()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserAgreementView);

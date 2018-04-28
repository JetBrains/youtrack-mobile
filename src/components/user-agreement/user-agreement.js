/* @flow */
import React, {Component} from 'react';
import { MarkdownView } from 'react-native-markdown-view';

import {connect} from 'react-redux';
import { View, Text, TouchableOpacity, Modal, ScrollView} from 'react-native';
import styles from './user-agreement.styles';
import getTopPadding from '../../components/header/header__top-padding';
import {acceptUserAgreement, declineUserAgreement} from '../../actions/app-actions';

import type EndUserAgreement from '../../flow/AppConfig';

type Props = {
  show: boolean,
  agreement: EndUserAgreement,
  onAccept: Function,
  onDecline: Function
};

export class UserAgreementView extends Component<Props, void> {
  render() {
    const {show, agreement, onAccept, onDecline} = this.props;
    if (!show) {
      return null;
    }

    return (
      <Modal
        animationType="fade"
        transparent={true}
      >
        <View style={[styles.container, {paddingTop: getTopPadding()}]}>
          <ScrollView contentContainerStyle={styles.markdownScroll}>
            <MarkdownView>
              {agreement.text}
            </MarkdownView>
          </ScrollView>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.closeButton} onPress={onAccept}>
              <Text style={styles.closeButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onDecline}>
              <Text style={styles.closeButtonText}>Decline</Text>
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

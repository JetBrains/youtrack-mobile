import React, {Component} from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {connect} from 'react-redux';
import ModalView from '../modal-view/modal-view';
import {acceptUserAgreement, declineUserAgreement} from 'actions/app-actions';
import {i18n} from 'components/i18n/i18n';
import {UNIT} from '../variables/variables';
import styles from './user-agreement.styles';
import type {EndUserAgreement} from 'flow/AppConfig';
import MarkdownView from '../wiki/markdown-view';
type Props = {
  show: boolean;
  agreement: EndUserAgreement;
  onAccept: (...args: Array<any>) => any;
  onDecline: (...args: Array<any>) => any;
};
export class UserAgreementView extends Component<Props, void> {
  render(): React.ReactNode {
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
          <ScrollView contentContainerStyle={styles.markdownScroll}>
            <MarkdownView>{agreement.text}</MarkdownView>
          </ScrollView>
          <View style={styles.buttons}>
            <TouchableOpacity
              hitSlop={{
                top: UNIT,
                left: UNIT,
                bottom: UNIT,
                right: UNIT,
              }}
              style={styles.button}
              onPress={onAccept}
            >
              <Text style={styles.buttonText}>{i18n('Accept')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onDecline}>
              <Text style={styles.buttonText}>{i18n('Decline')}</Text>
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

const mapDispatchToProps = dispatch => {
  return {
    onAccept: () => dispatch(acceptUserAgreement()),
    onDecline: () => dispatch(declineUserAgreement()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserAgreementView);

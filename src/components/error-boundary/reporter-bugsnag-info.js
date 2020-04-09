/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, TouchableOpacity, Linking} from 'react-native';
import ModalView from '../modal-view/modal-view';

import styles from './reporter-bugsnag-info.styles';

type Props = {
  onHide: () => any
};

const JB_URL: string = 'https://www.jetbrains.com/company/privacy.html';
const BUGSNAG_URL: string = 'https://docs.bugsnag.com/legal/privacy-policy/';

export default class ReporterBugsnagInfo extends PureComponent<Props, void> {

  openPrivacyURL(isJB: boolean) {
    Linking.openURL(isJB ? JB_URL : BUGSNAG_URL);
  }

  render() {
    return (
      <ModalView
        transparent={true}
        animationType={'fade'}
        style={styles.extendedReportModal}
      >
        <View style={styles.extendedReportModalContainer}>

          <View style={styles.extendedReportModalContent}>
            <View>
              <Text style={styles.extendedReportModalTitle}>Help us fix problems faster</Text>
              <Text style={[styles.extendedReportModalText, styles.extendedReportModalTextInfo]}>
                In addition to our built-in error reporting, YouTrack Mobile uses Bugsnag,
                a third-party service, that help us diagnose and fix problems faster, monitor application stability.
                We will only share error report data with Bugsnag if you agree to do so.
              </Text>
            </View>

            <TouchableOpacity onPress={() => this.openPrivacyURL(true)}>
              <Text style={styles.link}>JetBrains privacy policy</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.openPrivacyURL(false)}>
              <Text style={styles.link}>Bugsnag privacy policy</Text>
            </TouchableOpacity>

            <View style={styles.extendedReportModalButtons}>
              <TouchableOpacity
                onPress={this.props.onHide}
                style={styles.extendedReportButton}
              >
                <Text style={styles.extendedReportButtonText}>Close</Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </ModalView>
    );
  }
}

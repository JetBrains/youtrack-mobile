/* @flow */
import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Linking} from 'react-native';
import usage from '../usage/usage';
import styles from './error-boundary.styles';
import {connect} from 'react-redux';
import {openDebugView} from '../../actions/app-actions';
import log from '../log/log';
import {sendErrorReport, createReportErrorData} from '../error/error-reporter';
import {notify} from '../notification/notification';
import {flushStoragePart} from '../storage/storage';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IconFA from 'react-native-vector-icons/FontAwesome';
import {COLOR_ICON_MEDIUM_GREY, COLOR_MEDIUM_GRAY, COLOR_PINK} from '../variables/variables';
import Popup from '../popup/popup';
import ReporterBugsnag from './reporter-bugsnag';

import type {ReportErrorData} from '../error/error-reporter';

type Props = {
  openDebugView: any => any,
  children: React$Element<any>
};
type State = {
  error: ?Error,
  isReporting: boolean,
  isExtendedReportEnabled: boolean,
  isExtendedReportInfoVisible: boolean
};

class ErrorBoundary extends Component<Props, State> {
  ERROR_TITLE = 'Something went wrong';

  state = {
    error: null,
    isReporting: false,
    isExtendedReportEnabled: true,
    isExtendedReportInfoVisible: false
  };

  componentDidCatch(error: Error, info: Object) {
    log.warn(`${this.ERROR_TITLE}:\n${error.toString()}`);
    usage.trackError(error, info.componentStack);
    this.setState({error});
    // Reset stored route
    flushStoragePart({lastRoute: null});
  }

  contactSupport = () => Linking.openURL('https://youtrack-support.jetbrains.com/hc/en-us/requests/new');

  reportCrash = async () => {
    const {error} = this.state;

    if (!error) {
      return;
    }

    const errorData: ReportErrorData = await createReportErrorData(error, true);

    try {
      this.setState({isReporting: true});

      if (this.state.isExtendedReportEnabled) {
        ReporterBugsnag.notify(error);
      }

      const reportedId = await sendErrorReport(`Render crash report: ${errorData.summary}`, errorData.description);
      if (reportedId) {
        notify(`Crash has been reported`);
      }
    } catch (err) {
      const errorMsg: string = 'Failed to report the crash.';
      log.warn(errorMsg, err);
      notify(`${errorMsg} Try one more time.`, err);
    } finally {
      this.setState({isReporting: false});
    }
  };

  renderExtendedReportPopupContent() {
    return (
      <React.Fragment>
        <View>
          <Text style={styles.extendedReportModalTitle}>Help us fix problems faster</Text>
          <Text style={[styles.extendedReportModalText, styles.extendedReportModalTextInfo]}>
            In addition to our built-in error reporting, YouTrack Mobile uses Bugsnag,
            a third-party service, that help us diagnose and fix problems faster, monitor application stability.
            We will only share error report data with Bugsnag if you agree to do so.
          </Text>
        </View>

        <TouchableOpacity onPress={() => Linking.openURL('https://www.jetbrains.com/company/privacy.html')}>
          <Text style={styles.extendedReportModalTextLink}>JetBrains privacy policy</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL('https://docs.bugsnag.com/legal/privacy-policy/')}>
          <Text style={styles.extendedReportModalTextLink}>Bugsnag privacy policy</Text>
        </TouchableOpacity>

      </React.Fragment>
    );
  }

  toggleInfoModalVisibility = () => {
    const {isExtendedReportInfoVisible} = this.state;
    this.setState({isExtendedReportInfoVisible: !isExtendedReportInfoVisible});
  };

  render() {
    const {error, isReporting, isExtendedReportEnabled, isExtendedReportInfoVisible} = this.state;
    const {openDebugView} = this.props;

    if (error) {
      const buttonStyle = [styles.button, isReporting ? styles.buttonDisabled : null];

      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              style={buttonStyle}
              disabled={isReporting}
              onPress={openDebugView}
            >
              <Text style={styles.buttonText}>Show logs</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.message}>
            <IconFA
              name="exclamation-circle"
              size={64}
              color={COLOR_ICON_MEDIUM_GREY}
            />
            <Text style={styles.title}>{this.ERROR_TITLE}</Text>
          </View>

          <View style={styles.sendReport}>
            <TouchableOpacity
              style={[styles.buttonSendReport, buttonStyle]}
              disabled={isReporting}
              onPress={this.reportCrash}
            >
              <Text
                style={[
                  styles.buttonText,
                  styles.buttonSendReportText
                ]}
              >
                {`${isReporting ? 'Sending' : 'Send'}  crash report${isReporting ? '...' : ''}`}
              </Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.row}
                disabled={isReporting}
                onPress={() => this.setState({isExtendedReportEnabled: !isExtendedReportEnabled})}
              >
                <IconMaterial
                  name={isExtendedReportEnabled ? 'checkbox-marked' : 'checkbox-blank-outline'}
                  size={24}
                  color={isReporting ? COLOR_MEDIUM_GRAY : COLOR_PINK}
                />
                <Text style={styles.sendReportText}>Send extended report to Bugsnag</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isReporting}
                onPress={this.toggleInfoModalVisibility}
              >
                <IconMaterial
                  name="information"
                  size={24}
                  color={COLOR_MEDIUM_GRAY}
                />
              </TouchableOpacity>

            </View>
          </View>

          <View>
            <TouchableOpacity
              disabled={isReporting}
              style={buttonStyle}
              onPress={this.contactSupport}
            >
              <Text style={styles.buttonText}>Contact support</Text>
            </TouchableOpacity>
          </View>

          {isExtendedReportInfoVisible && (
            <Popup
              childrenRenderer={this.renderExtendedReportPopupContent}
              onHide={this.toggleInfoModalVisibility}
            />
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    openDebugView: () => dispatch(openDebugView())
  };
};

export default connect(() => ({}), mapDispatchToProps)(ErrorBoundary);

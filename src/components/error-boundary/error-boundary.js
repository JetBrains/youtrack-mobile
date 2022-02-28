/* @flow */

import React, {Component} from 'react';

import {View, Text, TouchableOpacity, Linking} from 'react-native';

import Bugsnag from '@bugsnag/react-native';
import RNRestart from 'react-native-restart';

import IconFA from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import log from '../log/log';
import Popup from '../popup/popup';
import usage from '../usage/usage';
import {connect} from 'react-redux';
import {flushStoragePart} from '../storage/storage';
import {i18n} from '../i18n/i18n';
import {notify} from '../notification/notification';
import {openDebugView} from 'actions/app-actions';
import {sendReport, createReportErrorData} from '../error/error-reporter';
import {ThemeContext} from '../theme/theme-context';

import {HIT_SLOP} from '../common-styles/button';
import styles from './error-boundary.styles';

import type {ReportErrorData} from '../error/error-reporter';
import type {Theme, UIThemeColors} from 'flow/Theme';

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
    isExtendedReportInfoVisible: false,
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
        Bugsnag.notify(error);
      }

      const reportedIssueId: ?string = await sendReport(`Render crash report: ${errorData.summary}`, errorData.description);
      if (reportedIssueId) {
        notify('Crash has been reported');
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
          <Text style={styles.extendedReportModalTitle}>{i18n('Help us fix problems faster')}</Text>
          <Text style={[styles.extendedReportModalText, styles.extendedReportModalTextInfo]}>
            {i18n('In addition to our built-in error reporting, YouTrack Mobile uses Bugsnag, a third-party service, that help us diagnose and fix problems faster, monitor application stability.We will only share error report data with Bugsnag if you agree to do so.')}
          </Text>
        </View>

        <TouchableOpacity onPress={() => Linking.openURL('https://www.jetbrains.com/company/privacy.html')}>
          <Text style={styles.extendedReportModalTextLink}>{i18n('JetBrains privacy policy')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL('https://docs.bugsnag.com/legal/privacy-policy/')}>
          <Text style={styles.extendedReportModalTextLink}>{i18n('Bugsnag privacy policy')}</Text>
        </TouchableOpacity>

      </React.Fragment>
    );
  }

  toggleInfoModalVisibility = () => {
    const {isExtendedReportInfoVisible} = this.state;
    this.setState({isExtendedReportInfoVisible: !isExtendedReportInfoVisible});
  };

  restart = () => {
    try {
      RNRestart.Restart();
    } catch (err) {
      notify('Failed to restart the app automatically. Try restart it manually.');
    }
  };

  render() {
    const {error, isReporting, isExtendedReportEnabled, isExtendedReportInfoVisible} = this.state;
    const {openDebugView} = this.props;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          if (error) {
            const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
            const buttonStyle = [styles.button, isReporting ? styles.buttonDisabled : null];

            return (
              <View style={styles.container}>
                <View style={styles.header}>
                  <TouchableOpacity
                    hitSlop={HIT_SLOP}
                    style={buttonStyle}
                    disabled={isReporting}
                    onPress={openDebugView}
                  >
                    <Text style={styles.buttonText}>{i18n('Show logs')}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.message}>
                  <IconFA
                    name="exclamation-circle"
                    size={64}
                    color={uiThemeColors.$icon}
                  />
                  <Text style={styles.title}>{this.ERROR_TITLE}</Text>

                  <TouchableOpacity
                    hitSlop={HIT_SLOP}
                    disabled={isReporting}
                    style={styles.restartLink}
                    onPress={this.restart}
                  >
                    <Text style={styles.buttonText}>{i18n('Restart')}</Text>
                  </TouchableOpacity>
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
                        styles.buttonSendReportText,
                      ]}
                    >
                      {isReporting ? i18n('Sending crash report...') : i18n('Send crash report')}
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
                        color={isReporting ? uiThemeColors.$disabled : uiThemeColors.$link}
                      />
                      <Text style={styles.sendReportText}>{i18n('Send extended report to Bugsnag')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      disabled={isReporting}
                      onPress={this.toggleInfoModalVisibility}
                    >
                      <IconMaterial
                        name="information"
                        size={24}
                        color={uiThemeColors.$icon}
                      />
                    </TouchableOpacity>

                  </View>
                </View>

                <View>
                  <TouchableOpacity
                    hitSlop={HIT_SLOP}
                    disabled={isReporting}
                    style={buttonStyle}
                    onPress={this.contactSupport}
                  >
                    <Text style={styles.buttonText}>{i18n('Contact support')}</Text>
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
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    openDebugView: () => dispatch(openDebugView()),
  };
};

export default (connect(() => ({}), mapDispatchToProps)(ErrorBoundary): any);

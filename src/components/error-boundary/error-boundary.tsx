import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Linking} from 'react-native';
import RNRestart from 'react-native-restart';
import IconFA from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import log from '../log/log';
import Popup from '../popup/popup';
import usage from '../usage/usage';
import {connect} from 'react-redux';
import {flushStoragePart} from '../storage/storage';
import {i18n} from 'components/i18n/i18n';
import {notify, notifyError} from '../notification/notification';
import {openDebugView} from 'actions/app-actions';
import {sendReport, createReportErrorData} from '../error/error-reporter';
import {ThemeContext} from '../theme/theme-context';
import {HIT_SLOP} from '../common-styles/button';
import {captureException} from '../../../sentry';

import styles from './error-boundary.styles';

import type {ReportErrorData} from '../error/error-reporter';
import type {Theme, UIThemeColors} from 'types/Theme';
type Props = {
  openDebugView: (arg0: any) => any;
  children: React.ReactElement<React.ComponentProps<any>, any>;
};
type State = {
  error: Error | null | undefined;
  isReporting: boolean;
  isExtendedReportEnabled: boolean;
  isExtendedReportInfoVisible: boolean;
};

class ErrorBoundary extends Component<Props, State> {
  ERROR_TITLE = 'Something went wrong';
  state = {
    error: null,
    isReporting: false,
    isExtendedReportEnabled: true,
    isExtendedReportInfoVisible: false,
  };

  componentDidCatch(error: Error, info: Record<string, any>) {
    log.warn(`${this.ERROR_TITLE}:\n${error.toString()}`);
    usage.trackError(info.componentStack);
    this.setState({
      error,
    });
    // Reset stored route
    flushStoragePart({
      lastRoute: null,
    });
  }

  contactSupport = () =>
    Linking.openURL(
      'https://youtrack-support.jetbrains.com/hc/en-us/requests/new',
    );
  reportCrash = async () => {
    const {error} = this.state;

    if (!error) {
      return;
    }

    const errorData: ReportErrorData = await createReportErrorData(error, true);

    try {
      this.setState({isReporting: true});

      captureException(error);

      const reportedIssueId: string | null | undefined = await sendReport(
        `Render crash report: ${errorData.summary}`,
        errorData.description,
      );

      if (reportedIssueId) {
        notify(i18n('Crash report sent'));
      }
    } catch (err) {
      notifyError(err);
    } finally {
      this.setState({
        isReporting: false,
      });
    }
  };

  renderExtendedReportPopupContent() {
    return (
      <React.Fragment>
        <View>
          <Text style={styles.extendedReportModalTitle}>
            {i18n('Help us fix problems faster')}
          </Text>
          <Text
            style={[
              styles.extendedReportModalText,
              styles.extendedReportModalTextInfo,
            ]}
          >
            {i18n(
              'In addition to our built-in error reporting, YouTrack Mobile uses Sentry, a third-party service that helps us diagnose problems and monitor application stability. We only share report data with Sentry if you agree to allow us to do so.',
            )}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://www.jetbrains.com/company/privacy.html')
          }
        >
          <Text style={styles.extendedReportModalTextLink}>
            {i18n('JetBrains Privacy Policy')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://sentry.io/privacy')
          }
        >
          <Text style={styles.extendedReportModalTextLink}>
            {i18n('Sentry Privacy Policy')}
          </Text>
        </TouchableOpacity>
      </React.Fragment>
    );
  }

  toggleInfoModalVisibility = () => {
    const {isExtendedReportInfoVisible} = this.state;
    this.setState({
      isExtendedReportInfoVisible: !isExtendedReportInfoVisible,
    });
  };
  restart = () => {
    try {
      RNRestart.Restart();
    } catch (err) {
      notify(
        i18n(
          'The application failed to restart automatically. Please try to restart it manually.',
        ),
      );
    }
  };

  render() {
    const {
      error,
      isReporting,
      isExtendedReportEnabled,
      isExtendedReportInfoVisible,
    } = this.state;
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          if (error) {
            const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
            const buttonStyle = [
              styles.button,
              isReporting ? styles.buttonDisabled : null,
            ];
            return (
              <View style={styles.container}>
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
                      style={[styles.buttonText, styles.buttonSendReportText]}
                    >
                      {isReporting
                        ? i18n('Sending crash report…')
                        : i18n('Send crash report')}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.row}>
                    <TouchableOpacity
                      style={styles.row}
                      disabled={isReporting}
                      onPress={() =>
                        this.setState({
                          isExtendedReportEnabled: !isExtendedReportEnabled,
                        })
                      }
                    >
                      <IconMaterial
                        name={
                          isExtendedReportEnabled
                            ? 'checkbox-marked'
                            : 'checkbox-blank-outline'
                        }
                        size={24}
                        color={
                          isReporting
                            ? uiThemeColors.$disabled
                            : uiThemeColors.$link
                        }
                      />
                      <Text style={styles.sendReportText}>
                        {i18n('Send extended report to Sentry')}
                      </Text>
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
                    <Text style={styles.buttonText}>
                      {i18n('Contact support')}
                    </Text>
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

const mapDispatchToProps = dispatch => {
  return {
    openDebugView: () => dispatch(openDebugView()),
  };
};

export default connect(() => ({}), mapDispatchToProps)(ErrorBoundary);

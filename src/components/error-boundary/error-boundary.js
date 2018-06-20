/* @flow */
import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Linking} from 'react-native';
import usage from '../usage/usage';
import styles from './error-boundary.styles';
import {connect} from 'react-redux';
import {openDebugView} from '../../actions/app-actions';
import {getLogs} from '../debug-view/debug-view';
import log from '../log/log';
import {reportCrash} from './reporter';
import {notify} from '../notification/notification';

type Props = {
  openDebugView: any => any,
  children: React$Element<any>
};

type State = {
  error: ?Error
};

class ErrorBoundary extends Component<Props, State> {
  state = {
    error: null
  };

  componentDidCatch(error: Error, info: Object) {
    log.warn(`App has failed to render: ${error.toString()}`);
    usage.trackError(error, info.componentStack);
    this.setState({error});
  }

  contactSupport = () => Linking.openURL('https://youtrack-support.jetbrains.com/hc');

  reportCrash = async () => {
    if (!this.state.error) {
      return;
    }
    const errorMessage = this.state.error.toString();
    const errorSummary = errorMessage.split('\n')[0];
    const logs = await getLogs();
    const description = `
\`\`\`
${errorMessage}

============== LOGS ===============
${logs}
\`\`\`
    `;
    const reportedId = await reportCrash(`Render crash report: ${errorSummary}`, description);

    if (reportedId) {
      notify(`Issue "${reportedId}" has been reported`);
    }
  }

  render() {
    const {error} = this.state;
    const {openDebugView} = this.props;

    if (error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>The app has failed to render</Text>

          <TouchableOpacity onPress={this.reportCrash} style={styles.button}>
            <Text style={styles.buttonText}>Send crash report</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openDebugView} style={styles.button}>
            <Text style={styles.buttonText}>Open debug view</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={this.contactSupport} style={styles.button}>
            <Text style={styles.buttonText}>Contact support</Text>
          </TouchableOpacity>
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

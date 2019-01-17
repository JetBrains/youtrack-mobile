/* @flow */
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, TouchableOpacity, Modal, DeviceEventEmitter} from 'react-native';
import getTopPadding from '../header/header__top-padding';
import styles from '../debug-view/debug-view.styles';
import {closeScanView} from '../../actions/app-actions';

// $FlowFixMe: cannot make type check `react-native-camera` module because of mistakes there
import {RNCamera} from 'react-native-camera';

import Router from '../router/router';
import {applyCommand} from '../../views/single-issue/single-issue-actions';
import {
  applyCommandForDraft,
  storeProjectId,
  setIssueDraft
} from '../../views/create-issue/create-issue-actions';
import {notify} from '../notification/notification';
import {getStorageState} from '../storage/storage';
import {getApi} from '../api/api__instance';

const commandViews = {
  SingleIssue: applyCommand,
  CreateIssue: applyCommandForDraft
};

const getRoute = () => {
  const nav = Router._getNavigator().state.nav;
  const routeIndex = nav.index;
  return nav.routes[routeIndex];
};

type Props = {
  show: boolean,
  onHide: Function,
  draft?: Object,
  draftLoading: boolean,
  onCommandApply: Function,
  setIssueDraft: Function,
  storeProjectId: Function
};

export class ScanView extends Component<Props, void> {
  camera = null;

  constructor(props: Props) {
    super(props);

    DeviceEventEmitter.addListener('openWithUrl', this.processLink);
  }

  applyCommand = (command: string) => {
    const applyAction = commandViews[getRoute().routeName];

    if (applyAction) {
      return this.props.onCommandApply(command, applyAction);
    } else {
      notify(`Command can not be applied on this screen`);
    }
  };

  processLink = async (code: string) => {
    if (code.indexOf('youtrack://') !== -1) {
      const clearCode = code.replace('youtrack://', '').trim();
      const parts = clearCode.split(';');

      if (parts.length >= 2) {
        const [type, ...rest] = parts;

        if (type === 'issue') {
          Router.SingleIssue({issueId: rest[0]});
        } else if (type === 'command') {
          const [command] = rest;

          this.applyCommand(command);
        } else if (type === 'create') {
          const [projectKey, summary = '', description = '', command = ''] = rest;

          const projects = await getApi().getProjects(projectKey);
          const projectIndex = projects.findIndex(p => p.shortName === projectKey);

          if (projectIndex === -1) {
            notify(`Project ${projectKey} not found`);
            return;
          }

          const projectId = projects[projectIndex].id;

          const storedProjectId = getStorageState().projectId;
          if (!storedProjectId) {
            await this.props.storeProjectId(projectId);
          }

          Router.CreateIssue();

          // wait for draft being loaded or created
          while (!(this.props.draft && this.props.draft.id)) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // change project before real command
          if (this.props.draft.project.id !== projectId) {
            await this.applyCommand(`project ${projectKey}`);
          }

          if (command) {
            await this.applyCommand(command);
          }

          await this.props.setIssueDraft({summary, description});
        }
      } else if (parts.length === 1) {
        Router.SingleIssue({issueId: parts[0]});
      } else {
        notify('Wrong QR code format');
      }
    }
  };

  onBarCode = (data: Object) => {
    this.processLink(data.data);

    this.props.onHide();
  };

  render() {
    const {show, onHide} = this.props;
    if (!show) {
      return null;
    }

    return (
      <Modal
        animationType="slide"
        transparent={true}
        onRequestClose={onHide}
      >
        <View style={[styles.container, {paddingTop: getTopPadding()}]}>

          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={{flex: 1}}
            onBarCodeRead={this.onBarCode}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.auto}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
          />


          <View style={styles.buttons}>
            <TouchableOpacity style={styles.closeButton} onPress={onHide}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    show: state.app.showScanner,
    draft: state.creation.issue,
    draftLoading: state.creation.draftLoading,
    ...ownProps
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onHide: () => dispatch(closeScanView()),
    onCommandApply: (command, applyAction) => dispatch(applyAction(command)),
    setIssueDraft: (...args) => dispatch(setIssueDraft(...args)),
    storeProjectId: projectId => dispatch(storeProjectId(projectId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ScanView);

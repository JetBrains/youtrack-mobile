/* @flow */
import {BackHandler, View, UIManager} from 'react-native';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import store from './store';
import { Provider } from 'react-redux';
import Auth from './components/auth/auth';
import Router from './components/router/router';
import DebugView from './components/debug-view/debug-view';
import Home from './views/home/home';
import EnterServer from './views/enter-server/enter-server';
import LoginForm from './views/log-in/log-in';
import {setNotificationComponent} from './components/notification/notification';
import IssueList from './views/issue-list/issue-list';
import SingleIssue from './views/single-issue/single-issue';
import CreateIssue from './views/create-issue/create-issue';
import ShowImage from './views/show-image/show-image';
import AttachmentPreview from './views/attachment-preview/attachment-preview';
import AgileBoard from './views/agile-board/agile-board';
import {COLOR_BLACK} from './components/variables/variables';
import {getStoredConfigAndProceed, onNavigateBack} from './actions/app-actions';
// $FlowFixMe: cannot typecheck easy-toast module because of mistakes there
import Toast from 'react-native-easy-toast';

import ActionSheet from '@expo/react-native-action-sheet';

if (UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
/*
  Uncomment this string to debug network request in Chrome. Chrome should be run with --disable-web-security flag.
  Or use React Native Debugger https://github.com/jhen0409/react-native-debugger
  https://github.com/facebook/react-native/issues/934
*/
// GLOBAL.XMLHttpRequest = GLOBAL.originalXMLHttpRequest || GLOBAL.XMLHttpRequest;

class YouTrackMobile extends Component<void, void> {
  auth: Auth;
  _actionSheetRef: ?Object;

  static childContextTypes = {
    actionSheet: PropTypes.func
  };

  constructor() {
    super();

    this.registerRoutes();
    this.addAndroidBackButtonSupport();
    store.dispatch(getStoredConfigAndProceed());

    Router.onBack = (closingView) => {
      store.dispatch(onNavigateBack(closingView));
    };
  }

  getChildContext() {
    return {
      actionSheet: () => this._actionSheetRef
    };
  }

  addAndroidBackButtonSupport() {
    BackHandler.addEventListener('hardwareBackPress', function () {
      const populated = Router.pop();
      const preventCloseApp = populated;
      return preventCloseApp;
    });
  }

  registerRoutes() {
    Router.registerRoute({
      name: 'Home',
      component: Home,
      type: 'reset',
      props: {
        message: `Loading configuration...`,
        onChangeBackendUrl: oldUrl => Router.EnterServer({serverUrl: oldUrl})
      }
    });

    Router.registerRoute({
      name: 'EnterServer',
      component: EnterServer,
      type: 'reset'
    });

    Router.registerRoute({
      name: 'LogIn',
      component: LoginForm,
      type: 'reset'
    });

    Router.registerRoute({
      name: 'IssueList',
      component: IssueList,
      type: 'reset'
    });

    Router.registerRoute({name: 'SingleIssue', component: SingleIssue});

    Router.registerRoute({name: 'ShowImage', component: ShowImage, modal: true});

    Router.registerRoute({name: 'AttachmentPreview', component: AttachmentPreview, modal: true});

    Router.registerRoute({name: 'CreateIssue', component: CreateIssue});

    Router.registerRoute({name: 'AgileBoard', component: AgileBoard, type: 'reset'});

    Router.finalizeRoutes('Home');
  }

  actionSheetRef = (component: ?React$Element<any>) => {
    if (component) {
      this._actionSheetRef = component;
    }
  };

  render() {
    return (
      <Provider store={store}>
        <ActionSheet ref={this.actionSheetRef}>
          <View style={{flex: 1, backgroundColor: COLOR_BLACK}}>
            {Router.renderNavigatorView()}

            <Toast ref={toast => toast ? setNotificationComponent(toast) : null}/>

            <DebugView/>
          </View>
        </ActionSheet>
      </Provider>
    );
  }
}

module.exports = YouTrackMobile; //eslint-disable-line import/no-commonjs

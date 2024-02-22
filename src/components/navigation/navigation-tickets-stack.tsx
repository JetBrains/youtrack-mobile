import * as React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ParamListBase} from '@react-navigation/native';

import AttachmentPreview from 'views/attachment-preview/attachment-preview';
import CreateIssue from 'views/create-issue/create-issue';
import EnterServer from 'views/enter-server/enter-server';
import Issue from 'views/issue/issue';
import Issues from 'views/issues/issues';
import LinkedIssues from 'components/linked-issues/linked-issues';
import LinkedIssuesAddLink from 'components/linked-issues/linked-issues-add-link';
import LogIn from 'views/log-in/log-in';
import Page from 'views/page/page';
import PreviewFile from 'views/preview-file/preview-file';
import {defaultScreenOptions, Navigators, subscribeToScreenListeners} from 'components/navigation';
import {routeMap} from 'app-routes';

import {IssueLinksStackParams} from 'components/navigation/navigation-issues-stack';

type TicketsStackParams = IssueLinksStackParams & {
  [routeMap.CreateIssue]: any;
  [routeMap.EnterServer]: any;
  [routeMap.Tickets]: any;
  [routeMap.LogIn]: any;
};


const TicketsStack = createNativeStackNavigator<TicketsStackParams>();

const getCommonIssueStack = (StackName, postfix: string = '') => {
  return (
    <StackName.Group>
      <StackName.Screen
        name={`${routeMap.Issue}${postfix}`}
        component={Issue}
      />
      <StackName.Screen
        name={`${routeMap.LinkedIssues}${postfix}`}
        component={LinkedIssues}
      />
      <StackName.Screen
        name={`${routeMap.LinkedIssuesAddLink}${postfix}`}
        component={LinkedIssuesAddLink}
      />
    </StackName.Group>
  );
};

export default function TicketsStackNavigator({navigation}: NativeStackScreenProps<ParamListBase>) {
  return (
    <TicketsStack.Navigator
      key={Navigators.IssuesRoot}
      initialRouteName={routeMap.Tickets}
      screenOptions={defaultScreenOptions}
      screenListeners={() => subscribeToScreenListeners(Navigators.TicketsRoot)}
    >
      <TicketsStack.Group>
        <TicketsStack.Screen
          name={routeMap.EnterServer}
          component={EnterServer}
        />
        <TicketsStack.Screen
          name={routeMap.LogIn}
          component={LogIn}
        />
      </TicketsStack.Group>

      <TicketsStack.Screen
        name={routeMap.Tickets}
        component={Issues}
      />

      {getCommonIssueStack(TicketsStack)}

      <TicketsStack.Group
        screenOptions={{presentation: 'modal'}}
      >
        <TicketsStack.Screen
          name={routeMap.CreateIssue}
          component={CreateIssue}
        />
        <TicketsStack.Screen
          name={routeMap.AttachmentPreview}
          component={AttachmentPreview}
        />
        <TicketsStack.Screen
          name={routeMap.PreviewFile}
          component={PreviewFile}
        />
        <TicketsStack.Screen
          name={routeMap.Page}
          component={Page}
        />

        {getCommonIssueStack(TicketsStack, 'Modal')}
      </TicketsStack.Group>
    </TicketsStack.Navigator>
  );
}

/* @flow */

import React, {useContext, useState} from 'react';
import {Dimensions, Text, View} from 'react-native';

import {TabBar, TabView} from 'react-native-tab-view';
import {View as AnimatedView} from 'react-native-animatable';
import {useSelector} from 'react-redux';

import Header from 'components/header/header';
import InboxThreadsList from './inbox-threads__list';
import {folderIdMap, threadTabsTitles} from './inbox-threads-helper';
import {i18n} from 'components/i18n/i18n';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables/variables';
import {SkeletonIssueActivities} from 'components/skeleton/skeleton';

import styles from './inbox-threads.styles';
import tabStyles from 'components/issue-tabbed/issue-tabbed.style';

import type {AppState} from '../../reducers';
import type {Node} from 'react';
import type {TabRoute} from 'flow/Issue';
import type {Theme, UIThemeColors} from 'flow/Theme';
import type {UserCurrent} from 'flow/User';


const InboxThreads: () => Node = (): Node => {
  const theme: Theme = useContext(ThemeContext);
  const currentUser: UserCurrent = useSelector((state: AppState) => state.app.user);
  const routes: TabRoute[] = threadTabsTitles.map((name: string, index: number) => ({key: index, title: name}));

  const [navigationState, updateNavigationState] = useState({
    index: 0,
    routes,
  });

  const renderScene = ({route}: { route: TabRoute }) => {
    return (
      route.key !== navigationState.index
        ? <SkeletonIssueActivities marginTop={UNIT * 2} marginLeft={UNIT} marginRight={UNIT}/>
        : (
          <AnimatedView
            animation="fadeIn"
            duration={500}
            useNativeDriver
          >
            <InboxThreadsList
              currentUser={currentUser}
              folderId={folderIdMap[route.key]}
              theme={theme}
            />
          </AnimatedView>
        )
    );
  };

  const renderTabBar = (props: any) => {
    const uiThemeColors: UIThemeColors = theme.uiTheme.colors;
    return (
      <TabBar
        {...props}
        pressColor={uiThemeColors.$disabled}
        indicatorStyle={{backgroundColor: uiThemeColors.$link}}
        style={[tabStyles.tabsBar, {shadowColor: uiThemeColors.$separator}]}
        tabStyle={tabStyles.tabsBarFluid}
        renderLabel={({route, focused}) => (
          <Text style={[
            tabStyles.tabLabelText,
            {color: focused ? uiThemeColors.$link : uiThemeColors.$text},
          ]}>
            {route.title}
          </Text>
        )}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header title={i18n('Notifications')}/>

      <TabView
        lazy={true}
        swipeEnabled={true}
        navigationState={navigationState}
        renderScene={renderScene}
        initialLayout={{
          height: 0,
          width: Dimensions.get('window').width,
        }}
        renderTabBar={renderTabBar}
        onIndexChange={(index: number) => updateNavigationState({index, routes})}
      />
    </View>
  );
};


export default InboxThreads;

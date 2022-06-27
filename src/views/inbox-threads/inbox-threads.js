/* @flow */

import React, {useContext, useEffect, useRef, useState} from 'react';
import {Dimensions, Text, View} from 'react-native';

import {TabBar, TabView} from 'react-native-tab-view';
import {useSelector} from 'react-redux';

import Article from 'views/article/article';
import Header from 'components/header/header';
import InboxThreadsList from './inbox-threads__list';
import Issue from '../issue/issue';
import {folderIdMap, threadTabsTitles} from './inbox-threads-helper';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {isSplitView as hasSplitView} from 'components/responsive/responsive-helper';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './inbox-threads.styles';
import tabStyles from 'components/issue-tabbed/issue-tabbed.style';

import type {AppState} from '../../reducers';
import type {Node} from 'react';
import type {TabRoute} from 'flow/Issue';
import type {Theme, UIThemeColors} from 'flow/Theme';
import type {ThreadEntity} from 'flow/Inbox';
import type {UserCurrent} from 'flow/User';
import NothingSelectedIconWithText from '../../components/icon/nothing-selected-icon-with-text';


const InboxThreads: () => Node = (): Node => {
  const theme: Theme = useContext(ThemeContext);
  const currentUser: UserCurrent = useSelector((state: AppState) => state.app.user);
  const routes: TabRoute[] = threadTabsTitles.map((name: string, index: number) => ({key: index, title: name}));

  const [selectedEntity, updateSelectedEntity] = useState({entity: null, navigateToActivity: false});

  const [isSplitView, updateIsSplitView] = useState(hasSplitView());
  const dimensionsChangeListener = useRef();

  useEffect(() => {
    dimensionsChangeListener.current = Dimensions.addEventListener('change', () => {
      updateIsSplitView(hasSplitView());
    });
    return () => dimensionsChangeListener.current?.remove();
  }, []);

  const [navigationState, updateNavigationState] = useState({
    index: 0,
    routes,
  });

  const renderScene = ({route}: { route: TabRoute }) => (
    <InboxThreadsList
      currentUser={currentUser}
      folderId={folderIdMap[route.key]}
      theme={theme}
      onPress={(isSplitView
        ? (entity: ThreadEntity, navigateToActivity?: boolean) => updateSelectedEntity({entity, navigateToActivity})
        : null)}
    />
  );

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
        scrollEnabled={true}
      />
    );
  };

  const renderEntity = () => {
    if (!selectedEntity?.entity) {
      return <NothingSelectedIconWithText text={i18n('Select an issue, article or change from the list')}/>;
    }

    return (
      hasType.article(selectedEntity.entity)
        ? <Article articlePlaceholder={selectedEntity.entity} navigateToActivity={selectedEntity.navigateToActivity}/>
        : (
          <Issue
            issuePlaceholder={selectedEntity.entity}
            issueId={selectedEntity.entity.id}
            navigateToActivity={selectedEntity.navigateToActivity}
          />
        )
    );
  };

  const renderTabs = () => (
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
  );

  const header = <Header title={i18n('Notifications')}/>;
  return (
    <View style={[
      styles.container,
      isSplitView ? styles.splitViewContainer : null,
    ]}>

      {!isSplitView && <>
        {header}
        {renderTabs()}
      </>}
      {isSplitView && <>
        <View style={styles.splitViewSide}>
          {header}
          {renderTabs()}
        </View>
        <View style={styles.splitViewMain}>
          {renderEntity()}
        </View>
      </>}
    </View>
  );
};


export default InboxThreads;

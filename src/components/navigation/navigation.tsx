import * as React from 'react';
import {Linking} from 'react-native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import EnterServer from 'views/enter-server/enter-server';
import Home from 'views/home/home';
import LogIn from 'views/log-in/log-in';
import NavigationBottomTabs from 'components/navigation/navigation-bottom-tabs';
import {AppState} from 'reducers';
import {navigationRef} from 'components/navigation/navigator';
import {Navigators} from 'components/navigation/index';
import {populateStorage, StorageState} from 'components/storage/storage';
import {routeMap} from 'app-routes';


const Stack = createNativeStackNavigator();
const defaultScreenOptions = {
  headerShown: false,
  lazy: true,
  unmountOnBlur: true,
};


export default function Navigation() {
  const config = {
    screens: {
      [routeMap.Article]: 'articles/:id',
      [routeMap.Issue]: 'issue/:id',
      [routeMap.Issues]: 'issues',
      [routeMap.Issue]: 'issue/:id',
      [routeMap.Tickets]: 'tickets',
      [routeMap.Ticket]: 'tickets/:id',
      NotFound: '*',
    },
  };

  const linking = {
    prefixes: [
      'https://youtrack.jetbrains.com',
      'https://*.youtrack.cloud',
      'https://*.myjetbrains.com',
    ],
    config,
    async getInitialURL() {
      const initialUrl: string | null = await Linking.getInitialURL();
      if (initialUrl != null) {
        return initialUrl;
      }
    },
  };

  const isPermissionsLoaded: boolean = useSelector((state: AppState) => !!state.app.issuePermissions);

  const [hasAccount, setHasAccount] = React.useState<boolean | null>(null);

  const init = async () => {
    const storageState: StorageState = await populateStorage();
    setHasAccount(!!storageState?.config);
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef}
    >
      <Stack.Navigator
        initialRouteName={routeMap.Home}
      >
        <Stack.Screen
          options={{
            ...defaultScreenOptions,
            animation: 'none',
          }}
          navigationKey={Navigators.BottomTabs}
          name={Navigators.BottomTabs}
          component={NavigationBottomTabs}
        />

        <Stack.Screen
          name={routeMap.Home}
          component={Home}
          options={defaultScreenOptions}
        />

        <Stack.Group navigationKey={hasAccount && isPermissionsLoaded ? 'user' : 'guest'}>
          <Stack.Screen
            name={routeMap.EnterServer}
            component={EnterServer}
            options={{
              ...defaultScreenOptions,
              animation: 'none',
            }}
          />
          <Stack.Screen
            name={routeMap.LogIn}
            component={LogIn}
            options={defaultScreenOptions}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

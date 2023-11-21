import {Appearance, NativeEventSubscription} from 'react-native';
import React, {PureComponent} from 'react';
import DeviceInfo from 'react-native-device-info';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {flushStoragePart, getStorageState} from '../storage/storage';
import {isAndroidPlatform} from 'util/util';
import {ThemeContext} from './theme-context';
import {buildStyles, getSystemThemeMode, getUITheme, themes} from './theme';
import type {UITheme} from 'types/Theme';

type State = {
  mode: string | null | undefined;
  uiTheme: UITheme;
};
type Props = {
  children: any;
  mode: string | null | undefined;
};
const isAndroid: boolean = isAndroidPlatform();

class ManageThemeProvider extends PureComponent<Props, State> {
  _isMounted = false;
  subscription: NativeEventSubscription | undefined;
  canChangeAndroidNavBar = false;

  constructor(props: Props) {
    super(props);
    this.canChangeAndroidNavBar = this.canStyleAndroidNavBar();

    const _mode = props.mode || getSystemThemeMode();

    const uiTheme: UITheme = getUITheme(_mode);
    this.setAndroidNavBarStyle(uiTheme);
    this.state = {
      mode: _mode,
      uiTheme: uiTheme,
    };
  }

  canStyleAndroidNavBar = (): boolean => {
    if (!isAndroid) {
      return false;
    }

    let androidVersion: number | null;
    const systemVersion: string = DeviceInfo.getSystemVersion();

    try {
      androidVersion = Number(systemVersion);
    } catch (error) {
      androidVersion = systemVersion ? parseFloat(systemVersion) : null;
    }

    return typeof androidVersion === 'number' && androidVersion >= 8;
  };
  componentDidMount = () => {
    this._isMounted = true;
    this.subscription = Appearance.addChangeListener(
      (preferences: Appearance.AppearancePreferences) => {
        this.setMode(preferences.colorScheme || null);
      },
    );
  };

  componentWillUnmount() {
    this.subscription?.remove?.();
    this._isMounted = false;
  }

  buildStyles(mode: string | null): UITheme {
    const _mode = mode || getSystemThemeMode();

    const uiTheme = getUITheme(_mode);
    buildStyles(_mode, uiTheme);
    return uiTheme;
  }

  isCustomMode(mode: string | null | undefined): boolean {
    return themes.some((theme: UITheme) => theme.mode === mode);
  }

  setAndroidNavBarStyle(uiTheme: UITheme) {
    if (this.canChangeAndroidNavBar) {
      try {
        changeNavigationBarColor(
          uiTheme.colors.$background,
          !uiTheme.dark,
          false,
        );
      } catch (e) {
        //
      }
    }
  }

  setMode = async (mode: string | null, reset: boolean = false) => {
    if (this._isMounted) {
      const cm = this.isCustomMode(mode);
      const storedMode: string | null = getStorageState().themeMode;
      let newMode = null;

      if (cm) {
        newMode = mode;
      } else if (reset) {
        newMode = null;
      } else if (storedMode) {
        newMode = storedMode;
      }

      await flushStoragePart({themeMode: newMode});
      const uiTheme: UITheme = this.buildStyles(newMode);
      this.setState({
        mode,
        uiTheme: uiTheme,
      });
      this.setAndroidNavBarStyle(uiTheme);
    }
  };

  render() {
    return (
      <ThemeContext.Provider
        value={{
          mode: this.state.mode,
          uiTheme: this.state.uiTheme,
          setMode: this.setMode,
        }}
      >
        {this.props.children}
      </ThemeContext.Provider>
    );
  }
}

const ThemeProvider = (props: {children: React.ReactNode; mode: string}): JSX.Element => (
  <ManageThemeProvider mode={props.mode}>{props.children}</ManageThemeProvider>
);

export default ThemeProvider;

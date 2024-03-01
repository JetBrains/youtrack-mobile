import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Header from 'components/header/header';
import {getStorageState} from 'components/storage/storage';
import {getSystemThemeMode, themes} from 'components/theme/theme';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconBack, IconCheck} from 'components/icon/icon';
import {ThemeContext} from 'components/theme/theme-context';
import styles from './settings.styles';
import type {Theme} from 'types/Theme';
type Props = {
  onHide: () => any;
  backIcon?: any;
};

const SettingsAppearance = (props: Props) => {
  const renderThemeCheckbox = (
    currentTheme: Theme,
    uiTheme: Record<string, any>,
  ): any => {
    const userThemeMode: string | null | undefined =
      getStorageState().themeMode || '';
    const mode: string = uiTheme.mode;
    const isChecked =
      (!userThemeMode && uiTheme.system) ||
      (!uiTheme.system &&
        !!userThemeMode &&
        userThemeMode.indexOf(mode) !== -1);
    const uiThemeName: string = uiTheme.name.toLowerCase();
    const isLightTheme: boolean = uiThemeName.indexOf('light') !== -1;
    return (
      <TouchableOpacity
        key={mode}
        hitSlop={HIT_SLOP}
        onPress={() => currentTheme.setMode(uiTheme.mode, !!uiTheme.system)}
      >
        <View style={styles.settingsListItemOption}>
          <Text style={styles.settingsListItemOptionText}>
            {isLightTheme && i18n('Light theme')}
            {!isLightTheme && !uiTheme.system && i18n('Dark theme')}
            {uiTheme.system && i18n('Sync with OS')}
          </Text>
          {isChecked && (
            <IconCheck size={20} color={currentTheme.uiTheme.colors.$link} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const systemTheme: Record<string, any> = {
    name: 'System',
    mode: getSystemThemeMode(),
    system: true,
  };
  return (
    <ThemeContext.Consumer>
      {(theme: Theme) => (
        <View style={styles.settings}>
          <Header
            style={styles.elevation1}
            title={i18n('Appearance')}
            leftButton={
              props.backIcon || <IconBack color={theme.uiTheme.colors.$link} />
            }
            onBack={props.onHide}
          />

          <View style={styles.settingsAppearance}>
            {[systemTheme]
              .concat(themes)
              .map((it: Record<string, any>) => renderThemeCheckbox(theme, it))}
          </View>
        </View>
      )}
    </ThemeContext.Consumer>
  );
};

export default SettingsAppearance;

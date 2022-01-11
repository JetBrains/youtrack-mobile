/* @flow */

import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import Header from '../../components/header/header';
import {getStorageState} from '../../components/storage/storage';
import {getSystemThemeMode, themes} from '../../components/theme/theme';
import {HIT_SLOP} from '../../components/common-styles/button';
import {IconBack, IconCheck} from '../../components/icon/icon';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './settings.styles';

import type {Node} from 'React';
import type {Theme} from '../../flow/Theme';

type Props = {
  onHide: () => any,
  backIcon?: any,
}


const SettingsAppearance = (props: Props): Node => {

  const renderThemeCheckbox = (currentTheme: Theme, uiTheme: Object): any => {
    const userThemeMode: ?string = getStorageState().themeMode || '';
    const mode: string = uiTheme.mode;
    const isChecked = (!userThemeMode && uiTheme.system) || (
      !uiTheme.system && !!userThemeMode && userThemeMode.indexOf(mode) !== -1
    );

    return (
      <TouchableOpacity
        key={mode}
        hitSlop={HIT_SLOP}
        onPress={() => currentTheme.setMode(uiTheme.mode, !!uiTheme.system)}
      >
        <View style={styles.settingsListItemOption}>
          <Text style={styles.settingsListItemOptionText}>
            {`${uiTheme.name} theme`}
            {uiTheme.system && <Text style={styles.settingsListItemOptionTextSecondary}>{` (${uiTheme.mode})`}</Text>}
          </Text>
          {isChecked && <IconCheck size={20} color={currentTheme.uiTheme.colors.$link}/>}
        </View>
      </TouchableOpacity>
    );
  };

  const systemTheme: Object = {name: 'System', mode: getSystemThemeMode(), system: true};
  return (
    <ThemeContext.Consumer>
      {(theme: Theme) => (
        <View style={styles.settings}>
          <Header
            style={styles.elevation1}
            title="Appearance"
            leftButton={props.backIcon || <IconBack color={theme.uiTheme.colors.$link}/>}
            onBack={props.onHide}
          />

          <View style={styles.settingsAppearance}>
            {[systemTheme].concat(themes).map((it: Object) => renderThemeCheckbox(theme, it))}
          </View>
        </View>
      )}
    </ThemeContext.Consumer>
  );
};

export default SettingsAppearance;

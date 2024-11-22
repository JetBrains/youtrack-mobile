import React from 'react';
import {View, Text, TouchableOpacity, Linking} from 'react-native';

import Switch from 'react-native-switch-pro';
import {useDispatch, useSelector} from 'react-redux';

import * as appActions from 'actions/app-actions';
import Accounts from 'components/account/accounts';
import clicksToShowCounter from 'components/debug-view/clicks-to-show-counter';
import FeaturesDebugSettings from 'components/feature/features-debug-settings';
import Header from 'components/header/header';
import Router from 'components/router/router';
import SettingsAppearance from './settings__appearance';
import SettingsFeedbackForm from './settings__feedback-form';
import usage, {VERSION_STRING} from 'components/usage/usage';
import {ANALYTICS_SETTINGS_PAGE} from 'components/analytics/analytics-ids';
import {checkVersion, FEATURE_VERSION} from 'components/feature/feature';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {useUITheme} from 'components/theme/use-theme';

import styles from './settings.styles';

import type {AppState} from 'reducers';
import type {StorageState} from 'components/storage/storage';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {UserHelpdeskProfile} from 'types/User';


export default function Settings() {
  const dispatch: ReduxThunkDispatch = useDispatch();
  const uiTheme = useUITheme();

  const isHelpdeskFeatureEnabled: boolean = checkVersion(FEATURE_VERSION.helpDesk);
  const helpdeskMenuHidden = useSelector((state: AppState) => state.app.helpdeskMenuHidden);
  const isHelpdeskAccessible = useSelector((state: AppState) => {
    const helpdeskProfile: UserHelpdeskProfile | undefined = state.app.user?.profiles?.helpdesk;
    if (!isHelpdeskFeatureEnabled || helpdeskProfile?.isReporter) {
      return false;
    }
    return !!helpdeskProfile?.helpdeskFolder?.id && state.app.globalSettings.helpdeskEnabled;
  });

  const isChangingAccount = useSelector((state: AppState) => state.app.isChangingAccount);
  const otherAccounts = useSelector((state: AppState) => state.app.otherAccounts || []);

  React.useEffect(() => {
    usage.trackScreenView(ANALYTICS_SETTINGS_PAGE);
  }, []);

  return (
    <View testID="settings" style={styles.settings}>
      <Header title={i18n('Settings')} />

      <View style={styles.settingsContent}>
        <Accounts
          onAddAccount={() => dispatch(appActions.addAccount())}
          onChangeAccount={(account: StorageState) => {
            dispatch(appActions.switchAccount(account));
          }}
          onClose={() => {}}
          onLogOut={() => {
            dispatch(appActions.signOutFromAccount());
          }}
          openDebugView={() => clicksToShowCounter(() => Router.PageModal({children: <FeaturesDebugSettings />}))}
          otherAccounts={otherAccounts}
          isChangingAccount={isChangingAccount}
          uiTheme={uiTheme}
        />

        <View style={styles.settingsList}>
          <View style={styles.settingsListItem}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={() => {
                Router.Page({children: <SettingsAppearance onHide={() => Router.pop()} />});
              }}
            >
              <Text style={styles.settingsListItemTitleText}>{i18n('Appearance')}</Text>
            </TouchableOpacity>
          </View>

          {isHelpdeskAccessible && (
            <View style={styles.settingsListItem}>
              <Text style={styles.settingsListItemTitleText}>{i18n('Tickets')}</Text>
              <Switch
                width={40}
                height={25}
                backgroundActive={uiTheme.colors.$link}
                value={!helpdeskMenuHidden}
                disabled={false}
                onSyncPress={(value: boolean) => {
                  dispatch(appActions.setHelpdeskMenuVisibility(!value));
                }}
              />
            </View>
          )}

          <View style={styles.separator}/>

          <View style={styles.settingsListItem}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={() => dispatch(appActions.openDebugView())}
            >
              <Text style={styles.settingsListItemTitleText}>{i18n('Share logs')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingsListItem}>
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={() => Router.Page({children: <SettingsFeedbackForm />})}
            >
              <Text style={styles.settingsListItemTitleText}>{i18n('Send feedback')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View testID="settingsFooter" style={styles.settingsFooter}>
          <Text style={styles.settingsFooterTitle}>YouTrack Mobile</Text>

          <TouchableOpacity onPress={() => Linking.openURL('https://jetbrains.com/youtrack')}>
            <Text style={styles.settingsFooterLink}>jetbrains.com/youtrack</Text>
          </TouchableOpacity>

          <Text style={styles.settingsFooterBuild}>{VERSION_STRING}</Text>
        </View>
      </View>
    </View>
  );
}

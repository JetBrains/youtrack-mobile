import React from 'react';
import {View} from 'react-native';

import {useSelector} from 'react-redux';
import {useDispatch} from 'hooks/use-dispatch';

import Header from 'components/header/header';
import IssueActivitiesSettings from 'views/issue/activity/issue__activity-settings';
import Router from 'components/router/router';
import {DEFAULT_USER_APPEARANCE_PROFILE} from 'views/issue/activity/issue__activity';
import {i18n} from 'components/i18n/i18n';
import {IconBack} from 'components/icon/icon';
import {receiveUserAppearanceProfile} from 'actions/app-actions';

import styles from './settings.styles';

import type {AppState} from 'reducers';
import type {UITheme} from 'types/Theme';
import type {UserAppearanceProfile} from 'types/User';

const SettingsActivity = ({uiTheme}: {uiTheme: UITheme}) => {
  const dispatch = useDispatch();

  const userAppearanceProfile = useSelector(
    (state: AppState) => state.app.user?.profiles.appearance || DEFAULT_USER_APPEARANCE_PROFILE
  );

  const issueActivityTypes = useSelector((state: AppState) => state.issueActivity.issueActivityTypes);
  const issueActivityEnabledTypes = useSelector((state: AppState) => state.issueActivity.issueActivityEnabledTypes);

  return (
    <View style={styles.settings}>
      <Header
        style={styles.elevation1}
        title={i18n('Appearance')}
        leftButton={<IconBack color={uiTheme.colors.$link} />}
        onBack={() => Router.pop()}
      />

      <View style={styles.settingsAppearance}>
        <IssueActivitiesSettings
          disabled={false}
          issueActivityTypes={issueActivityTypes}
          issueActivityEnabledTypes={issueActivityEnabledTypes}
          onApply={(profile: UserAppearanceProfile) => {
            if (profile) {
              dispatch(receiveUserAppearanceProfile(profile));
            }
          }}
          userAppearanceProfile={userAppearanceProfile}
          uiTheme={uiTheme}
        />
      </View>
    </View>
  );
};

export default React.memo(SettingsActivity);

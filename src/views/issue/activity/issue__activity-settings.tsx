import React, {PureComponent} from 'react';
import {View, Text} from 'react-native';

// @ts-ignore
import Switch from 'react-native-switch-pro';

import {getIssueActivityIcon, getIssueActivityLabel} from 'components/activity/activity-helper';
import {i18n} from 'components/i18n/i18n';
import {toggleIssueActivityEnabledType} from './issue-activity__helper';

import styles from './issue-activity.styles';

import type {ActivityType} from 'types/Activity';
import type {UITheme} from 'types/Theme';
import type {UserAppearanceProfile} from 'types/User';

interface Props {
  issueActivityTypes: ActivityType[];
  issueActivityEnabledTypes: ActivityType[];
  onApply: (...args: any[]) => any;
  userAppearanceProfile: UserAppearanceProfile;
  disabled?: boolean;
  uiTheme: UITheme;
}

interface SortOrder {
  name: string;
  isNaturalCommentsOrder: boolean;
}

interface SettingsActivityType extends ActivityType, SortOrder {
  enabled: boolean;
}

interface State {
  settings: SettingsActivityType[];
}

export default class IssueActivitiesSettings extends PureComponent<Props, State> {
  switchCommonProps: Record<string, any>;
  sortOrderOption: SortOrder;

  constructor(props: Props) {
    super(props);
    this.switchCommonProps = {
      width: 40,
      backgroundActive: props.uiTheme.colors.$link,
    };
    this.sortOrderOption = {
      name: i18n('Sort: oldest first'),
      isNaturalCommentsOrder: !!props?.userAppearanceProfile?.naturalCommentsOrder,
    };
    this.state = {settings: []};
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props?.userAppearanceProfile?.naturalCommentsOrder !==
        prevProps?.userAppearanceProfile?.naturalCommentsOrder ||
      this.props.issueActivityTypes?.length !== prevProps.issueActivityTypes?.length ||
      this.props.issueActivityEnabledTypes?.length !== prevProps.issueActivityEnabledTypes?.length
    ) {
      this.updateSettingsList();
    }
  }

  updateSettingsList() {
    const {issueActivityTypes, issueActivityEnabledTypes, userAppearanceProfile} = this.props;
    this.setState({
      settings: this.createSettingsList(
        issueActivityTypes,
        issueActivityEnabledTypes,
        !!userAppearanceProfile.naturalCommentsOrder
      ),
    });
  }

  createSettingsList(
    issueActivityTypes: ActivityType[] = [],
    issueActivityEnabledTypes: ActivityType[] = [],
    naturalCommentsOrder: boolean
  ) {
    const list = issueActivityTypes.reduce((akk: SettingsActivityType[], type) => {
      return akk.concat({
        ...type,
        enabled: issueActivityEnabledTypes.some(enabledType => enabledType.id === type.id),
      } as SettingsActivityType);
    }, [] as SettingsActivityType[]);

    this.sortOrderOption.isNaturalCommentsOrder = naturalCommentsOrder;
    return list.concat(this.sortOrderOption as SettingsActivityType);
  }

  onApplySettings(userAppearanceProfile: UserAppearanceProfile | null) {
    this.props.onApply(userAppearanceProfile);
  }

  renderOrderItem(): React.ReactNode {
    const {userAppearanceProfile, onApply, disabled} = this.props;
    return (
      <View style={styles.settingsItem}>
        <Text style={styles.settingsName}>{this.sortOrderOption.name}</Text>
        <Switch
          style={disabled ? styles.settingsSwitchDisabled : null}
          {...this.switchCommonProps}
          disabled={disabled}
          value={this.props.userAppearanceProfile.naturalCommentsOrder}
          onSyncPress={(isNaturalOrder: boolean) => {
            onApply({
              ...userAppearanceProfile,
              ...{
                naturalCommentsOrder: isNaturalOrder,
              },
            });
          }}
        />
      </View>
    );
  }

  renderTypesList(): React.ReactNode {
    const {issueActivityTypes, issueActivityEnabledTypes, disabled} = this.props;
    return (
      <View>
        {issueActivityTypes.map((type: ActivityType) => {
          const isEnabled = issueActivityEnabledTypes.some(enabled => enabled.id === type.id);
          const Icon: any = getIssueActivityIcon(type.id);
          return (
            <View key={type.id} style={styles.settingsItem}>
              <View style={styles.settingsItemLabel}>
                {!!Icon && <Icon size={22} color={this.props.uiTheme.colors.$iconAccent} />}
                <Text style={styles.settingsName}>{`  ${getIssueActivityLabel(type.id)}`}</Text>
              </View>
              <Switch
                style={disabled ? styles.settingsSwitchDisabled : null}
                {...this.switchCommonProps}
                value={isEnabled}
                disabled={disabled}
                onSyncPress={async (enable: boolean) => {
                  await toggleIssueActivityEnabledType(type, enable);
                  this.onApplySettings(null);
                }}
              />
            </View>
          );
        })}
      </View>
    );
  }

  render(): React.ReactNode {
    return (
      <>
        {this.renderOrderItem()}
        {this.renderTypesList()}
      </>
    );
  }
}

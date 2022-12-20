import React, {PureComponent} from 'react';
import {View, Text} from 'react-native';
import Switch from 'react-native-switch-pro';
import {
  getIssueActivityIcon,
  getIssueActivityLabel,
} from 'components/activity/activity-helper';
import {i18n} from 'components/i18n/i18n';
import {toggleIssueActivityEnabledType} from './issue-activity__helper';
import styles from './issue-activity.styles';
import type {ActivityType} from 'flow/Activity';
import type {Node} from 'react';
import type {UITheme} from 'flow/Theme';
import type {UserAppearanceProfile} from 'flow/User';
type Props = {
  issueActivityTypes: Array<ActivityType>;
  issueActivityEnabledTypes: Array<ActivityType>;
  onApply: (...args: Array<any>) => any;
  userAppearanceProfile: UserAppearanceProfile;
  disabled?: boolean;
  uiTheme: UITheme;
};
type State = {
  settings: Array<ActivityType>;
};
type SortOrder = {
  name: string;
  isNaturalCommentsOrder: boolean;
};
export default class IssueActivitiesSettings extends PureComponent<
  Props,
  State
> {
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
      isNaturalCommentsOrder:
        props?.userAppearanceProfile?.naturalCommentsOrder,
    };
    this.state = {
      settings: [],
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props?.userAppearanceProfile?.naturalCommentsOrder !==
        prevProps?.userAppearanceProfile?.naturalCommentsOrder ||
      this.props.issueActivityTypes?.length !==
        prevProps.issueActivityTypes?.length ||
      this.props.issueActivityEnabledTypes?.length !==
        prevProps.issueActivityEnabledTypes?.length
    ) {
      this.updateSettingsList();
    }
  }

  updateSettingsList() {
    const {
      issueActivityTypes,
      issueActivityEnabledTypes,
      userAppearanceProfile,
    } = this.props;
    this.setState({
      settings: this.createSettingsList(
        issueActivityTypes,
        issueActivityEnabledTypes,
        userAppearanceProfile.naturalCommentsOrder,
      ),
    });
  }

  createSettingsList(
    issueActivityTypes: Array<ActivityType> = [],
    issueActivityEnabledTypes: Array<ActivityType> = [],
    naturalCommentsOrder: boolean,
  ): Array<Partial<ActivityType | SortOrder>> {
    const list: Array<ActivityType> = issueActivityTypes.reduce(
      (list: Array<ActivityType>, type: ActivityType) => {
        type.enabled = issueActivityEnabledTypes.some(
          (enabledType: ActivityType) => enabledType.id === type.id,
        );
        return list.concat(type);
      },
      [],
    );
    this.sortOrderOption.isNaturalCommentsOrder = naturalCommentsOrder;
    return list.concat(this.sortOrderOption);
  }

  onApplySettings(userAppearanceProfile: UserAppearanceProfile) {
    this.props.onApply(userAppearanceProfile);
  }

  renderOrderItem(): Node {
    const {userAppearanceProfile, onApply, disabled} = this.props;
    return (
      <View style={styles.settingsItem}>
        <Text style={styles.settingsName}>{this.sortOrderOption.name}</Text>
        <Switch
          style={disabled ? styles.settingsSwitchDisabled : null}
          {...this.switchCommonProps}
          disabled={disabled}
          value={this.props.userAppearanceProfile.naturalCommentsOrder}
          onSyncPress={isNaturalOrder => {
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

  renderTypesList(): Node {
    const {
      issueActivityTypes,
      issueActivityEnabledTypes,
      disabled,
    } = this.props;
    return (
      <View>
        {issueActivityTypes.map((type: ActivityType) => {
          const isEnabled = issueActivityEnabledTypes.some(
            enabled => enabled.id === type.id,
          );
          const Icon: any = getIssueActivityIcon(type.id);
          return (
            <View key={type.id} style={styles.settingsItem}>
              <View style={styles.settingsItemLabel}>
                {!!Icon && (
                  <Icon
                    size={22}
                    color={this.props.uiTheme.colors.$iconAccent}
                  />
                )}
                <Text style={styles.settingsName}>
                  {`  ${getIssueActivityLabel(type.id)}`}
                </Text>
              </View>
              <Switch
                style={disabled ? styles.settingsSwitchDisabled : null}
                {...this.switchCommonProps}
                value={isEnabled}
                disabled={disabled}
                onSyncPress={async (enable: ActivityType) => {
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

  render(): Node {
    return (
      <>
        {this.renderOrderItem()}
        {this.renderTypesList()}
      </>
    );
  }
}
/* @flow */

import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import {getIssueActivityIcon, toggleIssueActivityEnabledType} from './single-issue-activity__helper';
import {IconAngleDown, IconClose} from '../../../components/icon/icon';
import Switch from 'react-native-switch-pro';
import ModalView from '../../../components/modal-view/modal-view';
import Header from '../../../components/header/header';

import {
  COLOR_ICON_LIGHT_BLUE,
  COLOR_ICON_MEDIUM_GREY,
  COLOR_PINK,
  COLOR_PINK_TRANSPARENT
} from '../../../components/variables/variables';
import {HIT_SLOP} from '../../../components/common-styles/button';

import styles from './single-issue-activity.styles';

import type {ActivityType} from '../../../flow/Activity';
import type {UserAppearanceProfile} from '../../../flow/User';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  issueActivityTypes: Array<ActivityType>,
  issueActivityEnabledTypes: Array<ActivityType>,
  onApply: Function,
  userAppearanceProfile: UserAppearanceProfile,
  disabled?: boolean,
  style?: ViewStyleProp
};

type State = {
  visible: boolean,
  settings: Array<ActivityType>
};

type SortOrder = { name: string, isNaturalCommentsOrder: boolean };


export default class IssueActivitiesSettings extends Component<Props, State> {
  static switchCommonProps: Object = {
    width: 40,
    circleColorActive: COLOR_PINK,
    circleColorInactive: '#f1f1f1',
    backgroundActive: COLOR_PINK_TRANSPARENT,
    backgroundInactive: 'rgba(34, 31, 31, 0.26)'
  };
  sortOrderOption: SortOrder;

  constructor(props: Props) {
    super(props);

    this.sortOrderOption = {
      name: 'Sort: oldest first',
      isNaturalCommentsOrder: props?.userAppearanceProfile?.naturalCommentsOrder
    };

    this.state = {
      visible: false,
      settings: []
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.props?.userAppearanceProfile?.naturalCommentsOrder !== prevProps?.userAppearanceProfile?.naturalCommentsOrder ||
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
        userAppearanceProfile.naturalCommentsOrder
      )
    });
  }

  createSettingsList(
    issueActivityTypes: Array<ActivityType> = [],
    issueActivityEnabledTypes: Array<ActivityType> = [],
    naturalCommentsOrder: boolean
  ): Array<$Shape<ActivityType | SortOrder>> {
    const list: Array<ActivityType> = issueActivityTypes.reduce(
      (list: Array<ActivityType>, type: ActivityType) => {
        type.enabled = issueActivityEnabledTypes.some((enabledType: ActivityType) => enabledType.id === type.id);
        return list.concat(type);
      },
      []);
    this.sortOrderOption.isNaturalCommentsOrder = naturalCommentsOrder;
    return list.concat(this.sortOrderOption);
  }

  toggleSettingsDialogVisibility = () => {
    const {visible} = this.state;
    this.setState({visible: !visible});
  };

  onApplySettings(userAppearanceProfile: UserAppearanceProfile) {
    this.props.onApply(userAppearanceProfile);
  }

  renderSettingsDialog() {
    return (
      <ModalView
        transparent={true}
        animationType="slide"
        testID="activitySettingsDialog"
        style={styles.settingsContainer}
      >
        <View style={styles.settingsContent}>
          <Header
            leftButton={<IconClose size={21} color={COLOR_PINK}/>}
            onBack={this.toggleSettingsDialogVisibility}
          >
            <Text style={styles.settingsTitle}>Activity setting</Text>
          </Header>

          {this.renderOrderItem()}
          {this.renderTypesList()}
        </View>
      </ModalView>
    );
  }

  renderOrderItem() {
    const {userAppearanceProfile, onApply, disabled} = this.props;
    return (
      <View
        style={styles.settingsItem}
      >
        <Text style={styles.settingsName}>{this.sortOrderOption.name}</Text>
        <Switch
          {...IssueActivitiesSettings.switchCommonProps}
          disabled={disabled}
          value={this.props.userAppearanceProfile.naturalCommentsOrder}
          onSyncPress={isNaturalOrder => {
            onApply({
              ...userAppearanceProfile,
              ...{naturalCommentsOrder: isNaturalOrder}
            });
          }}
        />

      </View>
    );
  }

  renderTypesList() {
    const {issueActivityTypes, issueActivityEnabledTypes, disabled} = this.props;

    return (
      <View>
        {issueActivityTypes.map((type: ActivityType) => {
          const isEnabled = issueActivityEnabledTypes.some(enabled => enabled.id === type.id);
          const Icon: any = getIssueActivityIcon(type.id);
          return (
            <View
              key={type.id}
              style={styles.settingsItem}
            >
              <View style={styles.settingsNameContainer}>
                {!!Icon && <Icon size={22} color={COLOR_ICON_LIGHT_BLUE}/>}
                <Text style={styles.settingsName}>
                  {`  ${type.name}`}
                </Text>
              </View>
              <Switch
                {...IssueActivitiesSettings.switchCommonProps}
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

  getTitle(): string {
    return this.props.issueActivityEnabledTypes.map((category) => category.name).join(', ');
  }

  render() {
    return (
      <View style={this.props.style}>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          disabled={this.props.disabled}
          style={styles.settingsButton}
          onPress={this.toggleSettingsDialogVisibility}
        >
          <Text style={styles.settingsButtonText}>{this.getTitle()}</Text>
          <IconAngleDown size={19} color={COLOR_ICON_MEDIUM_GREY}/>
        </TouchableOpacity>

        {this.state.visible && this.renderSettingsDialog()}
      </View>
    );
  }
}

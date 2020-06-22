/* @flow */

import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import type {UserAppearanceProfile} from '../../../flow/User';
import type {ActivityEnabledType} from '../../../flow/Activity';

import {getEntityPresentation} from '../../../components/issue-formatter/issue-formatter';
import {saveIssueActivityEnabledTypes} from './single-issue-activity__helper';

import apiHelper from '../../../components/api/api__helper';
import Select from '../../../components/select/select';

import {COLOR_ICON_MEDIUM_GREY} from '../../../components/variables/variables';
import {IconAngleDown} from '../../../components/icon/icon';

import styles from './single-issue-activity.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  issueActivityTypes: Array<ActivityEnabledType>,
  issueActivityEnabledTypes: Array<ActivityEnabledType>,
  onApply: Function,
  userAppearanceProfile: UserAppearanceProfile,
  disabled?: boolean,
  style?: ViewStyleProp
};

type State = {
  visible: boolean,
  select: {
    show: boolean,
    dataSource: () => Promise<Array<Object>>,
    onChangeSelection?: (selectedItems: Array<Object>) => any,
    multi: boolean,
    selectedItems: Array<ActivityEnabledType>,
    getTitle?: (item: Object) => string
  },
  naturalCommentsOrder: boolean,
};

const defaultState = {
  visible: false,
  select: {
    show: true,
    multi: true,
    selectedItems: [],
    dataSource: () => Promise.resolve([]),
    onChangeSelection: items => {}
  },
  naturalCommentsOrder: true,
};

type SortOrderOption = { name: string, id: string, isNaturalCommentsOrder: boolean };

export default class SingleIssueActivitiesSettings extends Component<Props, State> {

  static sortOrderOptions: Array<SortOrderOption> = [
    {
      id: 'OldestFirst',
      name: 'Sort: oldest first',
      toggleItem: true,
      isNaturalCommentsOrder: true
    },
    {
      id: 'NewestFirst',
      name: 'Sort: newest first',
      toggleItem: true,
      isNaturalCommentsOrder: false
    }
  ];

  constructor(props: Props) {
    super(props);

    this.state = {
      ...defaultState,
      ...{naturalCommentsOrder: props?.userAppearanceProfile?.naturalCommentsOrder}
    };
  }

  componentDidUpdate(prevProps: $ReadOnly<Props>) {
    this.initSelectData();
  }

  initSelectData() {
    const selected: Array<Object> = this.props.issueActivityEnabledTypes;
    const sortOrderSelected: Array<Object> = SingleIssueActivitiesSettings.sortOrderOptions.filter(
      (it: SortOrderOption) => it.isNaturalCommentsOrder === this.props?.userAppearanceProfile?.naturalCommentsOrder
    );

    this.state.select.dataSource = () => Promise.resolve(
      this.props.issueActivityTypes.concat(SingleIssueActivitiesSettings.sortOrderOptions)
    );
    this.state.select.selectedItems = selected.concat(sortOrderSelected);
  }

  toggleSettingsVisibility = () => {
    const {visible} = this.state;
    this.setState({visible: !visible});
  };

  selectedTypesChanged(): boolean {
    return !apiHelper.equalsByProp(
      this.props.issueActivityEnabledTypes,
      this.state.select.selectedItems,
      'id'
    );
  }

  onApplySettings(selectedItems: Array<Object>) {
    const {naturalCommentsOrder} = this.state;
    const {userAppearanceProfile, onApply} = this.props;

    saveIssueActivityEnabledTypes(selectedItems);
    this.toggleSettingsVisibility();

    const isOrderChanged = userAppearanceProfile.naturalCommentsOrder !== naturalCommentsOrder;
    if (isOrderChanged || this.selectedTypesChanged()) {
      onApply({
        ...userAppearanceProfile,
        ...{naturalCommentsOrder: naturalCommentsOrder}
      });
    }
  }

  onSelect(selected: Array<Object>, item: Object) {
    const naturalCommentsOrder = (
      typeof item.isNaturalCommentsOrder === 'boolean'
        ? item.isNaturalCommentsOrder
        : this.state.naturalCommentsOrder
    );

    this.setState({
      naturalCommentsOrder: naturalCommentsOrder,
      select: {
        ...this.state.select,
        selectedItems: selected
      }
    });
  }

  renderSettingsSelect() {
    return (
      <Select
        {...this.state.select}
        emptyValue={null}
        multi={true}
        onSelect={(selectedItems) => {
          return this.onApplySettings((selectedItems || []).filter(it => !it.toggleItem));
        }}
        getTitle={getEntityPresentation}
        onCancel={() => this.toggleSettingsVisibility()}
        onChangeSelection={(selected: Array<Object>, current: Object) => this.onSelect(selected, current)}
      />
    );
  }

  getTitle(): string {
    return this.props.issueActivityEnabledTypes.map((category) => category.name).join(', ');
  }

  render() {
    return (
      <View style={this.props.style}>
        <TouchableOpacity
          disabled={this.props.disabled}
          style={styles.settingsButton}
          onPress={this.toggleSettingsVisibility}
        >
          <Text style={styles.secondaryText}>{this.getTitle()}{`  `}</Text>
          <IconAngleDown size={19} color={COLOR_ICON_MEDIUM_GREY}/>
        </TouchableOpacity>

        {this.state.visible && this.renderSettingsSelect()}
      </View>
    );
  }
}

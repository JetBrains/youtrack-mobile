/* @flow */
import styles from './single-issue.styles';

import {View, Text, TouchableOpacity, Image} from 'react-native';
import React, {Component} from 'react';

import type {UserAppearanceProfile} from '../../flow/User';
import type {ActivityEnabledType} from '../../flow/Activity';

import {getEntityPresentation} from '../../components/issue-formatter/issue-formatter';
import {saveIssueActivityEnabledTypes} from './single-issue-actions';

import apiHelper from '../../components/api/api__helper';

import Select from '../../components/select/select';
import ModalView from '../../components/modal-view/modal-view';

import {checkWhite} from '../../components/icon/icon';
import selectStyles from '../../components/select/select.styles';

type Props = {
  issueActivityTypes: Array<ActivityEnabledType>,
  issueActivityEnabledTypes: Array<ActivityEnabledType>,
  onApply: Function,
  userAppearanceProfile: UserAppearanceProfile
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


export default class SingleIssueActivitiesSettings extends Component<Props, State> {
  constructor(props: Object) {
    super();

    const naturalCommentsOrder = props?.userAppearanceProfile?.naturalCommentsOrder;
    this.state = {
      ...defaultState,
      ...{naturalCommentsOrder: naturalCommentsOrder}
    };

    this.state.select.dataSource = () => Promise.resolve(props.issueActivityTypes);
    this.state.select.selectedItems = props.issueActivityEnabledTypes;
  }

  _toggleSettingsVisibility = () => {
    const {visible} = this.state;
    this.setState({visible: !visible});
  };

  _selectedTypesChanged(): boolean {
    return !apiHelper.equalsByProp(
      this.props.issueActivityEnabledTypes,
      this.state.select.selectedItems,
      'id'
    );
  }

  _onApplySettings() {
    const {select, naturalCommentsOrder} = this.state;
    const {userAppearanceProfile, onApply} = this.props;

    saveIssueActivityEnabledTypes(select.selectedItems);
    this._toggleSettingsVisibility();

    const isOrderChanged = userAppearanceProfile.naturalCommentsOrder !== naturalCommentsOrder;
    if (isOrderChanged || this._selectedTypesChanged()) {
      onApply(isOrderChanged && {
        ...userAppearanceProfile,
        ...{naturalCommentsOrder: naturalCommentsOrder}
      });
    }
  }

  _renderSelect() {
    return (
      <Select
        style={styles.settingsSelect}
        {...this.state.select}
        noFilter={true}
        emptyValue={null}
        onSelect={() => {
        }}
        getTitle={getEntityPresentation}
        onCancel={this._toggleSettingsVisibility}
        onChangeSelection={(selectedItems) => this.setState({select: {...this.state.select, selectedItems}})}
      />
    );
  }

  _renderSortOrderSettings() {
    return (
      <View style={styles.settingsOrderSettings}>
        <TouchableOpacity
          style={selectStyles.row}
          onPress={() => this.setState({naturalCommentsOrder: true})}
        >
          <Text style={styles.settingsOrderSettingsText}>Sort: oldest first</Text>
          <View style={selectStyles.selectedMarkIconSize}>
            {this.state.naturalCommentsOrder && <Image source={checkWhite} style={selectStyles.selectedMarkIcon}/>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={selectStyles.row}
          onPress={() => this.setState({naturalCommentsOrder: false})}
        >
          <Text style={styles.settingsOrderSettingsText}>Sort: newest first</Text>
          <View style={selectStyles.selectedMarkIconSize}>
            {!this.state.naturalCommentsOrder && <Image source={checkWhite} style={selectStyles.selectedMarkIcon}/>}
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  _renderSettings() {
    const {visible, select} = this.state;

    return (
      <ModalView
        transparent={true}
        visible={visible}
        animationType={'slide'}
        style={styles.settingsModal}
      >
        <View style={styles.settingsPanel}>
          {this._renderSelect()}

          {select.show && this._renderSortOrderSettings()}

          {select.show &&
          <TouchableOpacity
            style={[
              styles.settingsApplyButton,
              select.selectedItems.length === 0 ? styles.settingsApplyButtonDisabled : {}
            ]}
            onPress={() => this._onApplySettings()}
            disabled={select.selectedItems.length === 0}
          >
            <Text style={styles.settingsApplyButtonText}>Apply</Text>
          </TouchableOpacity>}
        </View>
      </ModalView>
    );
  }

  render() {
    return (
      <View>
        <TouchableOpacity
          style={styles.settingsToggle}
          onPress={this._toggleSettingsVisibility}
        >
          <Text style={styles.settingsToggleText}>Activity feed settings</Text>
        </TouchableOpacity>

        {this.state.visible && this._renderSettings()}
      </View>
    );
  }
}

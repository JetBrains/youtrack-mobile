/* @flow */
import styles from './single-issue.styles';

import {View, Text, TouchableOpacity, Modal} from 'react-native';
import React, {Component} from 'react';

import {getEntityPresentation} from '../../components/issue-formatter/issue-formatter';
import {saveIssueActivityEnabledTypes} from './single-issue-actions';

import Select from '../../components/select/select';

type Props = {
  issueActivityTypes: Array<Object>,
  issueActivityEnabledTypes: Array<Object>,
  onApply: Function
};

type State = {
  visible: boolean,
  select: {
    show: boolean,
    dataSource: () => Promise<Array<Object>>,
    onChangeSelection?: (selectedItems: Array<Object>) => any,
    multi: boolean,
    selectedItems: Array<Object>,
    getTitle?: (item: Object) => string
  }
};

const defaultState = {
  visible: false,
  select: {
    show: true,
    multi: true,
    selectedItems: [],
    dataSource: () => Promise.resolve([]),
    onChangeSelection: items => {
    }
  }
};


export default class SingleIssueActivitiesSettings extends Component<Props, State> {
  constructor(props: Object) {
    super();
    this.state = {...defaultState};
    this.state.select.dataSource = () => Promise.resolve(props.issueActivityTypes);
    this.state.select.selectedItems = props.issueActivityEnabledTypes;
  }

  _toggleSettingsVisibility = () => {
    const {visible} = this.state;
    this.setState({visible: !visible});
  }

  _onApplySettings() {
    saveIssueActivityEnabledTypes(this.state.select.selectedItems);
    this.props.onApply(this.state.select.selectedItems);
    this._toggleSettingsVisibility();
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

  _renderSettings() {
    return (
      <Modal
        visible={this.state.visible}
        transparent={true}
        animationType={'slide'}
      >
        <View style={styles.settingsPanel}>
          {this._renderSelect()}
          {this.state.select.show &&
          <TouchableOpacity
            style={styles.settingsApplyButton}
            onPress={() => this._onApplySettings()}
          >
            <Text style={styles.settingsApplyButtonText}>Apply</Text>
          </TouchableOpacity>}
        </View>
      </Modal>
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

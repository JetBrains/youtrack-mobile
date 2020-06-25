/* @flow */

import React, {PureComponent} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {getApi} from '../api/api__instance';
import {sortAlphabetically} from '../search/sorting';
import {hasType} from '../api/api__resource-types';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import {IconAngleDown, IconClose, IconLock} from '../icon/icon';
import Select from '../select/select';
import IssueVisibility from './issue-visibility';

import {HIT_SLOP} from '../common-styles/button';
import {COLOR_ICON_LIGHT_BLUE, COLOR_ICON_MEDIUM_GREY, COLOR_PINK} from '../variables/variables';

import styles from './visibility.styles';

import type {User} from '../../flow/User';
import type {UserGroup} from '../../flow/UserGroup';
import type {Visibility} from '../../flow/Visibility';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  issueId: string,
  onApply: (visibility: Visibility) => any,
  style: ?ViewStyleProp
};

type State = {
  visibility: Visibility | null,
  isSelectVisible: boolean
}


export default class VisibilityControl extends PureComponent<Props, State> {
  static defaultProps: Props = {
    issueId: '',
    onApply: () => null,
    style: null
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      visibility: null,
      isSelectVisible: false
    };
  }

  updateVisibility = (visibility: Visibility | null) => {
    this.setState({visibility});
    this.props.onApply(visibility);
  };

  getVisibilityOptions = async () => {
    try {
      return getApi().issue.getVisibilityOptions(this.props.issueId);
    } catch (e) {
      return {};
    }
  };

  createSelectItems = (visibility: Visibility): Array<User | UserGroup> => {
    const visibilityGroups: Array<UserGroup> = (visibility.visibilityGroups || []).filter(
      (group: UserGroup) => !group.allUsersGroup
    ).sort(sortAlphabetically);
    const visibilityUsers: Array<User> = (visibility.visibilityUsers || []).sort(sortAlphabetically);

    return visibilityGroups.concat(visibilityUsers);
  };

  getVisibilitySelectItems = async () => {
    const visibility: Visibility = await this.getVisibilityOptions();
    return this.createSelectItems(visibility);
  };

  setSelectVisible = (isVisible: boolean) => {
    this.setState({isSelectVisible: isVisible});
  };

  openSelect = () => {
    this.setSelectVisible(true);
  };

  closeSelect = () => {
    this.setSelectVisible(false);
  };

  onSelect = (selectedItems: ?Array<User | UserGroup>) => {
    const visibility: Visibility = IssueVisibility.visibility({
      permittedGroups: (selectedItems || []).filter(it => hasType.userGroup(it)),
      permittedUsers: (selectedItems || []).filter(it => hasType.user(it))
    });

    this.updateVisibility(visibility);
    this.closeSelect();
  };

  resetVisibility = () => {
    this.updateVisibility(null);
  };

  getVisibilitySelectedItems = (): Array<User | UserGroup> => {
    const {visibility} = this.state;
    return (
      visibility
        ? [].concat(visibility.permittedGroups || []).concat(visibility.permittedUsers || [])
        : []
    );
  };

  getItemTitle = (item: Object) => getEntityPresentation(item);

  renderSelect() {
    return (
      <Select
        multi={true}
        emptyValue={null}
        selectedItems={this.getVisibilitySelectedItems()}
        getTitle={this.getItemTitle}
        dataSource={this.getVisibilitySelectItems}
        onSelect={this.onSelect}
        onCancel={this.closeSelect}
      />
    );
  }

  renderVisibilityButton() {
    const {visibility} = this.state;
    const isSecured: boolean = IssueVisibility.isSecured(visibility);

    return (
      <View
        style={[
          styles.container,
          this.props.style
        ]}
        hitSlop={HIT_SLOP}
      >
        {isSecured && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={this.resetVisibility}
            hitSlop={HIT_SLOP}
          >
            <IconClose size={16} color={COLOR_PINK}/>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.container}
          onPress={this.openSelect}
          hitSlop={HIT_SLOP}
        >
          {isSecured && (
            <IconLock
              style={styles.buttonIcon}
              size={16}
              color={COLOR_ICON_LIGHT_BLUE}
            />
          )}
          <Text style={styles.buttonText}>
            {isSecured ? IssueVisibility.getVisibilityShortPresentation(visibility) : 'Visible to All Users'}
          </Text>
          <IconAngleDown size={20} color={COLOR_ICON_MEDIUM_GREY}/>
        </TouchableOpacity>
      </View>
    );
  }


  render() {
    return (
      <View>

        {this.renderVisibilityButton()}
        {this.state.isSelectVisible && this.renderSelect()}

      </View>
    );
  }
}

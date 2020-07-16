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

import styles from './visibility-control.styles';

import type {User} from '../../flow/User';
import type {UserGroup} from '../../flow/UserGroup';
import type {Visibility} from '../../flow/Visibility';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  issueId: string,
  visibility?: Visibility,
  onApply: (visibility: Visibility) => any,
  onSubmit?: ?(visibility: Visibility) => any,
  style: ?ViewStyleProp
};

type State = {
  visibility: Visibility | null,
  isSelectVisible: boolean
}


export default class VisibilityControl extends PureComponent<Props, State> {
  static defaultProps: Props = {
    issueId: '',
    visibility: null,
    onApply: (visibility: Visibility) => null,
    style: null
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      visibility: props.visibility,
      isSelectVisible: false
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.visibility !== this.props.visibility) {
      this.setState({
        visibility: this.props.visibility
      });
    }
  }

  updateVisibility = (visibility: Visibility | null) => {
    this.setState({visibility});
    if (this.props.onSubmit) {
      this.props.onSubmit(visibility);
      return this.closeSelect();
    }
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
    const visibilityGroups: Array<UserGroup> = (
      visibility.visibilityGroups || visibility.permittedGroups || []
    ).filter((group: UserGroup) => !group.allUsersGroup).sort(sortAlphabetically);

    const visibilityUsers: Array<User> = (
      visibility.visibilityUsers || visibility.permittedUsers || []
    ).sort(sortAlphabetically);

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

  getVisibilityPresentation(visibility: Visibility): string {
    const author: ?User = visibility?.implicitPermittedUsers && visibility.implicitPermittedUsers[0];
    return [
      getEntityPresentation(author),
      IssueVisibility.getVisibilityShortPresentation(visibility)
    ].join(', ');
  }

  renderVisibilityButton() {
    const {onSubmit} = this.props;
    const {visibility} = this.state;
    const isSecured: boolean = IssueVisibility.isSecured(visibility);

    return (
      <View
        testID="visibilityControlButton"
        style={[
          styles.container,
          this.props.style
        ]}
        hitSlop={HIT_SLOP}
      >
        {!onSubmit && isSecured && (
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
            {isSecured ? this.getVisibilityPresentation(visibility) : 'Visible to All Users'}
          </Text>
          <IconAngleDown size={20} color={COLOR_ICON_MEDIUM_GREY}/>
        </TouchableOpacity>
      </View>
    );
  }


  render() {
    return (
      <View testID="visibilityControl">

        {this.renderVisibilityButton()}
        {this.state.isSelectVisible && this.renderSelect()}

      </View>
    );
  }
}

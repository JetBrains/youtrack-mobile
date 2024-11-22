import React, {PureComponent} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import IssueVisibility from './issue-visibility';
import SelectSectioned, {SelectSectionedModal} from 'components/select/select-sectioned';
import {DEFAULT_THEME} from 'components/theme/theme';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {getGroupedData, getVisibilityPresentation} from 'components/visibility/visibility-helper';
import {hasType} from 'components/api/api__resource-types';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconAngleDown, IconClose, IconLock} from 'components/icon/icon';
import {isSplitView} from 'components/responsive/responsive-helper';
import {visibilityDefaultText} from './visibility-strings';

import styles from './visibility-control.styles';

import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import type {ViewStyleProp} from 'types/Internal';
import type {Visibility, VisibilityGroups, VisibilityItem} from 'types/Visibility';
import {UserGroup} from 'types/UserGroup';

interface Props {
  getOptions: (q: string) => Promise<VisibilityGroups>;
  onApply: (visibility: Visibility | null) => any;
  onHide?: () => any;
  onShow?: () => any;
  onSubmit?: ((visibility: Visibility | null) => void) | null;
  style?: ViewStyleProp | null;
  uiTheme?: UITheme;
  visibility: Visibility | null;
  visibilityDefaultLabel?: string;
  disabled?: boolean;
  color?: string;
}

type State = {
  isSelectVisible: boolean;
  visibility: Visibility | null;
};

export default class VisibilityControl extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    visibility: null,
    onApply: () => null,
    getOptions: (q: string) => Promise.resolve({} as VisibilityGroups),
    style: null,
    uiTheme: DEFAULT_THEME,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      visibility: props.visibility,
      isSelectVisible: false,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.visibility !== this.props.visibility) {
      this.setState({
        visibility: this.props.visibility,
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

  getVisibilityOptions = async (q: string): Promise<VisibilityGroups> => {
    try {
      return await this.props.getOptions(q);
    } catch (e) {
      return {} as VisibilityGroups;
    }
  };

  setSelectVisible = (isSelectVisible: boolean) => {
    const noop = () => {};

    const {onShow = noop, onHide = noop} = this.props;

    if (isSelectVisible) {
      onShow();
    } else {
      onHide();
    }

    this.setState({isSelectVisible});
  };

  openSelect = () => {
    this.setSelectVisible(true);
  };

  closeSelect = () => {
    this.setSelectVisible(false);
  };

  onSelect = (selectedItems: (User | UserGroup)[] | null) => {
    const selected: (User | UserGroup)[] = selectedItems || [];
    const visibility: Visibility = IssueVisibility.visibility({
      permittedGroups: selected.filter((it) => hasType.userGroup(it as UserGroup)) as UserGroup[],
      permittedUsers: selected.filter((it) => hasType.user(it)) as User[],
    });
    this.updateVisibility({
      ...this.props.visibility,
      ...visibility,
    });
    this.closeSelect();
  };

  resetVisibility = () => {
    this.updateVisibility(null);
  };

  getVisibilitySelectedItems: () => VisibilityItem[] = () => {
    const {visibility} = this.state;
    const v: VisibilityItem[] = [];
    return visibility ? v.concat(visibility?.permittedGroups || []).concat(visibility?.permittedUsers || []) : v;
  };

  getItemTitle: (item: any) => any = (item: Record<string, any>) => getEntityPresentation(item);

  renderSelect(): React.ReactNode {
    const Component = (isSplitView() ? SelectSectionedModal : SelectSectioned) as React.ElementType;
    return (
      <Component
        testID="test:id/visibility-control-button"
        accessibilityLabel="visibility-control-button"
        accessible={true}
        multi={true}
        emptyValue={null}
        placeholder={i18n('Filter users, groups, and teams')}
        selectedItems={this.getVisibilitySelectedItems()}
        getTitle={this.getItemTitle}
        dataSource={async (q: string) => getGroupedData(await this.getVisibilityOptions(q))}
        onSelect={this.onSelect}
        onCancel={this.closeSelect}
      />
    );
  }

  renderVisibilityButton(): React.ReactNode {
    const {
      onSubmit,
      visibilityDefaultLabel = visibilityDefaultText(),
      disabled,
      color = styles.buttonText.color,
    } = this.props;
    const {visibility} = this.state;

    const isSecured: boolean = IssueVisibility.isSecured(visibility);
    const label: string = getVisibilityPresentation(visibility, visibilityDefaultLabel);

    return (
      <View
        testID="test:id/visibilityControlButton"
        accessibilityLabel="visibilityControlButton"
        accessible={true}
        style={[styles.container, this.props.style]}
      >
        {!onSubmit && isSecured && (
          <TouchableOpacity
            testID="test:id/visibilityResetButton"
            accessibilityLabel="visibilityResetButton"
            style={styles.resetButton}
            onPress={this.resetVisibility}
            hitSlop={HIT_SLOP}
          >
            <IconClose size={20} color={color} />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.container} onPress={this.openSelect} hitSlop={HIT_SLOP} disabled={disabled}>
          {(isSecured || visibility?.inherited) && (
            <IconLock style={styles.buttonIcon} size={18} color={color} />
          )}
          <Text style={[styles.buttonText, isSecured && {color}]}>{label}</Text>
          {!disabled && <IconAngleDown size={20} color={isSecured ? color : styles.buttonText.color} />}
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View testID="test:id/visibilityControl" accessibilityLabel="visibilityControl">
        {this.renderVisibilityButton()}
        {this.state.isSelectVisible && this.renderSelect()}
      </View>
    );
  }
}

import React, {PureComponent} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {sortAlphabetically} from '../search/sorting';
import {hasType} from '../api/api__resource-types';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {IconAngleDown, IconClose, IconLock} from '../icon/icon';
import Select from '../select/select';
import IssueVisibility from './issue-visibility';
import {visibilityDefaultText} from './visibility-strings';
import {HIT_SLOP} from '../common-styles/button';
import {DEFAULT_THEME} from '../theme/theme';
import styles from './visibility-control.styles';
import type {User} from 'flow/User';
import type {UserGroup} from 'flow/UserGroup';
import type {Visibility} from 'flow/Visibility';
import type {ViewStyleProp} from 'flow/Internal';
import type {UITheme} from 'flow/Theme';
type Props = {
  getOptions: () => Array<User | UserGroup>;
  onApply: (visibility: Visibility) => any;
  onHide?: () => any;
  onShow?: () => any;
  onSubmit?: ((visibility: Visibility) => any) | null | undefined;
  style?: ViewStyleProp;
  uiTheme: UITheme;
  visibility: Visibility | null;
  visibilityDefaultLabel?: string;
};
type State = {
  visibility: Visibility | null;
  isSelectVisible: boolean;
};
export default class VisibilityControl extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    visibility: null,
    onApply: (visibility: Visibility) => null,
    getOptions: () => [],
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

  updateVisibility: (visibility: Visibility | null) => void = (
    visibility: Visibility | null,
  ) => {
    this.setState({
      visibility,
    });

    if (this.props.onSubmit) {
      this.props.onSubmit(visibility);
      return this.closeSelect();
    }

    this.props.onApply(visibility);
  };
  getVisibilityOptions: () => Array<User | UserGroup> = async () => {
    try {
      return this.props.getOptions();
    } catch (e) {
      return {};
    }
  };
  createSelectItems: (visibility: Visibility) => Array<User | UserGroup> = (
    visibility: Visibility,
  ): Array<User | UserGroup> => {
    const visibilityGroups: Array<UserGroup> = (
      visibility.visibilityGroups ||
      visibility.permittedGroups ||
      []
    )
      .filter((group: UserGroup) => !group.allUsersGroup)
      .sort(sortAlphabetically);
    const visibilityUsers: Array<User> = (
      visibility.visibilityUsers ||
      visibility.permittedUsers ||
      []
    ).sort(sortAlphabetically);
    return visibilityGroups.concat(visibilityUsers);
  };
  getVisibilitySelectItems: () => Promise<
    Array<User | UserGroup>
  > = async () => {
    const visibility: Visibility = await this.getVisibilityOptions();
    return this.createSelectItems(visibility);
  };
  setSelectVisible: (isVisible: boolean) => void = (isVisible: boolean) => {
    const noop: () => void = (): void => {};

    const {onShow = noop, onHide = noop} = this.props;

    if (isVisible) {
      onShow();
    } else {
      onHide();
    }

    this.setState({
      isSelectVisible: isVisible,
    });
  };
  openSelect: () => void = () => {
    this.setSelectVisible(true);
  };
  closeSelect: () => void = () => {
    this.setSelectVisible(false);
  };
  onSelect: (
    selectedItems: Array<User | UserGroup> | null | undefined,
  ) => void = (selectedItems: Array<User | UserGroup> | null | undefined) => {
    const visibility: Visibility = IssueVisibility.visibility({
      permittedGroups: (selectedItems || []).filter(it =>
        hasType.userGroup(it),
      ),
      permittedUsers: (selectedItems || []).filter(it => hasType.user(it)),
    });
    this.updateVisibility(visibility);
    this.closeSelect();
  };
  resetVisibility: () => void = () => {
    this.updateVisibility(null);
  };
  getVisibilitySelectedItems: () => Array<User | UserGroup> = (): Array<
    User | UserGroup
  > => {
    const {visibility} = this.state;
    return visibility
      ? []
          .concat(visibility.permittedGroups || [])
          .concat(visibility.permittedUsers || [])
      : [];
  };
  getItemTitle: (item: any) => any = (item: Record<string, any>) =>
    getEntityPresentation(item);

  renderSelect(): React.ReactNode {
    return (
      <Select
        testID="test:id/visibility-control-button"
        accessibilityLabel="visibility-control-button"
        accessible={true}
        multi={true}
        emptyValue={null}
        placeholder={i18n('Filter users, groups, and teams')}
        selectedItems={this.getVisibilitySelectedItems()}
        getTitle={this.getItemTitle}
        dataSource={this.getVisibilitySelectItems}
        onSelect={this.onSelect}
        onCancel={this.closeSelect}
      />
    );
  }

  getVisibilityPresentation(visibility: Visibility): string {
    const author: User | null | undefined =
      visibility?.implicitPermittedUsers &&
      visibility.implicitPermittedUsers[0];
    return [
      getEntityPresentation(author),
      IssueVisibility.getVisibilityShortPresentation(visibility),
    ]
      .filter(Boolean)
      .join(', ');
  }

  renderVisibilityButton(): React.ReactNode {
    const {
      onSubmit,
      visibilityDefaultLabel = visibilityDefaultText,
    } = this.props;
    const {visibility} = this.state;
    const isSecured: boolean = IssueVisibility.isSecured(visibility);
    const label: string = visibility?.inherited
      ? 'Inherited restrictions'
      : isSecured
      ? this.getVisibilityPresentation(visibility)
      : visibilityDefaultLabel;
    return (
      <View
        testID="test:id/visibilityControlButton"
        accessibilityLabel="visibilityControlButton"
        accessible={true}
        style={[styles.container, this.props.style]}
      >
        {!onSubmit && isSecured && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={this.resetVisibility}
            hitSlop={HIT_SLOP}
          >
            <IconClose size={16} color={this.props.uiTheme.colors.$link} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.container}
          onPress={this.openSelect}
          hitSlop={HIT_SLOP}
        >
          {(isSecured || visibility?.inherited) && (
            <IconLock
              style={styles.buttonIcon}
              size={16}
              color={this.props.uiTheme.colors.$iconAccent}
            />
          )}
          <Text style={styles.buttonText}>{label}</Text>
          <IconAngleDown size={20} color={this.props.uiTheme.colors.$icon} />
        </TouchableOpacity>
      </View>
    );
  }

  render(): React.ReactNode {
    return (
      <View testID="visibilityControl">
        {this.renderVisibilityButton()}
        {this.state.isSelectVisible && this.renderSelect()}
      </View>
    );
  }
}

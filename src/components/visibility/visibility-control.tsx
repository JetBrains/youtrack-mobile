import React, {PureComponent} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import IssueVisibility from './issue-visibility';
import SelectSectioned, {SelectSectionedModal, SLItem} from 'components/select/select-sectioned';
import {DEFAULT_THEME} from 'components/theme/theme';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {hasType} from 'components/api/api__resource-types';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconAngleDown, IconClose, IconLock} from 'components/icon/icon';
import {isSplitView} from 'components/responsive/responsive-helper';
import {sortAlphabetically} from '../search/sorting';
import {visibilityDefaultText} from './visibility-strings';

import styles from './visibility-control.styles';

import type {UITheme} from 'types/Theme';
import type {User} from 'types/User';
import type {ViewStyleProp} from 'types/Internal';
import type {Visibility, VisibilityGroups, VisibilityItem} from 'types/Visibility';

interface Props {
  getOptions: (q: string | undefined) => Promise<VisibilityGroups>;
  onApply: (visibility: Visibility) => any;
  onHide?: () => any;
  onShow?: () => any;
  onSubmit?: ((visibility: Visibility) => any) | null | undefined;
  style: ViewStyleProp | null;
  uiTheme: UITheme;
  visibility: Visibility | null;
  visibilityDefaultLabel?: string;
}

type State = {
  isSelectVisible: boolean;
  visibility: Visibility | null;
};


export default class VisibilityControl extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    visibility: null,
    onApply: (visibility: Visibility) => null,
    getOptions: () => Promise.resolve({} as VisibilityGroups),
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
  getVisibilityOptions = async (q: string | undefined): Promise<VisibilityGroups> => {
    try {
      return await this.props.getOptions(q);
    } catch (e) {
      return {} as VisibilityGroups;
    }
  };

  getGroupedData = async (q: string) => {
    const vg: VisibilityGroups = await this.getVisibilityOptions(q);
    const sort = (data: VisibilityItem[] = []): VisibilityItem[] => (
      data
        .filter((group: VisibilityItem & { allUsersGroup?: boolean }) => !group.allUsersGroup)
        .sort(sortAlphabetically)
    );
    const recommendedGroups: VisibilityItem[] = sort(vg.recommendedGroups);
    const groupsWithoutRecommended: VisibilityItem[] = (
      vg.groupsWithoutRecommended != null
        ? vg.groupsWithoutRecommended
        : vg.visibilityGroups
    );
    const grouped: {
      groups: { data: VisibilityItem[]; title: string };
      users: { data: VisibilityItem[]; title: string };
      recommended: { data: VisibilityItem[]; title: string }
    } = {
      recommended: {
        title: i18n('Recommended groups and teams'),
        data: recommendedGroups,
      },
      groups: {
        title: recommendedGroups.length > 0 ? i18n('Other groups and teams') : i18n('Groups and teams'),
        data: sort(groupsWithoutRecommended),
      },
      users: {
        title: i18n('Users'),
        data: sort(vg.visibilityUsers),
      },
    };

    return Object.keys(grouped).reduce(
      (akk: SLItem[], key: string) => [
        ...akk,
        ...(grouped[key as keyof typeof grouped].data.length > 0 ? [grouped[key as keyof typeof grouped]] : [])],
      [] as SLItem[]
    );
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
  onSelect = (selectedItems: VisibilityItem[] | null) => {
    const selected: VisibilityItem[] = selectedItems || [];
    const visibility: Visibility = IssueVisibility.visibility({
      permittedGroups: selected.filter((it: VisibilityItem) => hasType.userGroup(it)),
      permittedUsers: selected.filter((it: VisibilityItem) => hasType.user(it)),
    });
    this.updateVisibility({
      ...this.props.visibility,
      ...visibility,
    });
    this.closeSelect();
  };
  resetVisibility: () => void = () => {
    this.updateVisibility(null);
  };
  getVisibilitySelectedItems: () => VisibilityItem[] = () => {
    const {visibility} = this.state;
    const v: VisibilityItem[] = [];
    return (
      visibility
        ? v.concat(visibility?.permittedGroups || []).concat(visibility?.permittedUsers || [])
        : v
    );
  };

  getItemTitle: (item: any) => any = (item: Record<string, any>) => getEntityPresentation(item);

  renderSelect(): React.ReactNode {
    const Component = isSplitView() ? SelectSectionedModal : SelectSectioned;
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
        dataSource={this.getGroupedData}
        onSelect={this.onSelect}
        onCancel={this.closeSelect}
      />
    );
  }

  getVisibilityPresentation(visibility: Visibility): string {
    const author: User | undefined = visibility?.implicitPermittedUsers && visibility.implicitPermittedUsers[0];
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
      visibilityDefaultLabel = visibilityDefaultText(),
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
            <IconClose size={16} color={this.props.uiTheme.colors.$link}/>
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
          <IconAngleDown size={20} color={styles.buttonText.color}/>
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

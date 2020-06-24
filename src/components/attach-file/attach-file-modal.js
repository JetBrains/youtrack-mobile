/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';

import Header from '../header/header';
import ModalView from '../modal-view/modal-view';
import AttachmentErrorBoundary from '../attachments-row/attachment-error-boundary';
import calculateAspectRatio from '../aspect-ratio/aspect-ratio';
import {getApi} from '../api/api__instance';
import {IconAngleDown, IconCheck, IconClose, IconLock} from '../icon/icon';
import usage from '../usage/usage';
import {COLOR_GRAY, COLOR_ICON_LIGHT_BLUE, COLOR_ICON_MEDIUM_GREY, COLOR_PINK, UNIT} from '../variables/variables';

import {HIT_SLOP} from '../common-styles/button';
import IssueVisibility from '../issue-visibility/issue-visibility';
import Select from '../select/select';
import {secondaryText} from '../common-styles/typography';
import {sortAlphabetically} from '../search/sorting';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';

import styles from './attach-file-modal.styles';

import type {Attachment, ImageDimensions} from '../../flow/CustomFields';
import type {Visibility} from '../../flow/Visibility';
import type {User} from '../../flow/User';
import type {UserGroup} from '../../flow/UserGroup';
import {hasType} from '../api/api__resource-types';

type Action = { title: string, execute: () => any, icon?: React$Element<any> };

type Props = {
  issueId: string,
  actions: Array<Action>,
  attach: Attachment,
  onCancel: () => any,
  onAttach: (file: Attachment) => any
};

type State = {
  isSelectVisible: boolean
}

const CATEGORY_NAME = 'Attach file modal';



export default class AttachFileModal extends PureComponent<Props, State> {
  headers: { Authorization: string } = getApi().auth.getAuthorizationHeaders();

  constructor(props: Props) {
    super(props);
    usage.trackScreenView(CATEGORY_NAME);

    this.state = {
      attach: props.attach,
      isSelectVisible: false,
      select: {}
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.attach !== this.props.attach) {
      this.setState({
        attach: this.props.attach
      });
    }
  }

  loadVisibility = async (issueId: string) => {
    return getApi().issue.getVisibilityOptions(issueId);
  }

  createSelectItems = (visibility: Visibility) => {
    const visibilityGroups: Array<UserGroup> = (visibility.visibilityGroups || []).filter((group: UserGroup) => !group.allUsersGroup).sort(sortAlphabetically);
    const visibilityUsers: Array<User> = (visibility.visibilityUsers || []).sort(sortAlphabetically);
    return visibilityGroups.concat(visibilityUsers);
  }

  attachFile = () => {
    if (this.state.attach) {
      this.props.onAttach(this.state.attach);
    }
  };

  setSelectVisible = (isVisible: boolean) => {
    this.setState({
      isSelectVisible: isVisible
    });
  };

  openSelect = () => {
    this.setSelectVisible(true);
  };

  closeSelect = () => {
    this.setSelectVisible(false);
  };

  updateAttachVisibility = (visibility: Visibility | null) => {
    this.setState({
      attach: {
        ...this.state.attach,
        visibility
      }
    });
  }

  onSelect = (selectedItems: Array<User | UserGroup>) => {
    this.setSelectVisible(false);

    const visibility: Visibility = IssueVisibility.visibility({
      permittedGroups: selectedItems.filter(it => hasType.userGroup(it)),
      permittedUsers: selectedItems.filter(it => hasType.user(it))
    });

    this.updateAttachVisibility(visibility);
  };

  loadVisibilityItems = async () => {
    const visibility: Visibility = await this.loadVisibility(this.props.issueId);
    return this.createSelectItems(visibility);
  };

  resetVisibility = () => {
    this.updateAttachVisibility(null);
  };

  getVisibilitySelectedItems = () => {
    const attachVisibility = this.state.attach.visibility;
    if (!attachVisibility) {
      return [];
    }
    return [].concat(attachVisibility.permittedGroups || []).concat(attachVisibility.permittedUsers || []);
  };

  renderSelect() {
    const selectProps = {
      multi: true,
      selectedItems: this.getVisibilitySelectedItems(),
      getTitle: item => getEntityPresentation(item),
      dataSource: this.loadVisibilityItems,
      onSelect: this.onSelect,
      onCancel: this.closeSelect
    };

    return (
      <Select {...selectProps}/>
    );
  }

  renderVisibilityButton() {
    const {attach} = this.state;
    const isSecured: boolean = IssueVisibility.isSecured(attach?.visibility);

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        disabled={false}
        onPress={this.openSelect}
        hitSlop={HIT_SLOP}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          disabled={false}
          onPress={this.openSelect}
          hitSlop={HIT_SLOP}
        >
          {isSecured && (
            <IconLock
              style={{
                marginRight: UNIT
              }}
              size={16}
              color={COLOR_ICON_LIGHT_BLUE}
            />
          )}
          <Text style={{
            ...secondaryText,
            marginRight: UNIT
          }
          }>
            {isSecured ? IssueVisibility.getVisibilityPresentation(attach.visibility) : 'Visible to All Users'}
          </Text>
          <IconAngleDown size={20} color={COLOR_ICON_MEDIUM_GREY}/>
        </TouchableOpacity>

        {isSecured && (
          <TouchableOpacity
            onPress={this.resetVisibility}
            hitSlop={HIT_SLOP}
          >
            <IconClose size={20} color={COLOR_PINK}/>
          </TouchableOpacity>
        )}
      </View>
    );
  }


  render() {
    const {actions, attach} = this.props;
    const dimensions: ?ImageDimensions = attach && calculateAspectRatio(attach.dimensions);
    const hasAttach: boolean = !!attach;

    return (
      <ModalView
        animationType="slide"
        testID="attachFileModal"
        style={styles.container}
      >
        <Header
          leftButton={<IconClose size={21} color={COLOR_PINK}/>}
          onBack={this.props.onCancel}
          rightButton={<IconCheck size={20} color={hasAttach ? COLOR_PINK : COLOR_GRAY}/>}
          onRightButtonClick={this.attachFile}>
          <Text style={styles.title}>Attach image</Text>
        </Header>

        <View style={styles.content}>

          <View style={styles.image}>
            {attach && (
              <AttachmentErrorBoundary
                attachName={attach.name}
              >
                <Image
                  source={{
                    isStatic: true,
                    uri: attach.url,
                    width: dimensions.width,
                    height: dimensions.height,
                  }}
                />
              </AttachmentErrorBoundary>
            )
            }
            {attach && this.renderVisibilityButton()}
          </View>

          <View tyle={{
            flexGrow: 0,
            backgroundColor: 'yellow',
          }}>
            {actions.map((action: Action) => {
              return (
                <TouchableOpacity
                  hitSlope={HIT_SLOP}
                  key={action.title}
                  onPress={action.execute}
                  style={styles.button}
                >
                  {action.icon && <action.icon size={20} color={COLOR_ICON_LIGHT_BLUE} style={styles.buttonIcon}/>}
                  <Text style={styles.buttonText}>{action.title}</Text>
                </TouchableOpacity>
              );
            })}

          </View>
        </View>

        {this.state.isSelectVisible && this.renderSelect()}

      </ModalView>
    );
  }
}

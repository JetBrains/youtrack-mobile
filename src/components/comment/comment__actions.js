/* @flow */
import React, {Component} from 'react';
import type {Node} from 'react';
import {
  COLOR_PINK,
  COLOR_PINK_DARK,
  COLOR_EXTRA_LIGHT_GRAY,
  COLOR_BLACK
} from '../../components/variables/variables';
import {reply, share, pencil, trash} from '../icon/icon';
import Swipeout from 'react-native-swipeout';
import SwipeButton from './comment__swipe-button';

type Props = {
  disabled: boolean,
  onReply: () => any,
  onCopyCommentLink: () => any,
  canEdit: boolean,
  onEdit: () => any,
  canDelete: boolean,
  onDelete: () => any,
  children?: Node,
  style?: any,
};

export default class CommentActions extends Component<Props, void> {
  _getCommentActionButtons() {
    const {canEdit, canDelete} = this.props;
    const swipeoutBtns = [
      {
        backgroundColor: COLOR_PINK,
        component: <SwipeButton text="Reply" icon={reply} />,
        onPress: this.props.onReply
      },
      {
        backgroundColor: COLOR_PINK_DARK,
        component: <SwipeButton text="Copy link" icon={share} />,
        onPress: this.props.onCopyCommentLink
      },
      canEdit && {
        backgroundColor: COLOR_BLACK,
        component: <SwipeButton text="Edit" icon={pencil} />,
        onPress: this.props.onEdit
      },

      canDelete && {
        backgroundColor: COLOR_BLACK,
        component: <SwipeButton text="Delete" icon={trash} />,
        onPress: this.props.onDelete
      }
    ];
    return swipeoutBtns.filter(it => !!it);
  }

  render() {
    const {children, style, disabled} = this.props;

    return (
      <Swipeout
        disabled={disabled}
        backgroundColor={COLOR_EXTRA_LIGHT_GRAY}
        right={this._getCommentActionButtons()}
        sensitivity={30}
        buttonWidth={56}
        autoClose={true}
        style={style}
      >
        {children}
      </Swipeout>
    );
  }
}

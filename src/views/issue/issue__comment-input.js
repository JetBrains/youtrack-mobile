/* @flow */

import React, {PureComponent} from 'react';
import {View, ActivityIndicator} from 'react-native';

import debounce from 'lodash.debounce';
import {TouchableOpacity} from 'react-native-gesture-handler';

import IconHourGlass from '@jetbrains/icons/hourglass.svg';
import Mentions from '../../components/mentions/mentions';
import MultilineInput from '../../components/multiline-input/multiline-input';
import VisibilityControl from '../../components/visibility/visibility-control';
import {getSuggestWord, composeSuggestionText} from '../../components/mentions/mension-helper';
import {HIT_SLOP} from '../../components/common-styles/button';
import {IconArrowUp} from '../../components/icon/icon';
import {commentPlaceholderText} from '../../app-text';

import styles from './issue__comment-input.styles';

import type {IssueComment} from '../../flow/CustomFields';
import type {Node} from 'react';
import type {UITheme} from '../../flow/Theme';
import type {UserGroup} from '../../flow/UserGroup';
import type {User} from '../../flow/User';
import type {Visibility} from '../../flow/Visibility';

type Props = {
  onCommentChange?: (comment: IssueComment) => any,
  onSubmitComment: (comment: IssueComment) => any,
  editingComment: ?$Shape<IssueComment>,
  suggestionsAreLoading: boolean,
  onRequestCommentSuggestions: (query: string) => any,
  mentions: ?{ users: Array<User> },
  getCommentVisibilityOptions: () => Array<User | UserGroup>,
  canAttach: boolean,
  onAddSpentTime: (() => any) | null,
  onAttach: () => any,
  uiTheme: UITheme,
};

type State = {
  isSaving: boolean,
  editingComment: $Shape<IssueComment>,
  isLoadingSuggestions: boolean,
  showSuggestions: boolean,
  suggestionsQuery: string,
  commentCaret: number,
  suggestedUsers: Array<User>,
  isVisibilityControlVisible: boolean,
  isSelectVisible: boolean,
};

const EMPTY_COMMENT: $Shape<IssueComment> = {text: '', visibility: null};

export default class IssueCommentInput extends PureComponent<Props, State> {
  isUnmounted: boolean;
  editCommentInput: MultilineInput;

  constructor(props: Props) {
    super(props);
    const editingComment: $Shape<IssueComment> = props?.editingComment || EMPTY_COMMENT;
    this.state = {
      isSaving: false,
      editingComment,
      isLoadingSuggestions: false,
      showSuggestions: false,
      suggestionsQuery: '',
      suggestedUsers: [],
      commentCaret: 0,
      isVisibilityControlVisible: false,
      isSelectVisible: false,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.editingComment && nextProps.editingComment.text !== this.props?.editingComment?.text) {
      this.setComment(nextProps.editingComment);
    }
  }

  componentWillUnmount = (): void => {
    this.onChange(null);
    this.isUnmounted = true;
  }

  debouncedOnTextChange: Function = debounce((text: string) => (
    this.onChange({
      ...this.props.editingComment,
      text,
    })
  ), 300);

  onChange = (editingComment: $Shape<IssueComment> | null): void => {
    this.props.onCommentChange && this.props.onCommentChange(editingComment);
  }

  setComment = (editingComment: $Shape<IssueComment> = EMPTY_COMMENT): void => {
    this.setState({editingComment});
  };

  focus = (): void => {this.editCommentInput.focus();}

  updateComment = (): void => {
    this.setState({isSaving: true});
    this.toggleVisibilityControl(false);
    this.props.onSubmitComment({
      ...this.state.editingComment,
      usesMarkdown: true,
    }).then(() => {
      if (!this.isUnmounted) {
        this.setComment();
      }
    }).finally(() => {
      if (!this.isUnmounted) {
        this.setState({isSaving: false});
      }
    });
  };

  suggestionsNeededDetector(text: string, caret: number): void {
    let word: ?string = ((getSuggestWord(text, caret): any): string | null);
    if (!word) {
      return this.setState({
        showSuggestions: false,
        suggestionsQuery: ''
      });
    }

    if (word === '@') {
      word = word.slice(1);
      this.setState({
        showSuggestions: true,
        suggestionsQuery: word
      });

      this.props.onRequestCommentSuggestions(word);
    }
  }

  applySuggestion: (user: User) => void = (user: User) => {
    const {editingComment, commentCaret} = this.state;
    const newText: ?string = composeSuggestionText(user, editingComment.text, commentCaret);
    if (newText) {
      this.setState({
        editingComment: {
          ...editingComment,
          text: newText,
        },
        showSuggestions: false,
        isVisibilityControlVisible: true
      });
    }
  };

  toggleVisibilityControl: (isVisibilityControlVisible: boolean) => void = (isVisibilityControlVisible: boolean) => {
    this.setState({isVisibilityControlVisible});
  };

  renderUserMentions(): Node {
    const {mentions, suggestionsAreLoading} = this.props;

    return (
      <Mentions
        isLoading={suggestionsAreLoading}
        mentions={mentions}
        onApply={(user: User) => {
          this.applySuggestion(user);
          setTimeout(this.focus, 150);
        }}
      />
    );
  }

  renderVisibility(): Node {
    const {uiTheme, getCommentVisibilityOptions} = this.props;
    const {editingComment} = this.state;

    return <VisibilityControl
      onShow={() => this.setState({isSelectVisible: true})}
      onHidde={() => this.setState({isSelectVisible: false})}
      visibility={editingComment.visibility}
      onSubmit={(visibility: Visibility) => {
        const comment = {
          ...editingComment,
          visibility,
        };
        this.setComment(comment);
        this.onChange(comment);
      }}
      uiTheme={uiTheme}
      getOptions={getCommentVisibilityOptions}
    />;
  }

  renderSendButton(): Node {
    const {uiTheme} = this.props;
    const {isSaving, editingComment} = this.state;
    const isDisabled: boolean = !(editingComment.text || '').trim() || isSaving;

    return (
      <TouchableOpacity
        style={[
          styles.commentSendButton,
          isDisabled ? styles.commentSendButtonDisabled : null
        ]}
        disabled={isDisabled}
        onPress={this.updateComment}>
        {!this.state.isSaving && (
          <IconArrowUp
            size={22}
            color={uiTheme.colors.$textButton}
          />
        )}
        {this.state.isSaving && <ActivityIndicator color={uiTheme.colors.$background}/>}
      </TouchableOpacity>
    );
  }

  setInputRef: (instance: ?MultilineInput) => ?MultilineInput = (instance: ?MultilineInput) => (
    instance && (this.editCommentInput = instance)
  );

  render(): Node {
    const {uiTheme, onAddSpentTime} = this.props;
    const {isSaving, commentCaret, showSuggestions, editingComment, isVisibilityControlVisible, isSelectVisible} = this.state;
    const hasText: boolean = !!editingComment.text;
    const showVisibilityControl: boolean = !showSuggestions && (
      editingComment.visibility ||
      isSelectVisible ||
      isVisibilityControlVisible
    );

    return (
      <View style={styles.container}>
        {showSuggestions && this.renderUserMentions()}

        <View style={[
          styles.commentHeaderContainer,
          showVisibilityControl ? styles.commentHeaderContainerCreate : null,
        ]}>

          {showVisibilityControl && this.renderVisibility()}

        </View>

        <View style={styles.commentContainer}>
          {!!onAddSpentTime && <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionsContainerIcon}
              hitSlop={HIT_SLOP}
              onPress={onAddSpentTime}
            >
              <IconHourGlass
                fill={styles.actionsContainerIcon.color}
                width={26}
                height={26}
              />
            </TouchableOpacity>
          </View>}

          <View style={styles.commentInputContainer}>
            <MultilineInput
              ref={this.setInputRef}
              {...{...this.props, autoFocus: !!editingComment.reply}}
              placeholder={commentPlaceholderText}
              value={editingComment.text}
              editable={!isSaving}
              underlineColorAndroid="transparent"
              keyboardAppearance={uiTheme.name}
              placeholderTextColor={uiTheme.colors.$icon}
              autoCapitalize="sentences"
              onSelectionChange={(event) => {
                const caret = event.nativeEvent.selection.start;
                this.setState({commentCaret: caret});
              }}
              onChangeText={(text) => {
                this.setComment({
                  ...editingComment,
                  text: text,
                });
                this.suggestionsNeededDetector(text, commentCaret);
                this.debouncedOnTextChange(text);
              }}
              onFocus={() => this.toggleVisibilityControl(true)}
              onBlur={() => {
                this.setState({showSuggestions: false});
                this.toggleVisibilityControl(false);
              }}
              style={styles.commentInput}
            />

            {hasText && this.renderSendButton()}
          </View>
        </View>
      </View>
    );
  }
}

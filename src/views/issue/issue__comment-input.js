/* @flow */

import {View, Text, ActivityIndicator} from 'react-native';
import React, {PureComponent} from 'react';

import throttle from 'lodash.throttle';
import {TouchableOpacity} from 'react-native-gesture-handler';

import IconHourGlass from '@jetbrains/icons/hourglass.svg';
import IssueVisibility from '../../components/visibility/issue-visibility';
import Mentions from '../../components/mentions/mentions';
import MultilineInput from '../../components/multiline-input/multiline-input';
import {getSuggestWord, composeSuggestionText} from '../../components/mentions/mension-helper';
import {HIT_SLOP} from '../../components/common-styles/button';
import {IconAngleDown, IconArrowUp, IconLock} from '../../components/icon/icon';
import {commentPlaceholderText} from '../../app-text';
import {visibilityDefaultText} from '../../components/visibility/visibility-strings';

import styles from './issue__comment-input.styles';

import type {IssueComment} from '../../flow/CustomFields';
import type {Node} from 'react';
import type {UITheme} from '../../flow/Theme';
import type {User} from '../../flow/User';

type Props = {
  initialText: string,
  onChangeText?: (text: string) => any,
  onSubmitComment: (comment: IssueComment) => any,
  editingComment: IssueComment,
  suggestionsAreLoading: boolean,
  onRequestCommentSuggestions: (query: string) => any,
  mentions: ?{ users: Array<User> },
  onEditCommentVisibility: (comment: IssueComment) => any,
  isSecured: boolean,
  canAttach: boolean,
  onAddSpentTime: (() => any) | null,
  onAttach: () => any,
  uiTheme: UITheme
};

type State = {
  isSaving: boolean,
  commentText: string,
  isLoadingSuggestions: boolean,
  showSuggestions: boolean,
  suggestionsQuery: string,
  commentCaret: number,
  suggestedUsers: Array<User>,
  showVisibility: boolean,
};


export default class IssueCommentInput extends PureComponent<Props, State> {
  isUnmounted: boolean;
  editCommentInput: MultilineInput;
  debouncedOnChange: Function = throttle((text: string) => (
    this.props.onChangeText && this.props.onChangeText(text)
  ), 300);

  constructor() {
    super();
    this.state = {
      isSaving: false,
      commentText: '',
      isLoadingSuggestions: false,
      showSuggestions: false,
      suggestionsQuery: '',
      suggestedUsers: [],
      commentCaret: 0,
      showVisibility: false
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    if (nextProps.initialText !== this.props.initialText) {
      this.setState({commentText: nextProps.initialText});
    }
  }

  componentDidMount() {
    this.setState({commentText: this.props.initialText});
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  focus: () => void = () => {
    this.editCommentInput.focus();
  };

  updateComment: () => void = () => {
    this.setState({isSaving: true});
    const comment = {
      ...this.props.editingComment,
      ...{
        usesMarkdown: true,
        text: this.state.commentText
      }
    };

    this.props.onSubmitComment(comment).then(() => {
      if (!this.isUnmounted) {
        this.setState({
          commentText: '',
          showVisibility: false
        });
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
    const newText: ?string = composeSuggestionText(user, this.state?.commentText, this.state.commentCaret);
    if (newText) {
      this.setState({
        commentText: newText,
        showSuggestions: false,
        showVisibility: true
      });
    }
  };

  toggleVisibility: (showVisibility: boolean) => void = (showVisibility: boolean) => {
    this.setState({showVisibility});
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
    const {editingComment, onEditCommentVisibility, isSecured, uiTheme} = this.props;

    return (
      <TouchableOpacity
        style={styles.visibilityChangeButton}
        disabled={this.state.isSaving}
        onPress={() => onEditCommentVisibility(editingComment)}
        hitSlop={HIT_SLOP}
      >
        {isSecured && (
          <IconLock
            style={styles.visibilityChangeButtonLockIcon}
            size={16}
            color={uiTheme.colors.$iconAccent}
          />
        )}
        <Text style={styles.visibilityChangeButtonText}>
          {isSecured ? IssueVisibility.getVisibilityPresentation(editingComment.visibility) : visibilityDefaultText}
        </Text>
        <IconAngleDown size={20} color={uiTheme.colors.$icon}/>
      </TouchableOpacity>
    );
  }

  renderSendButton(): Node {
    const {uiTheme} = this.props;
    const {isSaving, commentText} = this.state;
    const isDisabled: boolean = !(commentText || '').trim() || isSaving;

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
    const {editingComment, uiTheme, onAddSpentTime} = this.props;
    const {isSaving, commentText, commentCaret, showSuggestions} = this.state;

    const isEditComment: boolean = !!editingComment;
    const showVisibility: boolean = !showSuggestions && (this.state.showVisibility || !!commentText);

    return (
      <View style={styles.container}>
        {showSuggestions && this.renderUserMentions()}

        <View style={[
          styles.commentHeaderContainer,
          showVisibility ? styles.commentHeaderContainerCreate : null,
          isEditComment ? styles.commentHeaderContainerEdit : null
        ]}>

          {showVisibility && this.renderVisibility()}

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
              {...{...this.props, autoFocus: isEditComment}}
              placeholder={commentPlaceholderText}
              value={commentText}
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
                this.setState({commentText: text});
                this.suggestionsNeededDetector(text, commentCaret);
                this.debouncedOnChange(text);
              }}
              onFocus={() => this.toggleVisibility(true)}
              onBlur={() => {
                this.setState({showSuggestions: false});
                this.toggleVisibility(false);
              }}
              style={styles.commentInput}
            />

            {showVisibility && !isEditComment && this.renderSendButton()}
          </View>
        </View>
      </View>
    );
  }
}

/* @flow */

import {View, Text, ActivityIndicator, ScrollView} from 'react-native';
import React, {PureComponent} from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';

import throttle from 'lodash.throttle';

import Avatar from '../../components/avatar/avatar';
import MultilineInput from '../../components/multiline-input/multiline-input';

import IssueVisibility from '../../components/visibility/issue-visibility';
import {HIT_SLOP} from '../../components/common-styles/button';
import {IconAngleDown, IconArrowUp, IconCheck, IconClose, IconLock} from '../../components/icon/icon';
import {visibilityDefaultText} from '../../components/visibility/visibility-strings';

import styles from './issue__comment-input.styles';

import type {IssueComment} from '../../flow/CustomFields';
import type {User} from '../../flow/User';
import type {UITheme} from '../../flow/Theme';

type Props = {
  initialText: string,
  onChangeText?: (text: string) => any,
  onSubmitComment: (comment: IssueComment) => any,
  editingComment: IssueComment,
  suggestionsAreLoading: boolean,
  onRequestCommentSuggestions: (query: string) => any,
  mentions: ?{ users: Array<User> },
  onEditCommentVisibility: (commentId: string) => any,
  isSecured: boolean,
  canAttach: boolean,
  onAttach: () => any,
  onCancel: () => any,
  uiTheme: UITheme
};

type State = {
  isSaving: boolean,
  commentText: string,
  showSuggestions: boolean,
  suggestionsQuery: string,
  commentCaret: number,
  showVisibility: boolean
};


export default class IssueCommentInput extends PureComponent<Props, State> {
  isUnmounted: boolean;
  editCommentInput: MultilineInput;
  SUGGESTION_AVATAR_SIZE = 24;
  debouncedOnChange = throttle((text: string) => (
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

  focus = () => {
    this.editCommentInput.focus();
  }

  updateComment = () => {
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

  suggestionsNeededDetector(text: string, caret: number) {
    const match = /[\S\@]+$/.exec(text.slice(0, caret));
    let currentWord = match && match[0];
    if (!currentWord) {
      return this.setState({
        showSuggestions: false,
        suggestionsQuery: ''
      });
    }

    if (currentWord[0] === '@') {
      currentWord = currentWord.slice(1);
      this.setState({
        showSuggestions: true,
        suggestionsQuery: currentWord
      });

      this.props.onRequestCommentSuggestions(currentWord);
    }
  }

  applySuggestion(user: User) {
    function replaceRange(source, start, end, substitute) {
      return source.substring(0, start) + substitute + source.substring(end);
    }

    const match = /[\S\@]+$/.exec(this.state.commentText.slice(0, this.state.commentCaret));
    const currentWord = match && match[0];

    if (currentWord) {
      const startIndex = this.state.commentText.slice(0, this.state.commentCaret).lastIndexOf(currentWord);
      const newText = replaceRange(this.state.commentText,
        startIndex,
        startIndex + currentWord.length,
        `@${user.login}`);
      this.setState({
        commentText: newText,
        showSuggestions: false,
        showVisibility: true
      });
    }
  }

  toggleVisibility = (showVisibility: boolean) => {
    this.setState({showVisibility});
  };

  renderUserMentions() {
    const {mentions, suggestionsAreLoading} = this.props;

    return (
      <ScrollView
        contentContainerStyle={styles.suggestionsContainer}
        keyboardShouldPersistTaps="handled">

        <View style={styles.suggestionsLoadingMessage}>
          {suggestionsAreLoading && !mentions && <ActivityIndicator color={styles.link.color}/>}
        </View>

        <View>
          {mentions
            ? mentions.users.map(user => {
              return (
                <TouchableOpacity
                  key={user.id}
                  style={styles.suggestionButton}
                  onPress={() => {
                    this.applySuggestion(user);
                    setTimeout(this.focus, 150);
                  }}
                >
                  <Avatar
                    userName={user.fullName}
                    size={this.SUGGESTION_AVATAR_SIZE}
                    source={{uri: user.avatarUrl}}
                    style={{
                      width: this.SUGGESTION_AVATAR_SIZE,
                      height: this.SUGGESTION_AVATAR_SIZE
                    }}/>
                  <Text style={styles.suggestionName}>{user.login}</Text>
                  <Text style={styles.suggestionLogin}> {user.fullName}</Text>
                </TouchableOpacity>
              );
            })
            : null}

        </View>

      </ScrollView>
    );
  }

  renderVisibility() {
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

  renderSendButton() {
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

  setInputRef = (instance: ?MultilineInput) => instance && (this.editCommentInput = instance);

  render() {
    const {editingComment, onCancel = () => null, uiTheme} = this.props;
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

          {isEditComment && (
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={onCancel}
            >
              <IconClose size={21} color={uiTheme.colors.$link}/>
            </TouchableOpacity>
          )}

          {showVisibility && this.renderVisibility()}

          {isEditComment && (
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={this.updateComment}
            >
              <IconCheck size={21} color={uiTheme.colors.$link}/>
            </TouchableOpacity>
          )}

        </View>


        <View style={styles.commentContainer}>

          <View style={styles.commentInputContainer}>
            <MultilineInput
              ref={this.setInputRef}
              {...{...this.props, autoFocus: isEditComment, keyboardAppearance: uiTheme.name}}
              placeholder="Write a comment, @mention people"
              value={commentText}
              editable={!isSaving}
              underlineColorAndroid="transparent"
              keyboardAppearance="dark"
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
              onBlur={() => this.toggleVisibility(false)}
              style={styles.commentInput}
            />

            {showVisibility && !isEditComment && this.renderSendButton()}
          </View>
        </View>
      </View>
    );
  }
}

/* @flow */

import {View, Text, ActivityIndicator, ScrollView} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import React, {PureComponent} from 'react';
import throttle from 'lodash.throttle';
import {
  COLOR_FONT_ON_BLACK,
  COLOR_ICON_LIGHT_BLUE,
  COLOR_ICON_MEDIUM_GREY,
  COLOR_PINK,
  COLOR_PLACEHOLDER
} from '../../components/variables/variables';
import MultilineInput from '../../components/multiline-input/multiline-input';
import Avatar from '../../components/avatar/avatar';

import IssueVisibility from '../../components/visibility/issue-visibility';
import {HIT_SLOP} from '../../components/common-styles/button';
import {IconAngleDown, IconArrowUp, IconCheck, IconClose, IconLock} from '../../components/icon/icon';

import styles from './single-issue__comment-input.styles';

import type {IssueComment} from '../../flow/CustomFields';
import type {User} from '../../flow/User';

type Props = {
  initialText: string,
  onChangeText?: (text: string) => any,
  onSubmitComment: (comment: IssueComment) => any,
  editingComment: IssueComment,
  suggestionsAreLoading: boolean,
  onRequestCommentSuggestions: (query: string) => any,
  suggestions: ?{ users: Array<User> },
  onEditCommentVisibility: (commentId: string) => any,
  isSecured: boolean,
  canAttach: boolean,
  onAttach: () => any,
  onCancel: () => any
};

type State = {
  isSaving: boolean,
  commentText: string,
  showSuggestions: boolean,
  suggestionsQuery: string,
  commentCaret: number,
  inputFocus: boolean,
};


export default class SingleIssueCommentInput extends PureComponent<Props, State> {
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
      inputFocus: false
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
          inputFocus: false
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
        inputFocus: true
      });
    }
  }

  renderSuggestions() {
    const {suggestions, suggestionsAreLoading} = this.props;

    return (
      <ScrollView
        contentContainerStyle={styles.suggestionsContainer}
        keyboardShouldPersistTaps="handled">

        <View style={styles.suggestionsLoadingMessage}>
          {suggestionsAreLoading && <Text style={styles.suggestionsLoadingMessageText}>Loading suggestions... </Text>}
        </View>

        <View>
          {suggestions
            ? suggestions.users.map(user => {
              return (
                <TouchableOpacity
                  key={user.id}
                  style={styles.suggestionButton}
                  onPress={() => this.applySuggestion(user)}
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
    const {editingComment, onEditCommentVisibility, isSecured} = this.props;

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
            color={COLOR_ICON_LIGHT_BLUE}
          />
        )}
        <Text style={styles.visibilityChangeButtonText}>
          {isSecured ? IssueVisibility.getVisibilityPresentation(editingComment.visibility) : 'Visible to All Users'}
        </Text>
        <IconAngleDown size={20} color={COLOR_ICON_MEDIUM_GREY}/>
      </TouchableOpacity>
    );
  }

  renderSendButton() {
    const {isSaving, commentText} = this.state;

    return (
      <TouchableOpacity
        style={styles.commentSendButton}
        disabled={!(commentText || '').trim() || isSaving}
        onPress={this.updateComment}>
        {!this.state.isSaving && (
          <IconArrowUp
            size={22}
            color={COLOR_FONT_ON_BLACK}
          />
        )}
        {this.state.isSaving && <ActivityIndicator color={COLOR_FONT_ON_BLACK}/>}
      </TouchableOpacity>
    );
  }

  render() {
    const {editingComment, onCancel = () => null} = this.props;
    const {isSaving, commentText, commentCaret, showSuggestions} = this.state;

    const isEditComment: boolean = !!editingComment;
    const isAddComment: boolean = !showSuggestions && (this.state.inputFocus || !!commentText);

    return (
      <View style={styles.container}>
        {showSuggestions && this.renderSuggestions()}

        <View style={[
          styles.commentHeaderContainer,
          isAddComment ? styles.commentHeaderContainerCreate : null,
          isEditComment ? styles.commentHeaderContainerEdit : null
        ]}>

          {isEditComment && (
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={onCancel}
            >
              <IconClose size={21} color={COLOR_PINK}/>
            </TouchableOpacity>
          )}

          {isAddComment && this.renderVisibility()}

          {isEditComment && (
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={this.updateComment}
            >
              <IconCheck size={21} color={COLOR_PINK}/>
            </TouchableOpacity>
          )}

        </View>


        <View style={styles.commentContainer}>

          <View style={styles.commentInputContainer}>
            <MultilineInput
              ref={(instance: ?MultilineInput) => instance && (this.editCommentInput = instance)}
              {...this.props}
              placeholder="Write comment, @mention people"
              value={commentText}
              editable={!isSaving}
              underlineColorAndroid="transparent"
              keyboardAppearance="dark"
              placeholderTextColor={COLOR_PLACEHOLDER}
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
              onFocus={() => this.setState({inputFocus: true})}
              onBlur={() => this.setState({inputFocus: false})}
              style={styles.commentInput}
            />

            {isAddComment && !isEditComment && this.renderSendButton()}
          </View>
        </View>
      </View>
    );
  }
}

/* @flow */
import {View, Text, ActivityIndicator, ScrollView, Image} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import React, {Component} from 'react';
import throttle from 'lodash.throttle';
import {COLOR_PLACEHOLDER} from '../../components/variables/variables';
import MultilineInput from '../../components/multiline-input/multiline-input';
import {closeOpaque, visibility, visibilityActive} from '../../components/icon/icon';
import Avatar from '../../components/avatar/avatar';
import type {IssueComment} from '../../flow/CustomFields';
import type {User} from '../../flow/User';

import styles from './single-issue__comments.styles';

type Props = {
  initialText: string,
  onChangeText?: (text: string) => any,
  onSubmitComment: (comment: IssueComment) => any,

  editingComment: IssueComment,
  onCancelEditing: Function,

  suggestionsAreLoading: boolean,
  onRequestCommentSuggestions: (query: string) => any,
  suggestions: ?{ users: Array<User> },

  onEditCommentVisibility: (commentId: string) => any,
  isSecured: boolean
};

type State = {
  isSaving: boolean,
  commentText: string,
  showSuggestions: boolean,
  suggestionsQuery: string,
  commentCaret: number
};

const UPDATE_TEXT_TIMEOUT = 300;

export default class SingleIssueCommentInput extends Component<Props, State> {
  isUnmounted: boolean;
  SUGGESTION_AVATAR_SIZE = 32;
  debouncedOnChange = throttle((text: string) => (
    this.props.onChangeText && this.props.onChangeText(text)
  ), UPDATE_TEXT_TIMEOUT);

  constructor() {
    super();
    this.state = {
      isSaving: false,
      commentText: '',

      isLoadingSuggestions: false,
      showSuggestions: false,
      suggestionsQuery: '',
      suggestedUsers: [],
      commentCaret: 0
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

  addComment() {
    let clearTimer;
    this.setState({isSaving: true});
    this.props.onSubmitComment({
      ...this.props.editingComment, ...{
        usesMarkdown: true,
        text: this.state.commentText
      }
    })
      .then(() => {
        clearTimeout(clearTimer);
        if (this.isUnmounted) {
          return;
        }
        clearTimer = setTimeout(() => !this.isUnmounted && this.setState({commentText: ''}), UPDATE_TEXT_TIMEOUT);
      })
      .finally(() => !this.isUnmounted && this.setState({isSaving: false}));
  }

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
        showSuggestions: false
      });
    }
  }

  renderSuggestions() {
    const {suggestions, suggestionsAreLoading} = this.props;
    if (!this.state.showSuggestions) {
      return;
    }

    return (
      <ScrollView style={styles.suggestionsContainer} keyboardShouldPersistTaps="handled">

        {suggestionsAreLoading &&
        <View style={styles.suggestionsLoadingMessage}>
          <Text style={styles.suggestionsLoadingMessageText}>Loading suggestions...</Text>
        </View>}

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
                <Text style={styles.suggestionName}>{user.fullName}</Text>
                <Text style={styles.suggestionLogin}> (@{user.login})</Text>
              </TouchableOpacity>
            );
          })
          : null}
      </ScrollView>
    );
  }

  render() {
    const {editingComment, onCancelEditing, onEditCommentVisibility, isSecured} = this.props;
    return (
      <View style={styles.commentContainer}>
        {this.renderSuggestions()}

        {editingComment && editingComment.id &&
        <View style={styles.commentEditContainer}>
          <View>
            <Text style={styles.commentEditTitle}>Edit comment</Text>
            <Text style={styles.commentEditText} numberOfLines={1}>{editingComment.text}</Text>
          </View>
          <TouchableOpacity onPress={onCancelEditing}>
            <Image
              style={styles.commentEditCloseIcon}
              source={closeOpaque}
            />
          </TouchableOpacity>
        </View>}

        <View style={styles.commentInputContainer}>
          <MultilineInput
            placeholder="Write comment, @mention people"
            value={this.state.commentText}
            editable={!this.state.isSaving}
            underlineColorAndroid="transparent"
            keyboardAppearance="dark"
            placeholderTextColor={COLOR_PLACEHOLDER}
            autoCapitalize="sentences"
            {...this.props}
            onSelectionChange={(event) => {
              const caret = event.nativeEvent.selection.start;
              this.setState({commentCaret: caret});
            }}
            onChangeText={(text) => {
              this.setState({commentText: text});
              this.suggestionsNeededDetector(text, this.state.commentCaret);
              this.debouncedOnChange(text);
            }}
            style={styles.commentInput}
          />

          <TouchableOpacity
            style={styles.visibilityChangeButton}
            disabled={this.state.isSaving}
            onPress={() => onEditCommentVisibility(editingComment)}
          >
            <Image
              source={isSecured ? visibilityActive : visibility}
              style={styles.visibilityChangeIcon}/>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commentSendButton}
            disabled={!this.state.commentText || this.state.isSaving}
            onPress={() => this.addComment()}>
            {!this.state.isSaving
              ? (<Text style={
                [styles.commentSendButtonText, this.state.commentText ? null : styles.commentSendButtonTextDisabled]}
              > Send </Text>)
              : <ActivityIndicator/>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

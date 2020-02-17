/* @flow */

import {View, Text, ActivityIndicator, ScrollView} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import React, {Component} from 'react';
import throttle from 'lodash.throttle';
import {
  COLOR_FONT_ON_BLACK,
  COLOR_ICON_LIGHT_BLUE,
  COLOR_ICON_MEDIUM_GREY,
  COLOR_PLACEHOLDER
} from '../../components/variables/variables';
import MultilineInput from '../../components/multiline-input/multiline-input';
import Avatar from '../../components/avatar/avatar';
import type {IssueComment} from '../../flow/CustomFields';
import type {User} from '../../flow/User';

import styles from './single-issue__comments.styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import IssueVisibility from '../../components/issue-visibility/issue-visibility';

type Props = {
  initialText: string,
  onChangeText?: (text: string) => any,
  onSubmitComment: (comment: IssueComment) => any,

  editingComment: IssueComment,

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
  SUGGESTION_AVATAR_SIZE = 24;
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

  updateComment() {
    let clearTimer;
    this.setState({isSaving: true});
    const comment = {
      ...this.props.editingComment,
      ...{
        usesMarkdown: true,
        text: this.state.commentText
      }
    };

    this.props.onSubmitComment(comment).then(() => {
      clearTimeout(clearTimer);
      if (this.isUnmounted) {
        return;
      }
      clearTimer = setTimeout(() => !this.isUnmounted && this.setState({commentText: ''}), UPDATE_TEXT_TIMEOUT);
    }).finally(() => {
      clearTimeout(clearTimer);
      if (!this.isUnmounted) {
        this.setState({isSaving: false});
      }
    });
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
      >
        {isSecured && (
          <IconMaterial
            style={styles.visibilityChangeButtonLockIcon}
            name="lock"
            size={16}
            color={COLOR_ICON_LIGHT_BLUE}
          />
        )}
        <Text style={styles.visibilityChangeButtonText}>
          {isSecured ? IssueVisibility.getVisibilityPresentation(editingComment.visibility) : 'Visible to All Users'}
        </Text>
        <Icon
          name="angle-down"
          size={20}
          color={COLOR_ICON_MEDIUM_GREY}
        />
      </TouchableOpacity>
    );
  }

  renderSendButton() {
    const {isSaving, commentText} = this.state;

    return (
      <TouchableOpacity
        style={styles.commentSendButton}
        disabled={!(commentText || '').trim() || isSaving}
        onPress={() => this.updateComment()}>
        {!this.state.isSaving
          ? (
            <IconMaterial
              name="arrow-up" size={22}
              color={COLOR_FONT_ON_BLACK}
            />
          )
          : <ActivityIndicator/>
        }
      </TouchableOpacity>
    );
  }

  render() {
    const {isSaving, commentText, commentCaret, showSuggestions} = this.state;

    return (
      <View style={styles.commentContainer}>
        {showSuggestions && this.renderSuggestions()}

        {!showSuggestions && this.renderVisibility()}

        <View style={styles.commentInputContainer}>
          <MultilineInput
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
            style={styles.commentInput}
          />

          {this.renderSendButton()}
        </View>
      </View>
    );
  }
}

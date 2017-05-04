/* @flow */
import {View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image} from 'react-native';
import React, {Component} from 'react';
import {COLOR_PLACEHOLDER} from '../../components/variables/variables';
import MultilineInput from '../../components/multiline-input/multiline-input';
import type {IssueUser} from '../../flow/CustomFields';

import styles from './single-issue.styles';

type Props = {
  initialText: string,
  onChangeText: (text: string) => any,
  onAddComment: (comment: string) => any,

  suggestionsAreLoading: boolean,
  onRequestCommentSuggestions: (query: string) => any,
  suggestions: ?{users: Array<IssueUser>}
};

type State = {
  isSaving: boolean,
  commentText: string,
  showSuggestions: boolean,
  suggestionsQuery: string,
  commentCaret: number
};

export default class IssueListCommentInput extends Component {
  props: Props;
  state: State;
  isUnmounted: boolean;

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

  componentDidMount() {
    this.setState({commentText: this.props.initialText});
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  addComment() {
    this.setState({isSaving: true});
    this.props.onAddComment(this.state.commentText)
      .then(() => {
        if (this.isUnmounted) {
          return;
        }
        this.setState({isSaving: false, commentText: ''});
      })
      .catch(() => this.setState({isSaving: false}));
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

  applySuggestion(user: IssueUser) {
    function replaceRange(source, start, end, substitute) {
      return source.substring(0, start) + substitute + source.substring(end);
    }

    const match = /[\S\@]+$/.exec(this.state.commentText.slice(0, this.state.commentCaret));
    const currentWord = match && match[0];

    if (currentWord) {
      const startIndex = this.state.commentText.slice(0, this.state.commentCaret).lastIndexOf(currentWord);
      const newText = replaceRange(this.state.commentText, startIndex, startIndex + currentWord.length, `@${user.login}`);
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
      <ScrollView style={styles.commentSuggestionsContainer} keyboardShouldPersistTaps="handled">

        {suggestionsAreLoading &&
          <View style={styles.suggestionsLoadingMessage}>
            <Text style={styles.suggestionsLoadingMessageText}>Loading suggestions...</Text>
          </View>}

        {suggestions
        ? suggestions.users.map(user => {
          return (
            <TouchableOpacity key={user.id}
                              style={styles.commentSuggestionButton}
                              onPress={() => this.applySuggestion(user)}>
              <Image source={{uri: user.avatarUrl}} style={styles.commentSuggestionAvatar}/>
              <Text style={styles.commentSuggestionName}>{user.fullName}</Text>
              <Text style={styles.commentSuggestionLogin}>  @{user.login}</Text>
            </TouchableOpacity>
          );
        })
        : null}
      </ScrollView>
    );
  }

  render() {
    return (
      <View>
        {this.renderSuggestions()}

        <View style={styles.commentInputWrapper}>
          <MultilineInput
            placeholder="Type your comment here"
            value={this.state.commentText}
            editable={!this.state.isSaving}
            underlineColorAndroid="transparent"
            keyboardAppearance="dark"
            placeholderTextColor={COLOR_PLACEHOLDER}
            autoCapitalize="sentences"
            {...this.props}
            onSelectionChange = {(event) => {
              const caret = event.nativeEvent.selection.start;
              this.setState({commentCaret: caret});
            }}
            onChangeText={(text) => {
              this.setState({commentText: text});
              this.suggestionsNeededDetector(text, this.state.commentCaret);
              this.props.onChangeText && this.props.onChangeText(text);
            }}
            style={styles.commentInput}
          />

          <TouchableOpacity style={styles.commentSendButton}
                            disabled={!this.state.commentText}
                            onPress={() => this.addComment()}>

            {!this.state.isSaving ?
              <Text style={[styles.sendComment, this.state.commentText ? null : styles.sendCommentDisabled]}>Send</Text> :
              <ActivityIndicator/>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

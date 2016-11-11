/* @flow */
import {View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image} from 'react-native';
import React, {Component} from 'react';
import MultilineInput from '../../components/multiline-input/multiline-input';

import styles from './single-issue.styles';

type Props = {
  initialText: string,
  onChangeText: (text: string) => any,
  onAddComment: (comment: string) => any,
  suggestionsDataSource: (query: string) => Promise<{users: Array<IssueUser>}>
};

type State = {
  isSaving: boolean,
  commentText: string,
  isLoadingSuggestions: boolean,
  showSuggestions: boolean,
  suggestionsQuery: string,
  suggestedUsers: Array<IssueUser>,
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

  loadSuggestions(query: string) {
    this.setState({isLoadingSuggestions: true});

    return this.props.suggestionsDataSource(query)
      .then(suggestions => this.setState({suggestedUsers: suggestions.users, isLoadingSuggestions: false}))
      .catch(() => this.setState({isLoadingSuggestions: false}));
  }

  suggestionsNeededDetector(text: string, caret: number) {
    const match = /[\S\@]+$/.exec(text.slice(0, caret));
    let currentWord = match && match[0];
    if (!currentWord) {
      return this.setState({
        showSuggestions: false,
        suggestedUsers: [],
        suggestionsQuery: ''
      });
    }

    if (currentWord[0] === '@') {
      currentWord = currentWord.slice(1);
      this.setState({
        showSuggestions: true,
        suggestionsQuery: currentWord
      });
      return this.loadSuggestions(currentWord);
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
        showSuggestions: false,
        suggestedUsers: []
      });
    }
  }

  renderSuggestions() {
    if (!this.state.showSuggestions) {
      return;
    }

    return (
      <ScrollView style={styles.commentSuggestionsContainer} keyboardShouldPersistTaps={true}>

        {this.state.isLoadingSuggestions &&
          <View style={styles.suggestionsLoadingMessage}><Text>Loading suggestions...</Text></View>}

        {this.state.suggestedUsers.map(user => {
          return (
            <TouchableOpacity key={user.id}
                              style={styles.commentSuggestionButton}
                              onPress={() => this.applySuggestion(user)}>
              <Image source={{uri: user.avatarUrl}} style={styles.commentSuggestionAvatar}/>
              <Text style={styles.commentSuggestionName}>{user.fullName}</Text>
              <Text style={styles.commentSuggestionLogin}>  @{user.login}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  render() {
    return (
      <View>
        {this.renderSuggestions()}

        <View style={styles.commentInputWrapper}>
          <MultilineInput placeholder="Type your comment here"
                          value={this.state.commentText}
                          editable={!this.state.isSaving}
                          underlineColorAndroid="transparent"
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
                          style={styles.commentInput}/>

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

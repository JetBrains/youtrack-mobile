import {View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image} from 'react-native';
import React from 'react';
import MultilineInput from '../../components/multiline-input/multiline-input';

import styles from './single-issue.styles';

export default class IssueListCommentInput extends React.Component {
  constructor() {
    super();
    this.state = {
      isSaving: false,
      commentText: '',

      showSuggestions: false,
      suggestionsQuery: '',
      suggestions: [],
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

  loadSuggestions(query) {
    return this.props.suggestionsDataSource(query)
      .then(suggestions => this.setState({suggestions: suggestions.users}));
  }

  suggestionsNeededDetector(text, caret) {
    const match = /[\S\@]+$/.exec(text.slice(0, caret));
    let currentWord = match && match[0];
    if (!currentWord) {
      return this.setState({
        showSuggestions: false,
        suggestions: [],
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

  applySuggestion(suggestion) {
    function replaceRange(source, start, end, substitute) {
      return source.substring(0, start) + substitute + source.substring(end);
    }

    const match = /[\S\@]+$/.exec(this.state.commentText.slice(0, this.state.commentCaret));
    const currentWord = match && match[0];

    if (currentWord) {
      const startIndex = this.state.commentText.slice(0, this.state.commentCaret).lastIndexOf(currentWord);
      const newText = replaceRange(this.state.commentText, startIndex, startIndex + currentWord.length, `@${suggestion.login}`);
      this.setState({
        commentText: newText,
        showSuggestions: false,
        suggestions: []
      });
    }
  }

  renderSuggestions() {
    if (!this.state.showSuggestions) {
      return;
    }

    return (
      <ScrollView style={styles.commentSuggestionsContainer} keyboardShouldPersistTaps={true}>

        {this.state.suggestions.map(suggestion => {
          return (
            <TouchableOpacity key={suggestion.id}
                              style={styles.commentSuggestionButton}
                              onPress={() => this.applySuggestion(suggestion)}>
              <Image source={{uri: suggestion.avatarUrl}} style={styles.commentSuggestionAvatar}/>
              <Text style={styles.commentSuggestionName}>{suggestion.fullName}</Text>
              <Text style={styles.commentSuggestionLogin}>  @{suggestion.login}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  render() {
    return <View style={styles.commentInputWrapper}>

      {this.renderSuggestions()}

      <MultilineInput placeholder="Type your comment here"
                      value={this.state.commentText}
                      editable={!this.state.isSaving}
                      {...this.props}
                      onSelectionChange = {(event) => {
                        const caret = event.nativeEvent.selection.start;
                        this.setState({commentCaret: caret});
                      }}
                      onChangeText={(text) => {
                        this.setState({commentText: text});
                        this.suggestionsNeededDetector(text, this.state.commentCaret);
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
    </View>;
  }
}

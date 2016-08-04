import {View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import React from 'react';
import MultilineInput from '../../components/multiline-input/multiline-input';

import styles from './single-issue.styles';

export default class IssueListCommentInput extends React.Component {
  constructor() {
    super();
    this.state = {
      isSaving: false,
      commentText: ''
    };
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

  render() {
    return <View style={styles.commentInputWrapper}>
      <MultilineInput placeholder="Type your comment here"
                      value={this.state.commentText}
                      editable={!this.state.isSaving}
                      {...this.props}
                      onChangeText={(text) => this.setState({commentText: text})}
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

import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import MultilineInput from '../../components/multiline-input/multiline-input';

import styles from './single-issue.styles';

export default class IssueListCommentInput extends React.Component {
  constructor() {
    super();
    this.state = {
      commentText: ''
    };
  }

  addComment() {
    this.props.onAddComment(this.state.commentText);
    this.setState({commentText: ''});
  }

  render() {
    return <View style={styles.commentInputWrapper}>
      <MultilineInput placeholder="Type your comment here"
                      value={this.state.commentText}
                      {...this.props}
                      onChangeText={(text) => this.setState({commentText: text})}
                      style={styles.commentInput}/>

      <TouchableOpacity style={styles.commentSendButton}
                        disabled={!this.state.commentText}
                        onPress={() => this.addComment()}>
        <Text style={[styles.sendComment, this.state.commentText ? null : styles.sendCommentDisabled]}>Send</Text>
      </TouchableOpacity>
    </View>;
  }
}

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
      <MultilineInput placeholder="Comment"
                      autoCorrect={false}
                      value={this.state.commentText}
                      onChangeText={(text) => this.setState({commentText: text})}
                      style={styles.commentInput}/>

      <TouchableOpacity style={styles.commentSendButton}
                        disabled={!this.state.commentText}
                        onPress={() => this.addComment()}>
        <Text>Send</Text>
      </TouchableOpacity>
    </View>;
  }
}

import React, {View, Text, TextInput, TouchableOpacity} from 'react-native';

import styles from './single-issue.styles';

export default class IssueListCommentInput extends React.Component {
  constructor() {
    super();
    this.state = {
      commentInputHeight: 36,
      commentText: ''
    };
  }

  addComment() {
    this.props.onAddComment(this.state.commentText);
    this.setState({commentText: ''});
  }

  onChange(e) {
    this.setState({
      commentText: e.nativeEvent.text,
      commentInputHeight: e.nativeEvent.contentSize.height}
    );
  }

  render() {
    return <View style={styles.commentInputWrapper}>
      <TextInput placeholder="Comment"
                 multiline={true}
                 onChange={(e) => this.onChange(e)}
                 autoCorrect={false}
                 value={this.state.commentText}
                 style={[styles.commentInput, {height: this.state.commentInputHeight}]}/>
      <TouchableOpacity style={styles.commentSendButton}
                        disabled={!this.state.commentText}
                        onPress={() => this.addComment()}>
        <Text>Send</Text>
      </TouchableOpacity>
    </View>;
  }
}

import React, {Text, View, Image, TextInput, TouchableOpacity, ScrollView} from 'react-native';

import ApiHelper from '../../components/api/api__helper';
import CustomField from '../../components/custom-field/custom-field';
import TextWithImages from '../../components/text-with-images/text-with-images';
import SingleIssueComments from './single-issue__comments';
import {Actions} from 'react-native-router-flux';
import {arrow} from '../../components/icon/icon';
import Header from '../../components/header/header';
import UserSelect from '../../components/user-select/user-select';
import styles from './single-issue.styles';


export default class SingeIssueView extends React.Component {
  constructor() {
    super();
    this.state = {issue: null};
  }

  componentDidMount() {
    this.loadIssue(this.props.issueId);
  }

  loadIssue(id) {
    //StatusBarIOS.setNetworkActivityIndicatorVisible(true);

    return this.props.api.getIssue(id)
      .then((issue) => ApiHelper.fillFieldHashOldRest(issue))
      .then((issue) => {
        console.log('Issue', issue);
        this.setState({issue});
        //StatusBarIOS.setNetworkActivityIndicatorVisible(false);
      })
      .catch((res) => {
        console.error(res);
      });
  }

  addComment(issue, comment) {
    return this.props.api.addComment(issue.id, comment)
      .then((res) => {
        console.info('Comment created', res);
        this.loadIssue(this.props.issueId)
      });
  }

  getAuthorForText(issue) {
    let forText = () => {
      if (issue.fieldHash.Assignee) {
        return `for ${issue.fieldHash.Assignee[0].fullName}`;
      }
      return '    Unassigned'
    };
    return `${issue.fieldHash.reporterFullName} ${forText()}`
  }

  _selectUser() {
    this.setState({displayUserSelect: !this.state.displayUserSelect});
  }

  _renderAttachments(attachments) {
    return (attachments || []).map((attach) => {
      return <TouchableOpacity underlayColor="#F8F8F8" onPress={() => {
                return Actions.ShowImage({imageUrl: attach.url, imageName: attach.value});
            }} key={attach.id}>
        <Image style={styles.attachment}
               capInsets={{left: 15, right: 15, bottom: 15, top: 15}}
               source={{uri: attach.url}}/>
      </TouchableOpacity>
    });
  }

  _renderIssueView(issue) {
    return (
      <View style={styles.issueViewContainer}>
        <Text style={styles.authorForText}>{this.getAuthorForText(issue)}</Text>
        <Text style={styles.summary}>{issue.fieldHash.summary}</Text>
        {issue.fieldHash.description && <View style={styles.description}>
          {TextWithImages.renderView(issue.fieldHash.description, issue.fieldHash.attachments)}
        </View>}

        {issue.fieldHash.attachments && <ScrollView contentInset={{top:0}}
                                                    automaticallyAdjustContentInsets={false}
                                                    style={styles.attachesContainer} horizontal={true}>
          {this._renderAttachments(issue.fieldHash.attachments)}
        </ScrollView>}
      </View>
    );
  }

  _renderFooter(issue) {
    let fieldsToDisplay = (issue.field || []).filter(field => field.name[0] === field.name[0].toUpperCase());

    return (<View>
      <ScrollView contentInset={{top:0}}
                  automaticallyAdjustContentInsets={false}
                  horizontal={true}
                  style={styles.footer}>
        {<TouchableOpacity underlayColor="#F8F8F8" style={styles.iconButton}
                           onPress={() => this._selectUser()}>
          <Image style={styles.footerIcon} source={arrow}/>
        </TouchableOpacity>}

        <CustomField key="Project" field={{name: 'Project', value: issue.fieldHash.projectShortName}}/>

        {fieldsToDisplay.map((field) => {
          return (<CustomField key={field.name} field={field}/>);
        })}
      </ScrollView>
    </View>);
  }

  render() {
    return (
      <View style={styles.container}>
        <Header leftButton={<Text>List</Text>}>
          <Text>{this.props.issueId}</Text>
        </Header>
        {this.state.issue && <ScrollView contentInset={{top:0}} automaticallyAdjustContentInsets={false}>
          {this._renderIssueView(this.state.issue)}
          <View style={styles.commentInputWrapper}>
            <TextInput placeholder="Comment"
                       returnKeyType="send"
                       autoCorrect={false}
                       value={this.state.commentText}
                       onSubmitEditing={(e) => this.addComment(this.state.issue, e.nativeEvent.text) && this.setState({commentText: null})}
                       style={styles.commentInput}/>
          </View>
          <SingleIssueComments issue={this.state.issue} api={this.props.api}/>
        </ScrollView>}
        {this.state.issue && this._renderFooter(this.state.issue)}

        {this.state.displayUserSelect &&
        <UserSelect title={`${this.props.issueId} ${this.state.issue.fieldHash.summary}`}></UserSelect>}
      </View>
    );
  }
}

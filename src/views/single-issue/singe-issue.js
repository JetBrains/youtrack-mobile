import React, {Text, View, Image, TouchableOpacity, ScrollView, TextInput} from 'react-native';

import ApiHelper from '../../components/api/api__helper';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import SingleIssueComments from './single-issue__comments';
import Router from '../../components/router/router';
import Header from '../../components/header/header';
import Wiki, {replaceImageNamesWithUrls} from '../../components/wiki/wiki';
import IssuePermissions from '../../components/issue-permissions/issue-permissions';
import SingleIssueCommentInput from './single-issue__comment-input';
import styles from './single-issue.styles';


export default class SingeIssueView extends React.Component {
  constructor(props) {
    super(props);
    this.issuePermissions = new IssuePermissions(this.props.api.auth.permissions, this.props.api.auth.currentUser);

    this.state = {
      issue: null,
      fullyLoaded: false,

      editMode: false,
      summaryCopy: null,
      descriptionCopy: null
    };
  }

  componentDidMount() {
    this.setState({issue: this.props.issuePlaceholder});
    this.loadIssue(this.props.issueId);
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  loadIssue(id) {
    //HACK about issue load by readable ID
    if (/[A-Z]/.test(id)) {
      return this.props.api.hackishGetIssueByIssueReadableId(id)
        .then((issue) => {
          issue.fieldHash = ApiHelper.makeFieldHash(issue);
          return issue;
        })
        .then((issue) => {
          console.log('Issue (by readable id)', issue);
          if (this.isUnmounted) {
            return;
          }
          this.setState({issue, fullyLoaded: true});
          return issue;
        })
    }

    return this.props.api.getIssue(id)
      .then((issue) => {
        issue.fieldHash = ApiHelper.makeFieldHash(issue);
        return issue;
      })
      .then((issue) => {
        console.log('Issue', issue);
        if (this.isUnmounted) {
          return;
        }
        this.setState({issue, fullyLoaded: true});
        return issue;
      })
      .catch((result) => {
        return result.json()
          .then(res => global.alert(res.error_description || res));
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
        return `for ${issue.fieldHash.Assignee.fullName || issue.fieldHash.Assignee.login}`;
      }
      return '    Unassigned'
    };
    return `${issue.reporter.fullName || issue.reporter.login} ${forText()}`
  }

  onIssueFieldValueUpdate(field, value) {
    const updateMethod = field.hasStateMachine ?
      this.props.api.updateIssueFieldEvent.bind(this.props.api) :
      this.props.api.updateIssueFieldValue.bind(this.props.api);

    return updateMethod(this.props.issueId, field.id, value)
      .then(() => this.loadIssue(this.props.issueId))
      .then((res) => this.props.onUpdate(res));
  }

  onSaveChanges() {
    this.state.issue.summary = this.state.summaryCopy;
    this.state.issue.description = this.state.descriptionCopy;
    this.setState({editMode: false});

    return this.props.api.updateIssueSummaryDescription(this.state.issue);
  }

  _renderHeader() {
    const title = <Text>{this.state.issue && (`${this.state.issue.project.shortName}-${this.state.issue.numberInProject}`)}</Text>;

    if (!this.state.editMode) {
      const rightButton = this.state.issue && this.issuePermissions.canUpdateGeneralInfo(this.state.issue) ? <Text>Edit</Text> : null;

      return <Header leftButton={<Text>Issues</Text>}
                     rightButton={rightButton}
                     onRightButtonClick={() => {
                      this.setState({
                        editMode: true,
                        summaryCopy: this.state.issue.summary,
                        descriptionCopy: this.state.issue.description
                      });
                     }}>
        {title}
      </Header>

    } else {

      return <Header leftButton={<Text>Cancel</Text>}
                     onBack={() => this.setState({editMode: false})}
                     rightButton={<Text>Save</Text>}
                     onRightButtonClick={() => this.onSaveChanges()}>
        {title}
      </Header>

    }
  }

  _renderAttachments(attachments) {
    if (!attachments) {
      return;
    }

    return <ScrollView style={styles.attachesContainer} horizontal={true}>
      {(attachments || []).map((attach) => {
        return <TouchableOpacity onPress={() => Router.ShowImage({imageUrl: attach.url, imageName: attach.value})} key={attach.id}>
          <Image style={styles.attachment}
                 capInsets={{left: 15, right: 15, bottom: 15, top: 15}}
                 source={{uri: attach.url}}/>
        </TouchableOpacity>
      })}
    </ScrollView>;
  }

  _renderIssueView(issue) {
    return (
      <View style={styles.issueViewContainer}>
        <Text style={styles.authorForText}>{this.getAuthorForText(issue)}</Text>

        {this.state.editMode && <View>
          <TextInput
            style={styles.summaryInput}
            placeholder="Summary"
            autoFocus={true}
            value={this.state.summaryCopy}
            onSubmitEditing={() => this.refs.description.focus()}
            onChangeText={text => this.setState({summaryCopy: text})}/>
          <View style={styles.separator}/>
          <TextInput
            ref="description"
            style={styles.descriptionInput}
            value={this.state.descriptionCopy}
            multiline={true}
            placeholder="Description"
            onChangeText={text => this.setState({descriptionCopy: text})}/>
        </View>}

        {!this.state.editMode && <View>
          <Text style={styles.summary}>{issue.summary}</Text>

          {issue.description && <Wiki style={styles.description}>
            {replaceImageNamesWithUrls(issue.description, issue.attachments)}
          </Wiki>}
        </View>}

        {this._renderAttachments(issue.attachments)}
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        {this._renderHeader()}

        {this.state.issue && <ScrollView>
          {this._renderIssueView(this.state.issue)}

          {!this.state.fullyLoaded && <View><Text style={styles.loading}>Loading...</Text></View>}

          {this.state.fullyLoaded && <View>
            {this.issuePermissions.canCommentOn(this.state.issue) && <SingleIssueCommentInput
              onAddComment={(comment) => this.addComment(this.state.issue, comment)}/>}
            <SingleIssueComments comments={this.state.issue.comments} attachments={this.state.issue.attachments} api={this.props.api}/>
          </View>}
        </ScrollView>}

        {this.state.issue && <CustomFieldsPanel
          api={this.props.api}
          issue={this.state.issue}
          issuePermissions={this.issuePermissions}
          onUpdate={this.onIssueFieldValueUpdate.bind(this)}/>}
      </View>
    );
  }
}

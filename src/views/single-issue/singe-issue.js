import {Text, View, Image, TouchableOpacity, ScrollView, TextInput} from 'react-native';
import React from 'react';

import ApiHelper from '../../components/api/api__helper';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import SingleIssueComments from './single-issue__comments';
import Router from '../../components/router/router';
import Header from '../../components/header/header';
import ColorField from '../../components/color-field/color-field';
import LinkedIssues from '../../components/linked-issues/linked-issues';
import Wiki, {decorateRawText} from '../../components/wiki/wiki';
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
        if (result.json) {
          return result.json()
            .then(res => global.alert(res.error_description || res));
        }
        console.warn('failed to load issue', result, result.message);
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
    field.value = value;
    this.forceUpdate();
    const updateMethod = field.hasStateMachine ?
      this.props.api.updateIssueFieldEvent.bind(this.props.api) :
      this.props.api.updateIssueFieldValue.bind(this.props.api);

    return updateMethod(this.props.issueId, field.id, value)
      .then(() => this.loadIssue(this.props.issueId))
      .then((res) => this.props.onUpdate && this.props.onUpdate(res))
      .catch((err) => {
        console.warn('failed to update issue field', err);
        return this.loadIssue(this.props.issueId);
      });
  }

  onUpdateProject(project) {
    this.state.issue.project = project;
    this.forceUpdate();

    return this.props.api.updateProject(this.state.issue, project)
      .catch((err) => {
        if (err.json) {
          return err.json()
            .then(res => console.warn('failed to update issue project', res));
        } else {
          console.warn('failed to update issue project', err);
        }
      })
      .then(() => this.loadIssue(this.props.issueId))
  }

  onSaveChanges() {
    this.state.issue.summary = this.state.summaryCopy;
    this.state.issue.description = this.state.descriptionCopy;
    this.setState({editMode: false});

    return this.props.api.updateIssueSummaryDescription(this.state.issue);
  }

  goToIssue(issue) {
    issue.fieldHash = ApiHelper.makeFieldHash(issue);

    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id,
      api: this.props.api
    });
  }

  goToIssueById(issueId) {
    Router.SingleIssue({
      issueId: issueId,
      api: this.props.api
    });
  }

  openIssueListWithSearch(query) {
    Router.IssueList({auth: this.props.api.auth, query: query});
  }

  _renderHeader() {
    const title = <Text>{this.state.issue && (`${this.state.issue.project.shortName}-${this.state.issue.numberInProject}`)}</Text>;

    if (!this.state.editMode) {
      const rightButton = this.state.issue && this.issuePermissions.canUpdateGeneralInfo(this.state.issue) ? <Text>Edit</Text> : null;

      return <Header leftButton={<Text>Back</Text>}
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
      const canSave = Boolean(this.state.summaryCopy);

      return <Header leftButton={<Text>Cancel</Text>}
                     onBack={() => this.setState({editMode: false})}
                     rightButton={<Text style={canSave ? null : styles.disabledSaveButton}>Save</Text>}
                     onRightButtonClick={() => canSave && this.onSaveChanges()}>
        {title}
      </Header>

    }
  }

  _renderAttachments(attachments) {
    if (!attachments) {
      return;
    }

    return <ScrollView style={styles.attachesContainer} horizontal={true}>
      {(attachments || [])
        .filter(attach => attach.mimeType.includes('image'))
        .map((attach) => {
        return <TouchableOpacity onPress={() => Router.ShowImage({imageUrl: attach.url, imageName: attach.value})} key={attach.id}>
          <Image style={styles.attachment}
                 capInsets={{left: 15, right: 15, bottom: 15, top: 15}}
                 source={{uri: attach.url}}/>
        </TouchableOpacity>
      })}
    </ScrollView>;
  }

  _renderTags(tags) {
    if (!tags || !tags.length) {
      return;
    }

    return <View style={styles.tagsContainer}>
      {tags.map(tag => {
        return <TouchableOpacity onPress={() => this.openIssueListWithSearch(tag.query)} key={tag.id} style={styles.tagButton}>
          <ColorField text={tag.name} color={tag.color} fullText={true} style={styles.tagColorField}/>
        </TouchableOpacity>
      })}
    </View>
  }

  _renderIssueView(issue) {
    return (
      <View style={styles.issueViewContainer}>
        {this._renderTags(issue.tags)}

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

          {issue.links && <LinkedIssues links={issue.links} onIssueTap={issue => this.goToIssue(issue)}/>}

          {issue.description && <Wiki style={styles.description} onIssueIdTap={issueId => this.goToIssueById(issueId)}>
            {decorateRawText(issue.description, issue.wikifiedDescription, issue.attachments)}
          </Wiki>}
        </View>}

        {this._renderAttachments(issue.attachments)}
      </View>
    );
  }

  render() {
    return (
      <View style={styles.container} ref="container">
        {this._renderHeader()}

        {this.state.issue && <ScrollView>
          {this._renderIssueView(this.state.issue)}

          {!this.state.fullyLoaded && <View><Text style={styles.loading}>Loading...</Text></View>}

          {this.state.fullyLoaded && <View>
            {this.issuePermissions.canCommentOn(this.state.issue) && <SingleIssueCommentInput
              onAddComment={(comment) => this.addComment(this.state.issue, comment)}/>}
            <SingleIssueComments
              comments={this.state.issue.comments}
              attachments={this.state.issue.attachments}
              api={this.props.api}
              onIssueIdTap={issueId => this.goToIssueById(issueId)}/>
          </View>}
        </ScrollView>}

        {this.state.issue && <CustomFieldsPanel
          containerViewGetter={() => this.refs.container}
          api={this.props.api}
          canEditProject={this.issuePermissions.canUpdateGeneralInfo(this.state.issue)}
          issue={this.state.issue}
          issuePermissions={this.issuePermissions}
          onUpdate={this.onIssueFieldValueUpdate.bind(this)}
          onUpdateProject={this.onUpdateProject.bind(this)}/>}
      </View>
    );
  }
}

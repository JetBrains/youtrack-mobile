import React, {Text, View, Image, TouchableOpacity, ScrollView, TextInput} from 'react-native';

import ApiHelper from '../../components/api/api__helper';
import CustomField from '../../components/custom-field/custom-field';
import TextWithImages from '../../components/text-with-images/text-with-images';
import SingleIssueComments from './single-issue__comments';
import Router from '../../components/router/router';
import Header from '../../components/header/header';
import Select from '../../components/select/select';
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
      descriptionCopy: null,

      select: {
        show: false,
        dataSource: null,
        onSelect: null,
        multi: false,
        selectedItems: []
      }
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

  _renderSelect() {
    const config = this.state.select;
    if (config.show) {
      return <Select
        title={`Select item`}
        api={this.props.api}
        dataSource={config.dataSource}
        onSelect={config.onSelect}
        multi={config.multi}
        selectedItems={config.selectedItems}
        emptyValue={config.emptyValue}
        onCancel={() => this.setState({select: {show: false}})}
        getTitle={(item) => item.fullName || item.name || item.login}
      />;
    }
  }

  editField(field) {
    this.setState({select: {show: false}});
    const isMultiValue = field.projectCustomField.field.fieldType.isMultiValue;
    let selectedItems = isMultiValue ? field.value : [field.value];
    selectedItems = selectedItems.filter(it => it !== null);

    this.setState({
      select: {
        show: true,
        dataSource: (query) => {
          if (field.hasStateMachine) {
            return this.props.api.getStateMachineEvents(this.props.issueId, field.id)
              .then(items => items.map(it => Object.assign(it, {name: `${it.id} (${it.presentation})`})))
          }
          return this.props.api.getCustomFieldValues(field.projectCustomField.bundle.id, field.projectCustomField.field.fieldType.valueType)
            .then(res => res.aggregatedUsers || res.values);
        },
        onSelect: (val) => {
          this.setState({select: {show: false}});

          const updateMethod = field.hasStateMachine ?
            this.props.api.updateIssueFieldEvent.bind(this.props.api) :
            this.props.api.updateIssueFieldValue.bind(this.props.api);

          return updateMethod(this.props.issueId, field.id, val)
            .then(() => this.loadIssue(this.props.issueId))
            .then((res) => this.props.onUpdate(res));
        },
        multi: isMultiValue,
        selectedItems: selectedItems,
        emptyValue: field.projectCustomField.canBeEmpty ? field.projectCustomField.emptyFieldText : null
      }
    });
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

          {issue.description && <View style={styles.description}>
            {TextWithImages.renderView(issue.description, issue.attachments)}
          </View>}
        </View>}

        {this._renderAttachments(issue.attachments)}
      </View>
    );
  }

  _renderFooter(issue) {
    return (<View>
      <ScrollView horizontal={true} style={styles.footer}>
        <CustomField key="Project"
                     disabled={true}
                     field={{projectCustomField: {field: {name: 'Project'}}, value: {name: issue.project.shortName}}}/>

        {issue.fields.map((field) => {
          return (<CustomField
            key={field.id}
            field={field}
            onPress={() => this.editField(field)}
            disabled={!this.issuePermissions.canUpdateField(issue, field)}/>);
        })}
      </ScrollView>
    </View>);
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

        {this.state.issue && this._renderFooter(this.state.issue)}

        {this._renderSelect()}
      </View>
    );
  }
}

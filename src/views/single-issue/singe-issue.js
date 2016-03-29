import React, {Text, View, Image, TextInput, TouchableOpacity, ScrollView} from 'react-native';

import ApiHelper from '../../components/api/api__helper';
import CustomField from '../../components/custom-field/custom-field';
import TextWithImages from '../../components/text-with-images/text-with-images';
import SingleIssueComments from './single-issue__comments';
import {Actions} from 'react-native-router-flux';
import Header from '../../components/header/header';
import Select from '../../components/select/select';
import styles from './single-issue.styles';


export default class SingeIssueView extends React.Component {
  constructor() {
    super();
    this.state = {
      issue: null,

      select: {
        show: false,
        dataSource: null,
        onSelect: null
      }
    };
  }

  componentDidMount() {
    this.loadIssue(this.props.issueId);
  }

  loadIssue(id) {
    //StatusBarIOS.setNetworkActivityIndicatorVisible(true);

    return this.props.api.getIssue(id)
      .then((issue) => {
        issue.fieldHash = ApiHelper.makeFieldHash(issue);
        return issue;
      })
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
        return `for ${issue.fieldHash.Assignee.login || issue.fieldHash.Assignee.name}`;
      }
      return '    Unassigned'
    };
    return `${issue.reporter.name || issue.reporter.login} ${forText()}`
  }

  _renderSelect() {
    const config = this.state.select;
    if (config.show) {
      return <Select
        title={`Select item`}
        dataSource={config.dataSource}
        onSelect={config.onSelect}
        onCancel={() => this.setState({select: {show: false}})}
        getTitle={(item) => item.name || item.login}
      />;
    }
  }

  editField(field) {
    this.setState({select: {show: false}});

    this.setState({
      select: {
        show: true,
        dataSource: (query) => {
          return this.props.api.getCustomFieldValues(field.projectCustomField.bundle.id, field.projectCustomField.field.fieldType.valueType)
            .then(res => res.aggregatedUsers || res.values);
        },
        onSelect: (val) => {
          this.setState({select: {show: false}});

          return this.props.api.updateIssueFieldValue(this.props.issueId, field.id, val)
            .then(() => this.loadIssue(this.props.issueId));
        }
      }
    });
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
        <Text style={styles.summary}>{issue.summary}</Text>
        {issue.description && <View style={styles.description}>
          {TextWithImages.renderView(issue.description, issue.attachments)}
        </View>}

        {issue.attachments && <ScrollView contentInset={{top:0}}
                                                    automaticallyAdjustContentInsets={false}
                                                    style={styles.attachesContainer} horizontal={true}>
          {this._renderAttachments(issue.attachments)}
        </ScrollView>}
      </View>
    );
  }

  _renderFooter(issue) {
    return (<View>
      <ScrollView horizontal={true} style={styles.footer}>
        <CustomField key="Project" field={{projectCustomField: {field: {name: 'Project'}}, value: {name: issue.project.shortName}}}/>

        {issue.fields.map((field) => {
          return (<CustomField key={field.id} field={field} onPress={() => this.editField(field)}/>);
        })}
      </ScrollView>
    </View>);
  }

  render() {
    return (
      <View style={styles.container}>
        <Header leftButton={<Text>List</Text>}>
          <Text>{this.state.issue && (`${this.state.issue.project.shortName}-${this.state.issue.numberInProject}`)}</Text>
        </Header>
        {this.state.issue && <ScrollView>
          {this._renderIssueView(this.state.issue)}
          <View style={styles.commentInputWrapper}>
            <TextInput placeholder="Comment"
                       returnKeyType="send"
                       autoCorrect={false}
                       value={this.state.commentText}
                       onSubmitEditing={(e) => this.addComment(this.state.issue, e.nativeEvent.text) && this.setState({commentText: null})}
                       style={styles.commentInput}/>
          </View>
          <SingleIssueComments comments={this.state.issue.comments} attachments={this.state.issue.attachments} api={this.props.api}/>
        </ScrollView>}
        {this.state.issue && this._renderFooter(this.state.issue)}

        {this._renderSelect()}
      </View>
    );
  }
}

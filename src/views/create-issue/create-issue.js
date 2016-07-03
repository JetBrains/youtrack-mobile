import {ScrollView, View, Text, TextInput, TouchableOpacity, Image, AsyncStorage, ActivityIndicator} from 'react-native';
import React from 'react';

import styles from './create-issue.styles';
import issueStyles from '../single-issue/single-issue.styles';
import Header from '../../components/header/header';
import {notifyError} from '../../components/notification/notification';
import {UIImagePickerManager} from 'NativeModules';
import Router from '../../components/router/router';
import {attach, tag, next} from '../../components/icon/icon';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';

const PROJECT_ID_STORAGE_KEY = 'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE';
const FILE_NAME_REGEXP = /(?=\w+\.\w{3,4}$).+/ig;

export default class CreateIssue extends React.Component {
  constructor() {
    super();
    this.state = {
      processing: false,
      attachingImage: null,

      issue: {
        summary: null,
        description: null,
        attachments: [],
        fields: [],
        project: {
          id: null,
          shortName: 'Not selected'
        }
      }
    };

    AsyncStorage.getItem(PROJECT_ID_STORAGE_KEY)
      .then(projectId => {
        if (projectId) {
          this.state.issue.project.id = projectId;
          this.updateIssueDraft();
        }
      });
  }

  updateIssueDraft(projectOnly = false) {
    let issueToSend = this.state.issue;
    if (projectOnly) {
      issueToSend = {id: this.state.issue.id, project: this.state.issue.project};
    }

    return this.props.api.updateIssueDraft(issueToSend)
      .then(issue => {
        this.state.issue = issue;
        this.forceUpdate();
      })
      .catch(err => notifyError('Cannot create issue', err));
  }

  createIssue() {
    this.setState({processing: true});

    return this.updateIssueDraft()
      .then(() => this.props.api.createIssue(this.state.issue))
      .then(res => {
        this.setState({processing: false});
        console.info('Issue created', res);
        this.props.onCreate(res);
        Router.pop();
      })
      .catch(err => {
        this.setState({processing: false});
        return notifyError('Cannot create issue', err);
      });
  }

  attachPhoto(takeFromLibrary = true) {
    const method = takeFromLibrary ? 'launchImageLibrary' : 'launchCamera';

    UIImagePickerManager[method]({}, (res) => {
      if (res.didCancel) {
        return;
      }
      if (res.error) {
        return notifyError('ImagePicker Error: ', res.error);
      }
      this.state.issue.attachments.push(res);
      this.forceUpdate();

      const filePath = res.path || res.uri;
      const fileName = filePath.match(FILE_NAME_REGEXP)[0];
      const fileUri = res.uri;

      this.setState({attachingImage: res});
      this.props.api.attachFile(this.state.issue.id, fileUri, fileName)
        .then(() => this.setState({attachingImage: null}))
        .catch((err) => {
          this.state.issue.attachments = this.state.issue.attachments.filter(attach => attach !== res);
          this.setState({attachingImage: null});

          return notifyError('Cannot attach file', err);
        });
    });
  }

  onUpdateProject(project) {
    this.state.issue.project = project;
    this.forceUpdate();

    AsyncStorage.setItem(PROJECT_ID_STORAGE_KEY, project.id);
    return this.updateIssueDraft(project.id);
  }

  onSetFieldValue(field, value) {
    this.state.issue.fields = this.state.issue.fields.slice().map(f => {
      if (f === field) {
        f.value = value;
      }
      return f;
    });

    this.forceUpdate();
    return this.updateIssueDraft();
  }

  _renderAttahes() {
    return this.state.issue.attachments.map(img => {
      return (
        <TouchableOpacity
          key={img.uri}
          onPress={() => Router.ShowImage({imageUrl: img.uri, imageName: img.uri})}
        >
          <Image style={issueStyles.attachmentImage}
                 source={{uri: img.uri}}/>
          {this.state.attachingImage === img && <ActivityIndicator size="large" style={styles.imageActivityIndicator}/>}
        </TouchableOpacity>
      );
    });
  }

  render() {
    const canCreateIssue = this.state.issue.summary && this.state.issue.project.id && !this.state.processing && !this.state.attachingImage;

    const createButton = <Text style={canCreateIssue ? null : styles.disabledCreateButton}>Create</Text>;

    return (
      <View style={styles.container} ref="container">
        <ScrollView>
          <Header leftButton={<Text>Cancel</Text>}
                  rightButton={createButton}
                  onRightButtonClick={() => canCreateIssue && this.createIssue()}>
            <Text>New Issue</Text>
          </Header>
          <View>
            <View>
              <TextInput
                style={styles.summaryInput}
                editable={!this.state.processing}
                placeholder="Summary"
                returnKeyType="next"
                onSubmitEditing={() => this.refs.description.focus()}
                onChangeText={(summary) => {
                  this.state.issue.summary = summary;
                  this.forceUpdate();
                }}/>
            </View>
            <View style={styles.separator}/>
            <View>
              <TextInput
                ref="description"
                editable={!this.state.processing}
                style={styles.descriptionInput}
                multiline={true}
                placeholder="Description"
                onChangeText={(description) => {
                  this.state.issue.description = description;
                  this.forceUpdate();
                }}/>
            </View>
            <View style={styles.attachesContainer}>
              <View>
                {this.state.issue.attachments.length > 0 && <ScrollView style={issueStyles.attachesContainer} horizontal={true}>
                  {this._renderAttahes(this.state.issue.attachments)}
                </ScrollView>}
              </View>
              <View style={styles.attachButtonsContainer}>
                <TouchableOpacity
                  disabled={this.state.attachingImage !== null}
                  style={styles.attachButton}
                  onPress={() => this.attachPhoto(true)}>
                  <Image style={styles.attachIcon} source={attach}/>
                  <Text style={styles.attachButtonText}>Attach file from library...</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={this.state.attachingImage !== null}
                  style={styles.attachButton}
                  onPress={() => this.attachPhoto(false)}>
                  <Text style={styles.attachButtonText}>Take a picture...</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.separator}/>
            {false && <View style={styles.actionContainer}>
              <Image style={styles.actionIcon} source={tag}/>
              <View style={styles.actionContent}>
                <Text>Add tag</Text>
                <Image style={styles.arrowImage} source={next}></Image>
              </View>
            </View>}
          </View>
        </ScrollView>

        <CustomFieldsPanel
          api={this.props.api}
          issue={this.state.issue}
          containerViewGetter={() => this.refs.container}
          canEditProject={true}
          issuePermissions={{canUpdateField: () => true}}
          onUpdate={this.onSetFieldValue.bind(this)}
          onUpdateProject={this.onUpdateProject.bind(this)}/>
      </View>
    );
  }
}

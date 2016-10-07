import {ScrollView, View, Text, TextInput, TouchableOpacity, Image, AsyncStorage, ActivityIndicator} from 'react-native';
import React from 'react';

import styles from './create-issue.styles';
import issueStyles from '../single-issue/single-issue.styles';
import Header from '../../components/header/header';
import {notifyError} from '../../components/notification/notification';
import usage from '../../components/usage/usage';
import ImagePicker from 'react-native-image-picker';
import Router from '../../components/router/router';
import log from '../../components/log/log';
import {attach, tag, next} from '../../components/icon/icon';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';

const PROJECT_ID_STORAGE_KEY = 'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE';
const DRAFT_ID_STORAGE_KEY = 'DRAFT_ID_STORAGE_KEY';
const FILE_NAME_REGEXP = /(?=\w+\.\w{3,4}$).+/ig;
const CATEGORY_NAME = 'Create issue view';

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

    usage.trackScreenView('Create issue');

    AsyncStorage.getItem(DRAFT_ID_STORAGE_KEY)
      .then(draftId => {
        if (draftId) {
          return this.loadIssueFromDraft(draftId);
        }
        return this.loadStoredProject();
      });
  }

  loadStoredProject() {
    return AsyncStorage.getItem(PROJECT_ID_STORAGE_KEY)
      .then(projectId => {
        if (projectId) {
          this.state.issue.project.id = projectId;
          return this.updateIssueDraft();
        }
      });
  }

  loadIssueFromDraft(draftId) {
    return this.props.api.loadIssueDraft(draftId)
      .then(issue => {
        this.state.issue = issue;
        this.forceUpdate();
      })
      .catch(() => this.loadStoredProject());
  }

  updateIssueDraft(projectOnly = false) {
    let issueToSend = this.state.issue;
    if (!issueToSend.project || !issueToSend.project.id) {
      return;
    }

    if (projectOnly) {
      issueToSend = {id: this.state.issue.id, project: this.state.issue.project};
    }

    return this.props.api.updateIssueDraft(issueToSend)
      .then(issue => {
        this.state.issue = issue;
        this.forceUpdate();
        return AsyncStorage.setItem(DRAFT_ID_STORAGE_KEY, issue.id);
      })
      .catch(err => notifyError('Cannot create issue', err));
  }

  createIssue() {
    this.setState({processing: true});

    return this.updateIssueDraft()
      .then(() => this.props.api.createIssue(this.state.issue))
      .then(res => {
        this.setState({processing: false});
        log.info('Issue created', res);
        usage.trackEvent(CATEGORY_NAME, 'Issue created', 'Success');
        this.props.onCreate(res);
        Router.pop();
        return AsyncStorage.removeItem(DRAFT_ID_STORAGE_KEY);
      })
      .catch(err => {
        this.setState({processing: false});
        usage.trackEvent(CATEGORY_NAME, 'Issue created', 'Error');
        return notifyError('Cannot create issue', err);
      });
  }

  attachPhoto(takeFromLibrary = true) {
    const method = takeFromLibrary ? 'launchImageLibrary' : 'launchCamera';

    ImagePicker[method]({}, (res) => {
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
        .then(() => {
          usage.trackEvent(CATEGORY_NAME, 'Attach image', 'Success');
          return this.setState({attachingImage: null});
        })
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

    usage.trackEvent(CATEGORY_NAME, 'Change project');
    return this.updateIssueDraft(project.id)
      .then(() => AsyncStorage.setItem(PROJECT_ID_STORAGE_KEY, project.id));
  }

  onSetFieldValue(field, value) {
    this.state.issue.fields = this.state.issue.fields.slice().map(f => {
      if (f === field) {
        f.value = value;
      }
      return f;
    });

    this.forceUpdate();
    usage.trackEvent(CATEGORY_NAME, 'Change field value');
    return this.updateIssueDraft();
  }

  _showImageAttachment(currentImage, allAttachments) {
    const allImagesUrls = allAttachments
      .map(image => image.uri);
    return Router.ShowImage({currentImage: currentImage.uri, allImagesUrls});
  }

  _renderAttahes() {
    return this.state.issue.attachments.map(img => {
      return (
        <TouchableOpacity
          key={img.uri}
          onPress={() => this._showImageAttachment(img, this.state.issue.attachments)}
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
      <View style={styles.container}>
        <ScrollView>
          <Header leftButton={<Text>Cancel</Text>}
                  onBack={() => {
                    this.updateIssueDraft();
                    Router.pop();
                  }}
                  rightButton={createButton}
                  onRightButtonClick={() => canCreateIssue && this.createIssue()}>
            <Text style={issueStyles.headerText}>New Issue</Text>
          </Header>
          <View>
            <View>
              <TextInput
                style={styles.summaryInput}
                editable={!this.state.processing}
                placeholder="Summary"
                underlineColorAndroid="transparent"
                returnKeyType="next"
                autoCapitalize="sentences"
                value={this.state.issue.summary}
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
                autoCapitalize="sentences"
                style={styles.descriptionInput}
                multiline={true}
                underlineColorAndroid="transparent"
                placeholder="Description"
                value={this.state.issue.description}
                onChangeText={(description) => {
                  this.state.issue.description = description;
                  this.forceUpdate();
                }}/>
            </View>
            {this.state.issue.project.id && <View style={styles.attachesContainer}>
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
                  <Image style={styles.attachIcon} source={attach} resizeMode="contain"/>
                  <Text style={styles.attachButtonText}>Choose from library...</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={this.state.attachingImage !== null}
                  style={styles.attachButton}
                  onPress={() => this.attachPhoto(false)}>
                  <Text style={styles.attachButtonText}>Take a picture...</Text>
                </TouchableOpacity>
              </View>
            </View>}
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
          canEditProject={true}
          issuePermissions={{canUpdateField: () => true}}
          onUpdate={this.onSetFieldValue.bind(this)}
          onUpdateProject={this.onUpdateProject.bind(this)}/>
      </View>
    );
  }
}

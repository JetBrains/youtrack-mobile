import {ScrollView, View, Text, TextInput, TouchableOpacity, Image, AsyncStorage} from 'react-native';
import React from 'react';

import styles from './create-issue.styles';
import issueStyles from '../single-issue/single-issue.styles';
import Header from '../../components/header/header';
import {UIImagePickerManager} from 'NativeModules';
import Router from '../../components/router/router';
import {attach, tag, next} from '../../components/icon/icon';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import ApiHelper from '../../components/api/api__helper';

const PROJECT_ID_STORAGE_KEY = 'YT_DEFAULT_CREATE_PROJECT_ID_STORAGE';

export default class CreateIssue extends React.Component {
  constructor() {
    super();
    this.state = {
      summary: null,
      description: null,
      attachments: [],
      fields: [],
      project: {
        id: null,
        shortName: 'Not selected'
      }
    };

    AsyncStorage.getItem(PROJECT_ID_STORAGE_KEY)
      .then(projectId => {
        if (projectId) {
          return this.loadProjectFields(projectId)
        }
      });
  }

  createIssue() {
    function prepareFieldValue(value) {
      if (Array.isArray(value)) {
        return value.map(prepareFieldValue);
      }

      return {id: value.id};
    }

    const issueToCreate = {
      summary: this.state.summary,
      description: this.state.description,
      project: {
        id: this.state.project.id
      },
      fields: this.state.fields.filter(f => f.value).map(f => {
        return {
          $type: ApiHelper.projectFieldTypeToFieldType(f.projectCustomField.$type, f.projectCustomField.field.fieldType.isMultiValue),
          id: f.id,
          value: prepareFieldValue(f.value)
        };
      })
    };

    this.props.api.createIssue(issueToCreate)
      .then(res => {
        console.info('Issue created', res);
        this.props.onCreate(res);
        Router.pop();
      })
      .catch(err => {
        console.warn('Cannot create issue', issueToCreate, 'server response:', err);
      });
  }

  attachPhoto(takeFromLibrary = true) {
    const method = takeFromLibrary ? 'launchImageLibrary' : 'launchCamera';

    UIImagePickerManager[method]({}, (res) => {
      if (res.didCancel) {
        return;
      }
      this.state.attachments.push(res);
      this.forceUpdate();
    });
  }

  loadProjectFields(projectId) {
    return this.props.api.getProject(projectId)
      .then(project => {
        const fields = project.fields.map(it => {
          const isMultivalue = it.field.fieldType.isMultiValue;
          const firstDefaultValue = it.defaultValues && it.defaultValues[0];
          return {id: it.id, projectCustomField: it, value: isMultivalue ? it.defaultValues : firstDefaultValue};
        })
          .sort((fieldA, fieldB) => fieldA.projectCustomField.field.ordinal - fieldB.projectCustomField.field.ordinal);

        this.setState({project, fields: fields, select: {show: false}});
      });
  }

  onUpdateProject(project) {
    this.setState({project});
    AsyncStorage.setItem(PROJECT_ID_STORAGE_KEY, project.id);
    return this.loadProjectFields(project.id);
  }

  onSetFieldValue(field, value) {
    const updatedFields = this.state.fields.slice().map(f => {
      if (f === field) {
        f.value = value;
      }
      return f;
    });
    this.setState({fields: updatedFields});
  }

  _renderAttahes() {
    return this.state.attachments.map(img => {
      return (
        <TouchableOpacity
          key={img.uri}
          onPress={() => Router.ShowImage({imageUrl: img.uri, imageName: img.path})}
        >
          <Image style={issueStyles.attachment}
                 source={{uri: img.uri}}/>
        </TouchableOpacity>
      );
    });
  }

  render() {
    const canCreateIssue = this.state.summary && this.state.project.id;

    return (
      <View style={styles.container} ref="container">
        <ScrollView>
          <Header leftButton={<Text>Cancel</Text>}
                  rightButton={<Text style={canCreateIssue ? null : styles.disabledCreateButton}>Create</Text>}
                  onRightButtonClick={() => canCreateIssue && this.createIssue()}>
            <Text>New Issue</Text>
          </Header>
          <View>
            <View>
              <TextInput
                style={styles.summaryInput}
                placeholder="Summary"
                returnKeyType="next"
                onSubmitEditing={() => this.refs.description.focus()}
                onChangeText={(summary) => this.setState({summary})}/>
            </View>
            <View style={styles.separator}/>
            <View>
              <TextInput
                ref="description"
                style={styles.descriptionInput}
                multiline={true}
                placeholder="Description"
                onChangeText={(description) => this.setState({description})}/>
            </View>
            {false/*TODO: turn on when attachments could work*/ && <View style={styles.attachesContainer}>
              <View>
                {this.state.attachments.length > 0 && <ScrollView style={issueStyles.attachesContainer} horizontal={true}>
                  {this._renderAttahes(this.state.attachments)}
                </ScrollView>}
              </View>
              <View style={styles.attachButtonsContainer}>
                <TouchableOpacity
                  style={styles.attachButton}
                  onPress={() => this.attachPhoto(true)}>
                  <Image style={styles.attachIcon} source={attach}/>
                  <Text style={styles.attachButtonText}>Attach file from library...</Text>
                </TouchableOpacity>

                <TouchableOpacity
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
          issue={this.state}
          containerViewGetter={() => this.refs.container}
          canEditProject={true}
          issuePermissions={{canUpdateField: () => true}}
          onUpdate={this.onSetFieldValue.bind(this)}
          onUpdateProject={this.onUpdateProject.bind(this)}/>
      </View>
    );
  }
}

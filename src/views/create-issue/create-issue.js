import React, {ScrollView, View, Text, TextInput, TouchableOpacity, Image, AsyncStorage} from 'react-native'
import styles from './create-issue.styles';
import issueStyles from '../single-issue/single-issue.styles';
import Header from '../../components/header/header';
import {UIImagePickerManager} from 'NativeModules';
import {Actions} from 'react-native-router-flux';
import {attach, tag, next} from '../../components/icon/icon';
import CustomField from '../../components/custom-field/custom-field';
import Select from '../../components/select/select';
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
        name: 'Not selected'
      },

      select: {
        show: false,
        dataSource: null,
        onSelect: null
      }
    }

    AsyncStorage.getItem(PROJECT_ID_STORAGE_KEY)
      .then(projectId => {
        if (projectId) {
          return this.loadProjectFields(projectId)
        }
      });
  }

  createIssue() {
    //TODO: convert attachements to multipart/form-data format properly
    function prepareFieldValue(value) {
      if (Array.isArray(value)) {
        return value.map(prepareFieldValue);
      }

      return {id: value.id};
    }

    this.props.api.createIssue({
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
      })
      .then(res => {
        console.info('Issue created', res);
        this.props.onCreate(res);
        Actions.pop();
      })
      .catch(err => {
        console.warn('Cannot create issue', err);
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
          return {id: it.id, projectCustomField: it, value: it.defaultValues && it.defaultValues[0]}
        });
        this.setState({project, fields: fields, select: {show: false}});
      });
  }

  selectProject() {
    this.setState({
      select: {
        show: true,
        dataSource: this.props.api.getProjects.bind(this.props.api),
        onSelect: (project) => {
          this.loadProjectFields(project.id);
          return AsyncStorage.setItem(PROJECT_ID_STORAGE_KEY, project.id);
        }
      }
    });
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
          const updatedFields = this.state.fields.slice().map(f => {
            if (f === field) {
              f.value = val;
            }
            return f;
          })
          this.setState({
            select: {show: false},
            fields: updatedFields
          });
        }
      }
    });
  }

  _renderAttahes() {
    return this.state.attachments.map(img => {
      return (
        <TouchableOpacity
          key={img.uri}
          onPress={() => Actions.ShowImage({imageUrl: img.uri, imageName: img.path})}
        >
          <Image style={issueStyles.attachment}
                 source={{uri: img.uri}}/>
        </TouchableOpacity>
      );
    });
  }

  _renderFooter(issue) {
    return (<View>
      <ScrollView contentInset={{top:0}}
                  automaticallyAdjustContentInsets={false}
                  horizontal={true}
                  style={issueStyles.footer}>

        <CustomField
          key="Project"
          field={{projectCustomField: {field: {name: 'Project'}}, value: this.state.project}}
          onPress={this.selectProject.bind(this)}/>

        {this.state.fields.map((field) => {
          return (<CustomField key={field.id} field={field} onPress={() => this.editField(field)}/>);
        })}
      </ScrollView>
    </View>);
  }

  _renderSelect() {
    const config = this.state.select;
    if (config.show) {
      return <Select
        title={`Select item`}
        api={this.props.api}
        dataSource={config.dataSource}
        onSelect={config.onSelect}
        onCancel={() => this.setState({select: {show: false}})}
        getTitle={(item) => item.name || item.login}
      />;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Header leftButton={<Text>Cancel</Text>}
                  rightButton={<Text>Create</Text>}
                  onRightButtonClick={this.createIssue.bind(this)}>
            <Text>New Issue</Text>
          </Header>
          <View>
            <View>
              <TextInput
                autoFocus={true}
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
            <View style={styles.attachesContainer}>
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
        {this._renderFooter(this.state)}

        {this._renderSelect()}
      </View>
    );
  }
}

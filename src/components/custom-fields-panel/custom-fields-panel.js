/* @flow */
import {View, ScrollView, Text, TouchableOpacity, TextInput, ActivityIndicator, Platform} from 'react-native';
import React, {Component} from 'react';
import CalendarPicker from 'react-native-calendar-picker/CalendarPicker/CalendarPicker';
import CustomField from '../custom-field/custom-field';
import Select from '../select/select';
import Header from '../header/header';
import {COLOR_PINK, COLOR_PLACEHOLDER, COLOR_BLACK} from '../../components/variables/variables';
import Api from '../api/api';
import IssuePermissions from '../issue-permissions/issue-permissions';
import styles from './custom-fields-panel.styles';
import Modal from 'react-native-root-modal';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import type {IssueFull} from '../../flow/Issue';
import type {IssueProject} from '../../flow/CustomFields';
import {View as AnimatedView} from 'react-native-animatable';

type Props = {
  api: Api,
  autoFocusSelect?: boolean,
  issue: IssueFull,
  issuePermissions: IssuePermissions,
  onUpdate: (field: CustomField) => Promise<Object>,
  onUpdateProject: (project: IssueProject) => Promise<Object>,
  canEditProject: boolean
};

type State = {
  editingField: ?CustomField,
  savingField: ?CustomField,
  isEditingProject: boolean,
  isSavingProject: boolean,
  keyboardOpen: boolean,

  select: {
    show: boolean,
    dataSource: (query: string) => Promise<Array<Object>>,
    onSelect: (item: any) => any,
    onChangeSelection?: (selectedItems: Array<Object>) => any,
    multi: boolean,
    emptyValue?: ?string,
    selectedItems: Array<Object>,
    placeholder?: string,
    getValue?: (item: Object) => string,
    getTitle?: (item: Object) => string
  },

  datePicker: {
    show: boolean,
    title: string,
    value: Date,
    onSelect: (selected: any) => any
  },

  simpleValue: {
    show: boolean,
    value: ?string,
    placeholder: string,
    onApply: () => any
  }
}

const initialEditorsState = {
  select: {
    show: false,
    dataSource: () => Promise.resolve([]),
    onChangeSelection: items => {},
    onSelect: () => {},
    multi: false,
    selectedItems: []
  },

  datePicker: {
    show: false,
    title: '',
    value: new Date(),
    onSelect: () => {
    }
  },

  simpleValue: {
    show: false,
    value: null,
    placeholder: '',
    onApply: () => {}
  }
};

export default class CustomFieldsPanel extends Component {
  props: Props;
  state: State;
  currentScrollX: number = 0;

  constructor() {
    super();

    this.state = {
      topCoord: 0,
      height: 0,
      editingField: null,
      savingField: null,
      keyboardOpen: false,
      isEditingProject: false,
      isSavingProject: false,
      ...initialEditorsState
    };
  }

  saveUpdatedField(field: CustomField, value: null|number|Object|Array<Object>) {
    this.closeEditor();
    this.setState({savingField: field});

    return this.props.onUpdate(field, value)
      .then(res => {
        this.setState({savingField: null});
        return res;
      })
      .catch(() => this.setState({savingField: null}));
  }

  onSelectProject() {
    if (this.state.isEditingProject) {
      return this.closeEditor();
    }
    const {issuePermissions} = this.props;

    this.closeEditor();
    this.setState({
      isEditingProject: true,
      select: {
        show: true,
        getValue: project => project.name + project.shortName,
        dataSource: async query => {
          const projects = await this.props.api.getProjects(query);
          return projects.filter(project => issuePermissions.canCreateIssueToProject(project));
        },
        multi: false,
        placeholder: 'Search for the project',
        selectedItems: [this.props.issue.project],
        onSelect: (project: IssueProject) => {
          this.closeEditor();
          this.setState({isSavingProject: true});
          return this.props.onUpdateProject(project)
            .then(() => this.setState({isSavingProject: false}));
        }
      }
    });
  }

  closeEditor() {
    return new Promise(resolve => {
      this.setState({
        editingField: null,
        isEditingProject: false,
        ...initialEditorsState
      }, resolve);
    });
  }

  onApplyCurrentMultiSelection = () => {
    this.saveUpdatedField(this.state.editingField, this.state.select.selectedItems);
  }

  editDateField(field: CustomField) {
    return this.setState({
      datePicker: {
        show: true,
        title: field.projectCustomField.field.name,
        value: field.value ? new Date(field.value) : new Date(),
        emptyValueName: field.projectCustomField.canBeEmpty ? field.projectCustomField.emptyFieldText : null,
        onSelect: (date) => this.saveUpdatedField(field, date ? date.getTime() : null)
      }
    });
  }

  editSimpleValueField(field: CustomField, type: string) {
    const placeholders = {
      integer: '-12 or 34',
      string: 'Type value',
      default: '1w 1d 1h 1m'
    };

    const valueFormatters = {
      integer: value => parseInt(value),
      float: value => parseFloat(value),
      string: value => value,
      default: value => ({presentation: value})
    };

    const placeholder = placeholders[type] || placeholders.default;
    const valueFormatter = valueFormatters[type] || valueFormatters.default;

    const value = field.value ? (field.value.presentation || field.value.toString()) : null;

    return this.setState({
      simpleValue: {
        show: true,
        placeholder,
        value,
        onApply: (value) => this.saveUpdatedField(field, valueFormatter(value))
      }
    });
  }

  editCustomField(field: CustomField) {
    const isMultiValue = field.projectCustomField.field.fieldType.isMultiValue;
    let selectedItems;
    if (isMultiValue) {
      selectedItems = field.value;
    } else {
      selectedItems = field.value ? [field.value] : [];
    }

    return this.setState({
      select: {
        show: true,
        multi: isMultiValue,
        selectedItems: selectedItems,
        emptyValue: field.projectCustomField.canBeEmpty ? field.projectCustomField.emptyFieldText : null,
        placeholder: 'Search for the field value',
        dataSource: (query) => {
          if (field.hasStateMachine) {
            return this.props.api.getStateMachineEvents(this.props.issue.id, field.id)
              .then(items => items.map(it => Object.assign(it, {name: `${it.id} (${it.presentation})`})));
          }
          return this.props.api.getCustomFieldValues(field.projectCustomField.bundle.id, field.projectCustomField.field.fieldType.valueType);
        },
        onChangeSelection: selectedItems => this.setState({select: {...this.state.select, selectedItems}}),
        onSelect: (value) => this.saveUpdatedField(field, value)
      }
    });
  }

  onEditField(field: CustomField) {
    if (field === this.state.editingField) {
      return this.closeEditor();
    }

    this.setState({editingField: field, isEditingProject: false, ...initialEditorsState});

    if (field.projectCustomField.field.fieldType.valueType === 'date') {
      return this.editDateField(field);
    }

    if (['period', 'integer', 'string', 'float'].indexOf(field.projectCustomField.field.fieldType.valueType) !== -1) {
      return this.editSimpleValueField(field, field.projectCustomField.field.fieldType.valueType);
    }

    return this.editCustomField(field);
  }

  handleKeyboardToggle = (keyboardOpen: boolean) => {
    this.setState({keyboardOpen});
  }

  storeScrollPosition = (event: Object) => {
    const {nativeEvent} = event;
    this.currentScrollX = nativeEvent.contentOffset.x;
  }

  restoreScrollPosition = (scrollNode: ?ScrollView, ensure: boolean = true) => {
    if (!scrollNode) {
      return;
    }

    scrollNode.scrollTo({x: this.currentScrollX, y: 0, animated: false});

    // Android doesn't get first scrollTo call https://youtrack.jetbrains.com/issue/YTM-402
    if (Platform.OS == 'android' && ensure) {
      setTimeout(() => this.restoreScrollPosition(scrollNode, false));
    }
  }

  _renderSelect() {
    if (!this.state.select.show) {
      return;
    }

    return <Select
      {...this.state.select}
      autoFocus={this.props.autoFocusSelect}
      onCancel={() => this.closeEditor()}
      getTitle={(item) => item.fullName || item.name || item.login}
    />;
  }

  _renderDatePicker() {
    if (!this.state.datePicker.show) {
      return;
    }

    return (
      <View>
        <Header
          leftButton={<Text>Cancel</Text>}
          rightButton={<Text></Text>}
          onBack={() => {
            this.closeEditor();
          }}>
          <Text>{this.state.datePicker.title}</Text>
        </Header>
        <View style={styles.calendar}>
          {this.state.datePicker.emptyValueName &&
          <TouchableOpacity onPress={() => this.state.datePicker.onSelect(null)}>
            <Text style={styles.clearDate}>{this.state.datePicker.emptyValueName} (Clear value)</Text>
          </TouchableOpacity>}

          <CalendarPicker
            selectedDate={this.state.datePicker.value}
            startFromMonday={true}
            weekdays={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
            onDateChange={date => {
              if (this.state.datePicker.value.getMonth() !== date.getMonth()) {
                this.state.datePicker.value = date;
                return this.setState({datePicker: this.state.datePicker});
              }
              return this.state.datePicker.onSelect(date);
            }}
            selectedDayColor={COLOR_PINK}
            selectedDayTextColor="#FFF"/>
        </View>
      </View>
    );
  }

  _renderSimpleValueInput() {
    if (!this.state.simpleValue.show || !this.state.editingField) {
      return;
    }

    return (
      <View>
        <Header
          leftButton={<Text>Cancel</Text>}
          onBack={() => {
            this.closeEditor();
          }}>
          <Text>{this.state.editingField.projectCustomField.field.name}</Text>
        </Header>
        <View>
          <TextInput
            keyboardAppearance="dark"
            autoFocus
            placeholderTextColor={COLOR_PLACEHOLDER}
            style={styles.simpleValueInput}
            placeholder={this.state.simpleValue.placeholder}
            underlineColorAndroid="transparent"
            clearButtonMode="always"
            returnKeyType="done"
            autoCorrect={false}
            autoFocus={true}
            autoCapitalize="none"
            onChangeText={(value) => {
              this.setState({simpleValue: {...this.state.simpleValue, value}});
            }}
            onSubmitEditing={() => this.state.simpleValue.onApply(this.state.simpleValue.value)}
            value={this.state.simpleValue.value}/>
        </View>
      </View>
    );
  }

  render() {
    const {issue, issuePermissions, canEditProject} = this.props;
    const {savingField, editingField, isEditingProject, isSavingProject, keyboardOpen} = this.state;

    const isEditorShown = this.state.select.show || this.state.datePicker.show || this.state.simpleValue.show;

    const ContainerComponent = isEditorShown ? Modal : View;
    const containerProps = isEditorShown ? {
      visible: true,
      style: [styles.modal, isEditorShown ? {top: 0} : null]
    } : {
      style: styles.placeholder
    };

    return (
      <ContainerComponent {...containerProps}>
        <AnimatedView
          animation="fadeIn"
          duration={500}
          useNativeDriver
          style={styles.editorViewContainer}
        >
          {this._renderSelect()}

          {this._renderDatePicker()}

          {this._renderSimpleValueInput()}
        </AnimatedView>

        <View>
          <ScrollView
            ref={this.restoreScrollPosition}
            onScroll={this.storeScrollPosition}
            scrollEventThrottle={100}
            horizontal={true}
            style={styles.customFieldsPanel}
            keyboardShouldPersistTaps="always"
          >
            <View key="Project">
              <CustomField disabled={!canEditProject}
                          onPress={() => this.onSelectProject()}
                          active={isEditingProject}
                          field={{projectCustomField: {field: {name: 'Project'}}, value: {name: issue.project.shortName}}}/>
              {isSavingProject && <ActivityIndicator style={styles.savingFieldIndicator}/>}
            </View>

            {issue.fields.map((field) => {
              return <View key={field.id}>
                <CustomField
                  field={field}
                  onPress={() => this.onEditField(field)}
                  active={editingField === field}
                  disabled={!issuePermissions.canUpdateField(issue, field)}/>

                {savingField && savingField.id === field.id && <ActivityIndicator style={styles.savingFieldIndicator}/>}
              </View>;
            })}
          </ScrollView>

          {this.state.select.show && this.state.select.multi && !keyboardOpen &&
          <TouchableOpacity
            style={styles.doneButton}
            onPress={this.onApplyCurrentMultiSelection}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>}

          {Platform.OS == 'ios' && <KeyboardSpacer style={{backgroundColor: COLOR_BLACK}}/>}

          <KeyboardSpacer onToggle={this.handleKeyboardToggle} style={{height: 0}}/>

        </View>
      </ContainerComponent>
    );
  }
}

/* @flow */
import {View, ScrollView, Text, TouchableOpacity, TextInput, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import {Calendar} from 'react-native-calendars'; // eslint-disable-line import/named
import CustomField from '../custom-field/custom-field';
import Select from '../select/select';
import Header from '../header/header';
import {COLOR_PINK, COLOR_PLACEHOLDER} from '../variables/variables';
import Api from '../api/api';
import IssuePermissions from '../issue-permissions/issue-permissions';
import {SkeletonIssueCustomFields} from '../../views/single-issue/issue__skeleton';
import styles, {calendarTheme} from './custom-fields-panel.styles';
import ModalView from '../modal-view/modal-view';
import type {IssueFull} from '../../flow/Issue';
import type {IssueProject, CustomField as CustomFieldType} from '../../flow/CustomFields';
import {View as AnimatedView} from 'react-native-animatable';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import {IconClose} from '../icon/icon';

type Props = {
  api: Api,
  autoFocusSelect?: boolean,
  issue: IssueFull,
  issuePermissions: IssuePermissions,
  onUpdate: (field: CustomFieldType, value: null | number | Object | Array<Object>) => Promise<Object>,
  onUpdateProject: (project: IssueProject) => Promise<Object>,
  canEditProject: boolean,
  style?: ViewStyleProp
};

type State = {
  editingField: ?CustomFieldType,
  savingField: ?CustomFieldType,
  isEditingProject: boolean,
  isSavingProject: boolean,

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
    withTime: boolean,
    time: ?string,
    value: Date,
    emptyValueName?: ?string,
    onSelect: (selected: any) => any
  },

  simpleValue: {
    show: boolean,
    value: string,
    placeholder: string,
    onApply: any => any
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
    time: null,
    withTime: false,
    value: new Date(),
    onSelect: () => {
    }
  },

  simpleValue: {
    show: false,
    value: '',
    placeholder: '',
    onApply: () => {}
  }
};

const MAX_PROJECT_NAME_LENGTH = 20;
const DATE_AND_TIME = 'date and time';

export default class CustomFieldsPanel extends Component<Props, State> {
  currentScrollX: number = 0;
  isComponentMounted: ?boolean;

  constructor() {
    super();

    this.state = {
      topCoord: 0,
      height: 0,
      editingField: null,
      savingField: null,
      isEditingProject: false,
      isSavingProject: false,
      ...initialEditorsState
    };
  }

  componentDidMount(): void {
    this.isComponentMounted = true;
  }

  componentWillUnmount(): void {
    this.isComponentMounted = null;
  }

  saveUpdatedField(field: CustomFieldType, value: null | number | Object | Array<Object>) {
    const updateSavingState = (value) => this.isComponentMounted && this.setState({savingField: value});
    this.closeEditor();
    updateSavingState(field);

    return this.props.onUpdate(field, value)
      .then(res => {
        updateSavingState(null);
        return res;
      })
      .catch(() => updateSavingState(null));
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

          return projects
            .filter(project => !project.archived)
            .filter(project => issuePermissions.canCreateIssueToProject(project));
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

  closeEditor(): Promise<any> {
    return new Promise(resolve => {
      this.setState({
        editingField: null,
        isEditingProject: false,
        ...initialEditorsState
      }, resolve);
    });
  }

  editDateField(field: CustomFieldType) {
    const withTime = field.projectCustomField.field.fieldType.valueType === DATE_AND_TIME;
    return this.setState({
      datePicker: {
        show: true,
        withTime,
        time: field.value ? new Date(field.value).toLocaleTimeString([],
          {
            hour: '2-digit',
            minute: '2-digit'
          }) : null,
        title: field.projectCustomField.field.name,
        value: field.value ? new Date(field.value) : new Date(),
        emptyValueName: field.projectCustomField.canBeEmpty ? field.projectCustomField.emptyFieldText : null,
        onSelect: (date) => {
          if (!date) {
            return this.saveUpdatedField(field, null);
          }
          if (withTime && this.state.datePicker.time) {
            try {
              const match = this.state.datePicker.time.match(/(\d\d):(\d\d)/);
              if (match) {
                const [, hours = 3, minutes = 0] = match;
                date.setHours(hours, minutes);
              }
            } catch (e) {
              throw new Error(`Invalid date: ${e}`);
            }
          }

          this.saveUpdatedField(field, date.getTime());
        }
      }
    });
  }

  editSimpleValueField(field: CustomFieldType, type: string) {
    const placeholders = {
      integer: '-12 or 34',
      string: 'Type value',
      text: 'Type text value',
      float: 'Type float value',
      default: '1w 1d 1h 1m'
    };

    const valueFormatters = {
      integer: value => parseInt(value),
      float: value => parseFloat(value),
      string: value => value,
      text: value => ({text: value}),
      default: value => ({presentation: value})
    };

    const placeholder = placeholders[type] || placeholders.default;
    const valueFormatter = valueFormatters[type] || valueFormatters.default;

    const value = field.value
      ? field.value.presentation || field.value.text || field.value.toString()
      : '';

    return this.setState({
      simpleValue: {
        show: true,
        placeholder,
        value,
        onApply: (value) => this.saveUpdatedField(field, valueFormatter(value))
      }
    });
  }

  editCustomField(field: CustomFieldType) {
    const projectCustomField = field.projectCustomField;
    const isMultiValue = projectCustomField.field.fieldType.isMultiValue;
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
        emptyValue: projectCustomField.canBeEmpty ? projectCustomField.emptyFieldText : null,
        placeholder: 'Search for the field value',
        dataSource: () => {
          if (field.hasStateMachine) {
            return this.props.api.getStateMachineEvents(this.props.issue.id, field.id)
              .then(items => items.map(it => Object.assign(it, {name: `${it.id} (${it.presentation})`})));
          }
          return this.props.api.getCustomFieldValues(
            projectCustomField?.bundle?.id,
            projectCustomField.field.fieldType.valueType
          );
        },
        onChangeSelection: selectedItems => this.setState({
          select: {
            ...this.state.select,
            selectedItems
          }
        }),
        onSelect: (value) => this.saveUpdatedField(field, value)
      }
    });
  }

  onEditField(field: CustomFieldType) {
    if (field === this.state.editingField) {
      return this.closeEditor();
    }
    const {fieldType} = field.projectCustomField.field;

    this.setState({
      editingField: field,
      isEditingProject: false, ...initialEditorsState
    });

    if (fieldType.valueType === 'date' || fieldType.valueType === DATE_AND_TIME) {
      return this.editDateField(field);
    }

    if (['period', 'integer', 'string', 'text', 'float'].indexOf(fieldType.valueType) !== -1) {
      return this.editSimpleValueField(field, fieldType.valueType);
    }

    return this.editCustomField(field);
  }

  storeScrollPosition = (event: Object) => {
    const {nativeEvent} = event;
    this.currentScrollX = nativeEvent.contentOffset.x;
  };

  restoreScrollPosition = (scrollNode: ?ScrollView, ensure: boolean = true) => {
    if (!scrollNode || !this.currentScrollX) {
      return;
    }

    scrollNode.scrollTo({
      x: this.currentScrollX,
      y: 0,
      animated: false
    });

    // Android doesn't get first scrollTo call https://youtrack.jetbrains.com/issue/YTM-402
    // iOS doesn't scroll immediately since 0.48 https://github.com/facebook/react-native/issues/15808
    if (ensure) {
      setTimeout(() => this.restoreScrollPosition(scrollNode, false));
    }
  };

  _renderSelect() {
    return <Select
      {...this.state.select}
      autoFocus={this.props.autoFocusSelect}
      onCancel={() => this.closeEditor()}
    />;
  }

  renderHeader(title: string) {
    return (
      <Header
        style={styles.customFieldEditorHeader}
        rightButton={<IconClose size={21} color={COLOR_PINK}/>}
        onRightButtonClick={() => this.closeEditor()}
        title={title}
      />
    );
  }

  _renderDatePicker() {
    const {datePicker} = this.state;

    return (
      <ModalView
        animationType="slide"
      >
        {this.renderHeader(datePicker.title)}

        <View style={styles.customFieldDateEditor}>

          <View style={styles.customFieldDateEditorValue}>
            {datePicker.emptyValueName &&
            <TouchableOpacity onPress={() => datePicker.onSelect(null)}>
              <Text style={styles.clearDate}>{datePicker.emptyValueName} (Clear value)</Text>
            </TouchableOpacity>}
          </View>

          {datePicker.withTime && (
            <TextInput
              placeholderTextColor={COLOR_PLACEHOLDER}
              style={styles.simpleValueInput}
              placeholder="13:00"
              underlineColorAndroid="transparent"
              clearButtonMode="always"
              autoCorrect={false}
              autoCapitalize="none"
              value={datePicker.time}
              onSubmitEditing={() => {
                datePicker.onSelect(datePicker.value);
                this.closeEditor();
              }}
              onChangeText={text => {
                this.setState({
                  datePicker: {
                    ...datePicker,
                    time: text
                  }
                });
              }}
            />
          )}

          <Calendar
            style={styles.customFieldDateEditorCalendar}
            current={datePicker.value}
            selected={[datePicker.value]}
            onDayPress={day => {
              return datePicker.onSelect(new Date(day.timestamp));
            }}
            firstDay={1}
            theme={calendarTheme}
          />
        </View>
      </ModalView>
    );
  }

  _renderSimpleValueInput() {
    const {simpleValue, editingField} = this.state;

    return (
      <ModalView
        animationType="slide"
      >
        {this.renderHeader(editingField?.projectCustomField?.field?.name || '')}

        <View style={styles.customFieldSimpleEditor}>
          <TextInput
            placeholderTextColor={COLOR_PLACEHOLDER}
            style={styles.simpleValueInput}
            placeholder={simpleValue.placeholder}
            underlineColorAndroid="transparent"
            clearButtonMode="always"
            returnKeyType="done"
            autoCorrect={false}
            autoFocus={true}
            autoCapitalize="none"
            onChangeText={(value) => {
              this.setState({
                simpleValue: {
                  ...this.state.simpleValue,
                  value
                }
              });
            }}
            onSubmitEditing={() => simpleValue.onApply(simpleValue.value)}
            value={simpleValue.value}/>
        </View>
      </ModalView>

    );
  }

  renderFields() {
    const {issue, issuePermissions, canEditProject} = this.props;
    const {savingField, editingField, isEditingProject, isSavingProject} = this.state;
    const projectName: string = issue?.project?.name || '';
    const trimmedProjectName = projectName.length > MAX_PROJECT_NAME_LENGTH
      ? `${projectName.substring(0, MAX_PROJECT_NAME_LENGTH - 3)}…`
      : projectName;
    const projectFakeField = {
      projectCustomField: {field: {name: 'Project'}},
      value: {name: trimmedProjectName}
    };

    const hasFields: boolean = !!issue?.fields;

    return (
      <View>

        {!hasFields && <View style={styles.customFieldsPanel}>
          <SkeletonIssueCustomFields/>
        </View>}

        {hasFields && <ScrollView
          ref={this.restoreScrollPosition}
          onScroll={this.storeScrollPosition}
          contentOffset={{
            x: this.currentScrollX,
            y: 0
          }}
          scrollEventThrottle={100}
          horizontal={true}
          style={styles.customFieldsPanel}
          keyboardShouldPersistTaps="always"
        >
          <View key="Project">
            <CustomField
              disabled={!canEditProject}
              onPress={() => this.onSelectProject()}
              active={isEditingProject}
              field={projectFakeField}
            />
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
        </ScrollView>}

        <View style={styles.bottomBorder}/>
      </View>
    );
  }

  render() {
    const {select, datePicker, simpleValue, editingField} = this.state;

    return (
      <View
        style={[styles.container, this.props.style]}
      >

        {this.renderFields()}

        <AnimatedView
          style={styles.editorViewContainer}
          animation="fadeIn"
          duration={500}
          useNativeDriver
        >
          {select.show && this._renderSelect()}
          {datePicker.show && this._renderDatePicker()}
          {(simpleValue.show && !!editingField) && this._renderSimpleValueInput()}
        </AnimatedView>

      </View>
    );
  }
}

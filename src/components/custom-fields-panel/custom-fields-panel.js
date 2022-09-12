/* @flow */

import React, {Component} from 'react';
import {View, ActivityIndicator} from 'react-native';

import {ScrollView} from 'react-native-gesture-handler';
import {View as AnimatedView} from 'react-native-animatable';

import Api from '../api/api';
import CustomField from '../custom-field/custom-field';
import DatePickerField from './custom-fields-panel__date-picker';
import Header from '../header/header';
import ModalPortal from '../modal-view/modal-portal';
import ModalView from '../modal-view/modal-view';
import SimpleValueEditor from './custom-fields-panel__simple-value';
import usage from '../usage/usage';
import {createNullProjectCustomField} from 'util/util';
import {getApi} from '../api/api__instance';
import {formatTime} from '../date/date';
import {i18n} from 'components/i18n/i18n';
import {IconCheck, IconClose} from '../icon/icon';
import {isSplitView} from '../responsive/responsive-helper';
import {IssueContext} from '../../views/issue/issue-context';
import {PanelWithSeparator} from '../panel/panel-with-separator';
import {Select, SelectModal} from '../select/select';
import {SkeletonIssueCustomFields} from '../skeleton/skeleton';

import styles, {calendarTheme} from './custom-fields-panel.styles';

import type {IssueProject, CustomField as IssueCustomField} from 'flow/CustomFields';
import type {Node} from 'react';
import type {UITheme} from 'flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  autoFocusSelect?: boolean,
  style?: ViewStyleProp,

  issueId: string,
  issueProject: IssueProject,
  fields: Array<IssueCustomField>,

  hasPermission: {
    canUpdateField?: (field: IssueCustomField) => boolean,
    canCreateIssueToProject: (project: IssueProject) => boolean,
    canEditProject: boolean
  },

  onUpdate: (field: IssueCustomField, value: null | number | Object | Array<Object>) => Promise<Object>,
  onUpdateProject: (project: IssueProject) => Promise<Object>,

  uiTheme: UITheme,

  analyticsId?: string,
  testID?: string,

  modal?: boolean,
};

type State = {
  editingField: ?IssueCustomField,
  savingField: ?IssueCustomField,
  isEditingProject: boolean,
  isSavingProject: boolean,
  height: number,
  topCoord: number,

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
    time: string | null,
    value: Date,
    emptyValueName?: ?string,
    onSelect: (date: Date, time: string) => any,
    placeholder: string,
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
    selectedItems: [],
  },

  datePicker: {
    show: false,
    title: '',
    time: null,
    withTime: false,
    value: new Date(),
    onSelect: () => {},
    placeholder: '',
  },

  simpleValue: {
    show: false,
    value: '',
    placeholder: '',
    onApply: () => {},
  },
};

const DATE_AND_TIME_FIELD_VALUE_TYPE = 'date and time';
const getProjectLabel = () => i18n('Project');


export default class CustomFieldsPanel extends Component<Props, State> {
  api: Api = getApi();
  currentScrollX: number = 0;
  isComponentMounted: ?boolean;
  isConnected: ?boolean;

  constructor() {
    super();

    this.closeEditor = this.closeEditor.bind(this);

    this.state = {
      topCoord: 0,
      height: 0,
      editingField: null,
      savingField: null,
      isEditingProject: false,
      isSavingProject: false,
      ...initialEditorsState,
    };
  }

  componentDidMount(): void {
    this.isComponentMounted = true;
  }

  componentWillUnmount(): void {
    this.isComponentMounted = null;
  }

  shouldComponentUpdate(nextProps: Props, prevState: State): boolean {
    return (
      this.props.uiTheme !== nextProps.uiTheme ||
      this.props.fields !== nextProps.fields ||
      this.state !== prevState
    );
  }

  trackEvent: ((message: string) => void) = (message: string) => {
    if (this.props.analyticsId) {
      usage.trackEvent(this.props.analyticsId, message);
    }
  }

  saveUpdatedField(field: IssueCustomField, value: null | number | Object | Array<Object>): Promise<boolean> {
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

  onSelectProject: (() => void | Promise<any>) = () => {
    this.trackEvent('Update project: start');
    if (this.state.isEditingProject) {
      return this.closeEditor();
    }

    const {hasPermission} = this.props;

    this.closeEditor();
    this.setState({
      isEditingProject: true,
      select: {
        show: true,
        getValue: project => project.name + project.shortName,
        dataSource: async query => {
          const projects = await this.api.getProjects(query);

          return projects
            .filter(project => !project.archived && !project.template)
            .filter(project => hasPermission.canCreateIssueToProject(project));
        },
        multi: false,
        placeholder: i18n('Search for the project'),
        selectedItems: [this.props.issueProject],
        onSelect: (project: IssueProject) => {
          this.trackEvent('Update project: updated');
          this.closeEditor();
          this.setState({isSavingProject: true});
          return this.props.onUpdateProject(project).then(() => this.setState({isSavingProject: false}));
        },
      },
    });
  };

  closeEditor(): Promise<any> {
    return new Promise(resolve => {
      this.setState({
        editingField: null,
        isEditingProject: false,
        ...initialEditorsState,
      }, resolve);
    });
  }

  editDateField(field: IssueCustomField): void {
    this.trackEvent('Edit date field');
    const withTime = field.projectCustomField.field.fieldType.valueType === DATE_AND_TIME_FIELD_VALUE_TYPE;
    return this.setState({
      datePicker: {
        show: true,
        placeholder: i18n('Enter time value'),
        withTime,
        time: field.value ? formatTime(new Date(field.value)) : null,
        title: field.projectCustomField.field.name,
        value: field.value ? new Date(field.value) : new Date(),
        emptyValueName: field.projectCustomField.canBeEmpty ? field.projectCustomField.emptyFieldText : null,
        onSelect: (date: Date, time?: string) => {
          if (!date) {
            return this.saveUpdatedField(field, null);
          }
          if (withTime && time) {
            try {
              const match = time.match(/(\d\d):(\d\d)/);
              if (match) {
                const [, hours = 3, minutes = 0] = match;
                date.setHours(hours, minutes);
              }
            } catch (e) {
              throw new Error(`Invalid date: ${e}`);
            }
          }

          this.saveUpdatedField(field, date.getTime());
        },
      },
    });
  }

  editSimpleValueField(field: IssueCustomField, type: string): void {
    this.trackEvent('Edit simple value field');
    const placeholders = {
      integer: '-12 or 34',
      string: 'Type value',
      text: 'Type text value',
      float: 'Type float value',
      default: '1w 1d 1h 1m',
    };

    const valueFormatters = {
      integer: value => parseInt(value),
      float: value => parseFloat(value),
      string: value => value,
      text: value => ({text: value}),
      default: value => ({presentation: value}),
    };

    const placeholder = placeholders[type] || placeholders.default;
    const valueFormatter = valueFormatters[type] || valueFormatters.default;

    const value: string = field.value != null
      ? field.value?.presentation || field.value.text || `${((field.value: any): string)}`
      : '';

    return this.setState({
      simpleValue: {
        show: true,
        placeholder,
        value,
        onApply: (value) => this.saveUpdatedField(field, valueFormatter(value)),
      },
    });
  }

  editCustomField(field: IssueCustomField) {
    const projectCustomField = field.projectCustomField;
    const projectCustomFieldName: ?string = projectCustomField?.field?.name;
    this.trackEvent(`Edit custom field: ${projectCustomFieldName ? projectCustomFieldName.toLowerCase() : ''}`);

    const isMultiValue = projectCustomField.field.fieldType.isMultiValue;
    let selectedItems: Array<string>;

    if (isMultiValue) {
      selectedItems = ((field.value: any): Array<string>);
    } else {
      selectedItems = field.value ? [((field.value: any): string)] : [];
    }

    this.setState({
      select: {
        show: true,
        multi: isMultiValue,
        selectedItems: selectedItems,
        emptyValue: projectCustomField.canBeEmpty ? projectCustomField.emptyFieldText : null,
        dataSource: () => {
          if (field.hasStateMachine) {
            return this.api.getStateMachineEvents(this.props.issueId, field.id)
              .then(items => items.map(it => Object.assign(it, {name: `${it.id} (${it.presentation})`})));
          }
          return this.api.getCustomFieldValues(
            projectCustomField?.bundle?.id,
            projectCustomField.field.fieldType.valueType
          );
        },
        onChangeSelection: selectedItems => this.setState({
          select: {
            ...this.state.select,
            selectedItems,
          },
        }),
        onSelect: (value) => this.saveUpdatedField(field, value),
      },
    });
  }

  onEditField: ((field: IssueCustomField) => ?Promise<any>) = (field: IssueCustomField) => {
    if (field === this.state.editingField) {
      return this.closeEditor();
    }
    const {fieldType} = field.projectCustomField?.field;

    if (!fieldType) {
      return null;
    }

    this.setState({
      editingField: field,
      isEditingProject: false,
      ...initialEditorsState,
    });

    if (fieldType.valueType === 'date' || fieldType.valueType === DATE_AND_TIME_FIELD_VALUE_TYPE) {
      return this.editDateField(field);
    }

    if (['period', 'integer', 'string', 'text', 'float'].indexOf(fieldType.valueType) !== -1) {
      return this.editSimpleValueField(field, fieldType.valueType);
    }

    return this.editCustomField(field);
  };

  storeScrollPosition: ((event: any) => void) = (event: Object) => {
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
      animated: false,
    });

    // Android doesn't get first scrollTo call https://youtrack.jetbrains.com/issue/YTM-402
    // iOS doesn't scroll immediately since 0.48 https://github.com/facebook/react-native/issues/15808
    if (ensure) {
      setTimeout(() => this.restoreScrollPosition(scrollNode, false));
    }
  };

  _renderSelect() {
    const Component: Select | SelectModal = isSplitView() ? SelectModal : Select;
    return <Component
      {...this.state.select}
      autoFocus={this.props.autoFocusSelect}
      onCancel={() => this.closeEditor()}
    />;
  }

  renderHeader(title: string, uiTheme: UITheme): Node {
    const {simpleValue, editingField} = this.state;
    const isSimpleValueEditorShown: boolean = simpleValue.show && !!editingField;
    return (
      <Header
        style={styles.customFieldEditorHeader}
        leftButton={<IconClose size={21} color={uiTheme.colors.$link}/>}
        onBack={() => this.closeEditor()}
        rightButton={isSimpleValueEditorShown ? <IconCheck size={21} color={uiTheme.colors.$link}/> : null}
        onRightButtonClick={() => {
          if (isSimpleValueEditorShown) {
            simpleValue.onApply(simpleValue.value);
          }
        }}
        title={title}
      />
    );
  }

  renderDatePicker(uiTheme: UITheme) {
    const {datePicker} = this.state;
    const {modal} = this.props;
    const render = (): Node => {
      const hideEditor = (): void => {
        this.closeEditor();
      };
      return (
        <DatePickerField
          modal={modal}
          emptyValueName={datePicker.emptyValueName}
          onApply={(date, time) => {
            datePicker.onSelect(date, time);
            hideEditor();
          }}
          onHide={hideEditor}
          placeholder={datePicker.placeholder}
          theme={calendarTheme(uiTheme)}
          title={datePicker.title}
          time={datePicker.time}
          value={datePicker.value}
          withTime={datePicker.withTime}
        />
      );
    };

    if (isSplitView()) {
      return (
        <ModalPortal
          hasOverlay={!this.props.modal}
          onHide={this.closeEditor}
        >
          {render()}
        </ModalPortal>
      );
    } else {
      return (
        <ModalView animationType="slide">
          {render()}
        </ModalView>
      );
    }
  }

  renderSimpleValueInput(): any {
    const {editingField} = this.state;
    const title: string = editingField?.projectCustomField?.field?.name || '';
    const render = (): Node => {
      return (
        <SimpleValueEditor
          modal={this.props.modal}
          editingField={this.state.editingField}
          onApply={(value: any) => {
            this.state.simpleValue.onApply(value);
            this.closeEditor();
          }}
          onHide={this.closeEditor}
          placeholder={this.state.simpleValue.placeholder}
          title={title}
          value={this.state.simpleValue.value}
        />
      );
    };

  if (isSplitView()) {
    return (
      <ModalPortal
        hasOverlay={!this.props.modal}
        onHide={this.closeEditor}
      >
        {render()}
      </ModalPortal>
    );
    } else {
      return (
        <ModalView
          animationType="slide"
        >
          {render()}
        </ModalView>
      );
    }
  }

  renderFields(): Node {
    const {hasPermission, fields, issueProject = {name: ''}} = this.props;
    const {savingField, editingField, isEditingProject, isSavingProject} = this.state;

    return (
      <>
        {!fields && <SkeletonIssueCustomFields/>}

        {!!fields && <PanelWithSeparator>
          <ScrollView
            ref={this.restoreScrollPosition}
            onScroll={this.storeScrollPosition}
            contentOffset={{
              x: this.currentScrollX,
              y: 0,
            }}
            scrollEventThrottle={100}
            horizontal={true}
            style={styles.customFieldsPanel}
            keyboardShouldPersistTaps="always"
          >
            <View key="Project">
              <CustomField
                disabled={!hasPermission.canEditProject || this.isConnected === false}
                onPress={this.onSelectProject}
                active={isEditingProject}
                field={createNullProjectCustomField(issueProject.name, getProjectLabel())}
              />
              {isSavingProject && <ActivityIndicator style={styles.savingFieldIndicator}/>}
            </View>

            {fields.map((field: IssueCustomField, index: number) => {
              const isDisabled: boolean = (
                !(hasPermission.canUpdateField && hasPermission.canUpdateField(field)) ||
                !field?.projectCustomField?.field?.fieldType ||
                this.isConnected === false
              );
              return <View key={field.id || `${field.name}-${index}`}>
                <CustomField
                  field={field}
                  onPress={() => this.onEditField(field)}
                  active={editingField === field}
                  disabled={isDisabled}/>

                {savingField && savingField.id === field.id && <ActivityIndicator style={styles.savingFieldIndicator}/>}
              </View>;
            })}
          </ScrollView>
        </PanelWithSeparator>}
      </>
    );
  }

  render(): Node {
    const {uiTheme, style, testID} = this.props;
    const {select, datePicker, simpleValue, editingField} = this.state;

    return (
      <IssueContext.Consumer>
        {(issueDate) => {
          if (issueDate) {
            this.isConnected = issueDate.isConnected;
          }
          return (
            <View
              testID={testID}
              style={[styles.container, style]}
            >

              {this.renderFields()}

              <AnimatedView
                style={styles.editorViewContainer}
                animation="fadeIn"
                duration={500}
                useNativeDriver
              >
                {select.show && this._renderSelect()}
                {datePicker.show && this.renderDatePicker(uiTheme)}
                {(simpleValue.show && !!editingField) && this.renderSimpleValueInput()}
              </AnimatedView>

            </View>
          );
        }}
      </IssueContext.Consumer>
    );
  }
}

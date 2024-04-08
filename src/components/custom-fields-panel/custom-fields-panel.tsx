import React, {useContext} from 'react';
import {View, ActivityIndicator} from 'react-native';

import {ScrollView} from 'react-native-gesture-handler';
import {View as AnimatedView} from 'react-native-animatable';
import {useSelector} from 'react-redux';

import Api from 'components/api/api';
import CustomField from 'components/custom-field/custom-field';
import DatePickerField from './custom-fields-panel__date-picker';
import ModalPortal from 'components/modal-view/modal-portal';
import ModalView from 'components/modal-view/modal-view';
import SimpleValueEditor from './custom-fields-panel__simple-value';
import usage from 'components/usage/usage';
import {createNullProjectCustomField} from 'util/util';
import {formatTime} from 'components/date/date';
import {getApi} from 'components/api/api__instance';
import {i18n} from 'components/i18n/i18n';
import {IItem, ISelectState, Select, SelectModal} from 'components/select/select';
import {isSplitView} from 'components/responsive/responsive-helper';
import {IssueContext} from 'views/issue/issue-context';
import {PanelWithSeparator} from 'components/panel/panel-with-separator';
import {SkeletonIssueCustomFields} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';

import styles, {calendarTheme} from './custom-fields-panel.styles';

import type {CustomField as IssueCustomField, CustomFieldValue} from 'types/CustomFields';
import type {UITheme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';
import {AppState} from 'reducers';
import {IssueContextData} from 'types/Issue';
import {Project} from 'types/Project';
import {Theme} from 'types/Theme';

interface Props {
  autoFocusSelect?: boolean;
  style?: ViewStyleProp;
  issueId: string;
  issueProject: Project;
  fields: IssueCustomField[];
  hasPermission: {
    canUpdateField?: (field: IssueCustomField) => boolean;
    canCreateIssueToProject?: (project: Project) => boolean;
    canEditProject: boolean;
  };
  onUpdate: (
    field: IssueCustomField,
    value: CustomFieldValue | null,
  ) => Promise<unknown>;
  onUpdateProject: (project: Project) => Promise<unknown>;
  uiTheme: UITheme;
  analyticsId?: string;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  modal?: boolean;
}

interface SelectState extends ISelectState {
  show?: boolean;
  dataSource: (query: string) => Promise<Array<IItem>>;
  emptyValue?: string | null | undefined;
  getTitle?: (item: IItem) => string;
  getValue?: (item: IItem) => string;
  multi: boolean;
  onChangeSelection?: (selectedItems: Array<IItem>) => any;
  onSelect: (item: any) => any;
  placeholder?: string;
  selectedItems: Array<IItem>;
}

interface SimpleValueState {
  show?: boolean;
  onApply: (v: string) => void;
  placeholder: string;
  value: string;
}

interface DatePickerState {
  show?: boolean;
  emptyValueName: string | null;
  onSelect: (date: Date, time: string) => any;
  placeholder: string;
  time: string | null;
  title: string;
  date: Date;
  withTime: boolean;
}

const DATE_AND_TIME_FIELD_VALUE_TYPE = 'date and time';

const getProjectLabel = () => i18n('Project');

const placeholders = {
  integer: '-12 or 34',
  string: 'Type value',
  text: 'Type text value',
  float: 'Type float value',
  default: '1w 1d 1h 1m',
};
const valueFormatters = {
  integer: (v: string) => parseInt(v, 10),
  float: (v: string) => parseFloat(v),
  string: (v: string) => v,
  text: (v: string) => ({text: v}),
  default: (v: string) => ({presentation: v}),
};

const dataPickerDefault: DatePickerState = {
  show: false,
  emptyValueName: null,
  onSelect: () => {},
  placeholder: '',
  time: null,
  title: '',
  date: new Date(),
  withTime: false,
};

export default function CustomFieldsPanel(props: Props) {
  const theme: Theme = useContext(ThemeContext);

  const api: Api = getApi();
  let currentScrollX: number = 0;
  const isComponentMounted = React.useRef<boolean>(false);
  const isConnected = useSelector((state: AppState) => state.app.networkState?.isConnected);
  const user = useSelector((state: AppState) => state.app.user);
  const isReporter = user?.profiles.helpdesk.isReporter;
  const [selectState, setSelectState] = React.useState<SelectState | null>(null);
  const [simpleValueState, setSimpleValue] = React.useState<SimpleValueState | null>(null);
  const [datePickerState, setDatePickerState] = React.useState<DatePickerState>(dataPickerDefault);
  const [isEditingProject, setEditingProject] = React.useState<boolean>(false);
  const [isSavingProject, setSavingProject] = React.useState<boolean>(false);
  const [editingField, setEditingField] = React.useState<IssueCustomField | null>(null);
  const [savingField, setSavingField] = React.useState<IssueCustomField | null>(null);

  React.useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
    };
  }, []);

  const trackEvent: (message: string) => void = (message: string) => {
    if (props.analyticsId) {
      usage.trackEvent(props.analyticsId, message);
    }
  };

  const saveUpdatedField = (field: IssueCustomField, value: CustomFieldValue | null) => {
    const updateSavingState = (savingField: IssueCustomField | null) => {
      if (isComponentMounted) {
        setSavingField(savingField);
      }
    };

    closeEditor();
    updateSavingState(field);
    return props
      .onUpdate(field, value)
      .then(res => {
        updateSavingState(null);
        return res;
      })
      .catch(() => updateSavingState(null));
  };

  const onSelectProject = () => {
    trackEvent('Update project: start');

    if (isEditingProject) {
      return closeEditor();
    }

    const {hasPermission} = props;
    closeEditor();
    setEditingProject(true);
    setSelectState({
      show: true,
      getValue: (project: Project) => `${project.name} (${project.shortName})`,
      dataSource: async query => {
        const projects = await api.getProjects(query);
        return projects
          .filter(project => !project.archived && !project.template)
          .filter(project => hasPermission?.canCreateIssueToProject?.(project));
      },
      multi: false,
      placeholder: i18n('Search for the project'),
      selectedItems: [props.issueProject],
      onSelect: (project: Project) => {
        trackEvent('Update project: updated');
        closeEditor();
        setSavingProject(true);
        return props.onUpdateProject(project).then(() => setSavingProject(false));
      },
    });
  };

  const closeEditor = () => {
    setEditingField(null);
    setEditingProject(false);
    setSelectState(null);
    setSimpleValue(null);
    setDatePickerState(dataPickerDefault);
  };

  const editDateField = (field: IssueCustomField) => {
    trackEvent('Edit date field');
    const projectCustomField = field.projectCustomField;
    const withTime = projectCustomField.field.fieldType.valueType === DATE_AND_TIME_FIELD_VALUE_TYPE;
    const date = field.value ? new Date(field.value as number) : null;
    return setDatePickerState({
      show: true,
      placeholder: i18n('Enter time value'),
      withTime,
      time: date ? formatTime(date) : null,
      title: projectCustomField.field.name,
      date: field.value ? date! : new Date(),
      emptyValueName: projectCustomField.canBeEmpty ? projectCustomField.emptyFieldText : null,
      onSelect: (d: Date, time?: string) => {
        if (!d) {
          return saveUpdatedField(field, null);
        }

        if (withTime && time) {
          try {
            const match = time.match(/(\d\d):(\d\d)/);

            if (match) {
              const [, hours = 3, minutes = 0] = match;
              d.setHours(parseInt(`${hours}`, 10), parseInt(`${minutes}`, 10));
            }
          } catch (e) {
            throw new Error(`Invalid date: ${e}`);
          }
        }

        saveUpdatedField(field, d.getTime());
      },
    });
  };

  const editSimpleValueField = (field: IssueCustomField, type: keyof typeof placeholders) => {
    trackEvent('Edit simple value field');
    const placeholder: string = placeholders[type] || placeholders.default;
    const valueFormatter = valueFormatters[type] || valueFormatters.default;
    const value: string =
      field.value != null ? field.value?.presentation || field.value.text || `${field.value}` : '';
    return setSimpleValue({
      show: true,
      placeholder,
      value,
      onApply: (v: string) => saveUpdatedField(field, valueFormatter(v)),
    });
  };

  const editCustomField = (field: IssueCustomField) => {
    const projectCustomField = field.projectCustomField;
    const projectCustomFieldName: string | null | undefined = projectCustomField?.field?.name;
    trackEvent(`Edit custom field: ${projectCustomFieldName ? projectCustomFieldName.toLowerCase() : ''}`);

    setSelectState({
      show: true,
      multi: projectCustomField.field.fieldType.isMultiValue,
      selectedItems: new Array<CustomFieldValue>().concat(field.value),
      emptyValue: projectCustomField.canBeEmpty ? projectCustomField.emptyFieldText : null,
      dataSource: () => {
        if (field.hasStateMachine) {
          return api
            .getStateMachineEvents(props.issueId, field.id)
            .then((items: {id: string; presentation: string}[]) =>
              items.flatMap(it => ({
                name: `${it.id} (${it.presentation})`,
              }))
            );
        }

        return api.getCustomFieldValues(projectCustomField?.bundle?.id, projectCustomField.field.fieldType.valueType);
      },
      onChangeSelection: selectedItems => {
        setSelectState((prevState: SelectState | null) => ({...prevState, ...selectState, selectedItems}));
      },
      onSelect: value => saveUpdatedField(field, value),
    });
  };

  const onEditField = (field: IssueCustomField) => {
    if (field === editingField) {
      return closeEditor();
    }

    const {fieldType} = field.projectCustomField?.field;

    if (!fieldType) {
      return null;
    }

    setEditingField(field);
    setEditingProject(false);
    if (fieldType.valueType === 'date' || fieldType.valueType === DATE_AND_TIME_FIELD_VALUE_TYPE) {
      return editDateField(field);
    }

    if (['period', 'integer', 'string', 'text', 'float'].indexOf(fieldType.valueType) !== -1) {
      return editSimpleValueField(field, fieldType.valueType as keyof typeof placeholders);
    }

    return editCustomField(field);
  };

  const storeScrollPosition = (event: Record<string, any>) => {
    const {nativeEvent} = event;
    currentScrollX = nativeEvent.contentOffset.x;
  };

  const restoreScrollPosition = (scrollNode?: ScrollView | null, ensure: boolean = true) => {
    if (!scrollNode || !currentScrollX) {
      return;
    }

    scrollNode.scrollTo({
      x: currentScrollX,
      y: 0,
      animated: false,
    });

    // Android doesn't get first scrollTo call https://youtrack.jetbrains.com/issue/YTM-402
    // iOS doesn't scroll immediately since 0.48 https://github.com/facebook/react-native/issues/15808
    if (ensure) {
      setTimeout(() => restoreScrollPosition(scrollNode, false));
    }
  };

  const renderSelect = () => {
    const Component = isSplitView() ? SelectModal : Select;
    return <Component {...selectState} autoFocus={props.autoFocusSelect} onCancel={() => closeEditor()} />;
  };

  const renderDatePicker = () => {
    const {modal} = props;

    const render = () => {
      return (
        <DatePickerField
          modal={modal}
          emptyValueName={datePickerState.emptyValueName}
          onApply={(date: Date, time: string) => {
            datePickerState.onSelect(date, time);
            closeEditor();
          }}
          onHide={closeEditor}
          placeholder={datePickerState.placeholder}
          theme={calendarTheme(theme.uiTheme)}
          title={datePickerState.title}
          time={datePickerState.time}
          date={datePickerState.date}
          withTime={datePickerState.withTime}
        />
      );
    };

    if (isSplitView()) {
      return (
        <ModalPortal hasOverlay={!props.modal} onHide={closeEditor}>
          {render()}
        </ModalPortal>
      );
    } else {
      return <ModalView>{render()}</ModalView>;
    }
  };

  const renderSimpleValueInput = () => {
    const title: string = editingField?.projectCustomField?.field?.name || '';

    const editor = simpleValueState ? (
      <SimpleValueEditor
        modal={props.modal}
        editingField={editingField}
        onApply={(value: any) => {
          simpleValueState.onApply(value);
          closeEditor();
        }}
        onHide={closeEditor}
        placeholder={simpleValueState.placeholder}
        title={title}
        value={simpleValueState.value}
      />
    ) : null;

    if (isSplitView()) {
      return (
        <ModalPortal hasOverlay={!props.modal} onHide={closeEditor}>
          {editor}
        </ModalPortal>
      );
    } else {
      return <ModalView>{editor}</ModalView>;
    }
  };

  const isFieldDisabled = () => isConnected === false || !!isReporter;

  const renderFields = () => {
    const {issueProject = {name: ''}} = props;
    return (
      <>
        {!props.fields && <SkeletonIssueCustomFields />}

        {!!props.fields && (
          <PanelWithSeparator>
            <ScrollView
              ref={restoreScrollPosition}
              onScroll={storeScrollPosition}
              contentOffset={{
                x: currentScrollX,
                y: 0,
              }}
              scrollEventThrottle={100}
              horizontal={true}
              keyboardShouldPersistTaps="always"
            >
              <View key="Project">
                <CustomField
                  disabled={!props.hasPermission.canEditProject || isFieldDisabled()}
                  onPress={onSelectProject}
                  active={isEditingProject}
                  field={createNullProjectCustomField(issueProject.name, getProjectLabel())}
                />
                {isSavingProject && <ActivityIndicator style={styles.savingFieldIndicator} />}
              </View>

              {props.fields.map((field: IssueCustomField, index: number) => {
                const isDisabled: boolean =
                  isFieldDisabled() ||
                  !(props.hasPermission.canUpdateField && props.hasPermission.canUpdateField(field)) ||
                  !field?.projectCustomField?.field?.fieldType;
                return (
                  <React.Fragment key={field.id || `${field.name}-${index}`}>
                    <CustomField
                      absDate={!!user?.profiles.appearance?.useAbsoluteDates}
                      field={field}
                      onPress={() => onEditField(field)}
                      active={editingField === field}
                      disabled={isDisabled}
                    />

                    {savingField && savingField.id === field.id && (
                      <ActivityIndicator style={styles.savingFieldIndicator} />
                    )}
                  </React.Fragment>
                );
              })}
            </ScrollView>
          </PanelWithSeparator>
        )}
      </>
    );
  };

  return (
    <IssueContext.Consumer>
      {(issueDate: IssueContextData) => {
        return (
          <View
            accessible={props.accessible}
            accessibilityLabel={props.accessibilityLabel}
            testID={props.testID}
            style={[styles.container, props.style]}
          >
            {renderFields()}

            <AnimatedView style={styles.editorViewContainer} animation="fadeIn" duration={500} useNativeDriver>
              {selectState && renderSelect()}
              {datePickerState.show && renderDatePicker()}
              {simpleValueState && !!editingField && renderSimpleValueInput()}
            </AnimatedView>
          </View>
        );
      }}
    </IssueContext.Consumer>
  );
}

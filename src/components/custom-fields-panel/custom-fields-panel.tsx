import React from 'react';
import {ActivityIndicator, View} from 'react-native';

import {ScrollView} from 'react-native-gesture-handler';
import {View as AnimatedView} from 'react-native-animatable';
import {useSelector} from 'react-redux';

import Api from 'components/api/api';
import CustomField from 'components/custom-field/custom-field';
import DateTimePicker from '../date-picker/date-time-picker';
import IssueSprintsField from 'components/custom-field/Issue-sprints-field';
import ModalPortal from 'components/modal-view/modal-portal';
import ModalView from 'components/modal-view/modal-view';
import SimpleValueEditor from './custom-fields-panel__simple-value';
import usage from 'components/usage/usage';
import {createNullProjectCustomField} from 'util/util';
import {
  customFieldPlaceholders,
  customFieldValueFormatters,
  DATE_AND_TIME_FIELD_VALUE_TYPE,
  getProjectLabel,
} from 'components/custom-fields-panel/index';
import {getApi} from 'components/api/api__instance';
import {getCustomFieldSelectProps} from 'components/custom-field';
import {i18n} from 'components/i18n/i18n';
import {ISelectProps, Select, SelectModal} from 'components/select/select';
import {isSplitView} from 'components/responsive/responsive-helper';
import {PanelWithSeparator} from 'components/panel/panel-with-separator';
import {SkeletonIssueCustomFields} from 'components/skeleton/skeleton';

import styles from './custom-fields-panel.styles';

import type {AppState} from 'reducers';
import type {CustomField as IssueCustomField, CustomFieldBaseValue, CustomFieldValue} from 'types/CustomFields';
import type {CustomFieldSelect} from 'components/custom-field';
import type {PeriodFieldValue, TextFieldValue} from 'types/CustomFields';
import type {Project} from 'types/Project';
import type {UITheme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';

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
  onUpdate: (field: IssueCustomField, value: CustomFieldBaseValue) => Promise<unknown>;
  onUpdateProject: (project: Project) => Promise<unknown>;
  onUpdateSprints: () => void;
  uiTheme: UITheme;
  analyticsId?: string;
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
  modal?: boolean;
  helpDeskProjectsOnly: boolean;
}

interface SelectState extends ISelectProps<CustomFieldSelect> {
  show?: boolean;
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
  onSelect: (date: Date | null) => void;
  placeholder: string;
  title: string;
  date: Date | null;
  withTime: boolean;
}

const dataPickerDefault: DatePickerState = {
  show: false,
  emptyValueName: null,
  onSelect: () => {},
  placeholder: '',
  title: '',
  date: null,
  withTime: false,
};

export default function CustomFieldsPanel(props: Props) {
  const api: Api = getApi();
  let currentScrollX: number = 0;
  const isComponentMounted = React.useRef<boolean>(false);
  const isConnected = useSelector((state: AppState) => state.app.networkState?.isConnected);
  const user = useSelector((state: AppState) => state.app.user);
  const isReporter = !!user?.profiles?.helpdesk?.isReporter;

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

  const closeEditor = () => {
    setEditingField(null);
    setEditingProject(false);
    setSelectState(null);
    setSimpleValue(null);
    setDatePickerState(dataPickerDefault);
  };

  const saveUpdatedField = async (field: IssueCustomField, value: CustomFieldBaseValue) => {
    const updateSavingState = (f: IssueCustomField | null) => {
      if (isComponentMounted) {
        setSavingField(f);
      }
    };

    closeEditor();
    updateSavingState(field);
    await props.onUpdate(field, value);
    updateSavingState(null);
  };

  const onSelectProject = () => {
    trackEvent('Update project: start');

    if (isEditingProject) {
      return closeEditor();
    }

    const {hasPermission, helpDeskProjectsOnly} = props;
    closeEditor();
    setEditingProject(true);
    setSelectState({
      show: true,
      getValue: (it) => {
        const p = it as Project;
        return `${p.name} (${p.shortName})`;
      },
      dataSource: async query => {
        const projects = await api.getProjects(query);
        return projects
          .filter(project =>
            helpDeskProjectsOnly
              ? project?.plugins?.helpDeskSettings?.enabled
              : !project.plugins?.helpDeskSettings?.enabled
          )
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

  const editDateField = (field: IssueCustomField) => {
    trackEvent('Edit date field');
    const projectCustomField = field.projectCustomField;
    const withTime = projectCustomField.field.fieldType.valueType === DATE_AND_TIME_FIELD_VALUE_TYPE;
    const date = field.value ? new Date(field.value as number) : null;
    return setDatePickerState({
      show: true,
      placeholder: i18n('Enter time value'),
      withTime,
      title: projectCustomField.field.name,
      date,
      emptyValueName: projectCustomField.canBeEmpty ? projectCustomField.emptyFieldText : null,
      onSelect: (d: Date | null) => {
        if (!d) {
          saveUpdatedField(field, null);
        } else {
          saveUpdatedField(field, d.getTime());
        }
      },
    });
  };

  const editSimpleValueField = (field: IssueCustomField, type: keyof typeof customFieldPlaceholders) => {
    trackEvent('Edit simple value field');
    const placeholder: string = customFieldPlaceholders[type] || customFieldPlaceholders.default;
    const valueFormatter = customFieldValueFormatters[type] || customFieldValueFormatters.default;
    const value: string =
      field.value != null
        ? (field.value as PeriodFieldValue)?.presentation || (field.value as TextFieldValue)?.text || `${field.value}`
        : '';

    setSimpleValue({
      show: true,
      placeholder,
      value,
      onApply: (v: string) => {
        saveUpdatedField(field, valueFormatter(v) as CustomFieldValue);
      },
    });
  };

  const editCustomField = (field: IssueCustomField) => {
    const projectCustomField = field.projectCustomField;
    const projectCustomFieldName: string | null | undefined = projectCustomField?.field?.name;
    trackEvent(`Edit custom field: ${projectCustomFieldName ? projectCustomFieldName.toLowerCase() : ''}`);

    const p = getCustomFieldSelectProps({
      field,
      issueId: props.issueId,
      onChangeSelection: selectedItems => {
        setSelectState(prevState => ({...prevState, ...selectState, selectedItems}));
      },
      onSelect: value => {
        saveUpdatedField(field, value);
      },
    });

    setSelectState(p);
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
      return editSimpleValueField(field, fieldType.valueType as keyof typeof customFieldPlaceholders);
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
    const Component : React.ElementType = isSplitView() ? SelectModal : Select;
    return <Component {...selectState} autoFocus={props.autoFocusSelect} onCancel={() => closeEditor()} />;
  };

  const renderDatePicker = () => {
    const {modal} = props;

    const render = () => {
      return (
        <DateTimePicker
          modal={modal}
          emptyValueName={datePickerState.emptyValueName}
          onApply={(date: Date | null) => {
            datePickerState.onSelect(date);
            closeEditor();
          }}
          onHide={closeEditor}
          placeholder={datePickerState.placeholder}
          title={datePickerState.title}
          current={datePickerState.date}
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

  const isFieldDisabled = () => isConnected === false || isReporter;

  const renderFields = () => {
    const {issueProject = {name: '', id: ''}, onUpdateSprints} = props;
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

              <IssueSprintsField projectId={issueProject.id} onUpdate={onUpdateSprints} />
            </ScrollView>
          </PanelWithSeparator>
        )}
      </>
    );
  };

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
}

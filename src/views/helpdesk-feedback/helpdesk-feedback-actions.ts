import {
  createFormBlocks,
  FeedbackBlock,
  FeedbackFormBlockCustomField,
  FeedbackFormData,
  FeedbackFormBlockFieldValue,
  projectCustomFieldTypeToFieldType,
} from 'views/helpdesk-feedback/index';
import {getLocalizedName} from 'components/custom-field/custom-field-helper';
import {notify, notifyError} from 'components/notification/notification';
import {SET_PROGRESS} from 'actions/action-types';
import {setError, setSelectProps, setFormData, setProject} from './helpdesk-feedback-reducers';
import {until} from 'util/util';

import {CustomError} from 'types/Error';
import {FeedbackForm} from 'types/FeedbackForm';
import {ProjectHelpdesk} from 'types/Project';
import {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';

const loadFeedbackForm = (project: ProjectHelpdesk): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    dispatch(setProject(project));
    const state = getState();
    const [error, form] = await until<FeedbackForm>(
      getApi().helpDesk.getForm(project.plugins.helpDeskSettings.defaultForm.uuid)
    );
    if (error) {
      dispatch(setError(error));
    } else {
      dispatch(setFormData({form, formBlocks: createFormBlocks(form, state.app.issuePermissions)}));
    }
  };
};

const setSelect = (b: FeedbackBlock, onSelect: (s: FeedbackFormBlockCustomField) => void): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const form = getState().helpDeskFeedbackForm.form!;
    const [error, values] = await until<Array<FeedbackFormBlockFieldValue>>(
      getApi().helpDesk.getFieldValues(form?.uuid, b.id)
    );
    if (error) {
      notifyError(error);
    }
    const onCancel = () => dispatch(setSelectProps(null));
    const field = b.field!;
    const multi = field.isMultiValue;
    dispatch(
      error
        ? null
        : setSelectProps({
            multi,
            getTitle: getLocalizedName,
            dataSource: () => Promise.resolve(values),
            selectedItems: (multi ? field.value : [field.value]) as FeedbackFormBlockFieldValue[],
            onSelect: (selected: FeedbackFormBlockCustomField) => {
              onSelect(selected);
              onCancel();
            },
            onCancel,
          })
    );
  };
};

const setInProgress = (isInProgress: boolean = false): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch) =>
    dispatch({
      type: SET_PROGRESS,
      isInProgress,
    });
};

const submitForm = (formBlocks: FeedbackBlock[]): ReduxAction<Promise<CustomError | void>> => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter) => {
    const state = getState().helpDeskFeedbackForm;
    const form = state.form!;
    const formData = formBlocks
      .filter((b: FeedbackBlock) => b.value && b.name)
      .reduce(
        (akk: FeedbackFormData, b) => {
          if (b.field) {
            akk.fields.push({
              ...b.field,
              $type: projectCustomFieldTypeToFieldType(b.field.$type, b.field.isMultiValue),
            });
          } else if (b.name !== null) {
            akk[b.name] = b.value;
          }
          return akk;
        },
        {fields: []}
      );
    dispatch(setInProgress(true));
    const [error] = await until<{
      id: string;
    }>(getApi().helpDesk.submitForm(form.uuid, formData));
    dispatch(setInProgress(false));
    if (error) {
      notifyError(error);
      return Promise.reject(error);
    }
    if (form.confirmationText) {
      notify(form.confirmationText);
    }
    return Promise.resolve();
  };
};

const onRefresh = (): ReduxAction => {
  return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
    const state = getState().helpDeskFeedbackForm;
    dispatch(loadFeedbackForm(state.project!));
  };
};

export {
  loadFeedbackForm,
  setSelect,
  onRefresh,
  submitForm,
};

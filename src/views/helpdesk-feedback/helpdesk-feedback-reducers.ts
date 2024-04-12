import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {SET_PROGRESS} from 'actions/action-types';

import {CustomError} from 'types/Error';
import {FeedbackBlock, FeedbackFormBlockFieldValue} from 'views/helpdesk-feedback/index';
import {FeedbackForm} from 'types/FeedbackForm';
import {ISelectWithCustomInput} from 'components/select/select-with-custom-input';
import {ProjectHelpdesk} from 'types/Project';

export interface HelpDeskFeedbackFormState {
  error: CustomError | null;
  form: FeedbackForm | null;
  formBlocks: FeedbackBlock[] | null;
  fieldValues: Array<FeedbackFormBlockFieldValue> | null;
  inProgress: boolean;
  project: ProjectHelpdesk | null;
  selectProps: ISelectWithCustomInput | null;
}

export const initialState: HelpDeskFeedbackFormState = {
  error: null,
  form: null,
  formBlocks: null,
  fieldValues: null,
  inProgress: false,
  project: null,
  selectProps: null,
};

const {reducer, actions} = createSlice({
  name: 'helpdeskFeedbackForm',
  initialState: initialState,
  reducers: {
    setFormData(
      state: HelpDeskFeedbackFormState,
      action: PayloadAction<{form: FeedbackForm; formBlocks: FeedbackBlock[]}>
    ) {
      state.form = action.payload.form;
      state.formBlocks = action.payload.formBlocks;
    },

    setSelectProps(state: HelpDeskFeedbackFormState, action: PayloadAction<ISelectWithCustomInput | null>) {
      state.selectProps = action.payload;
    },

    setError(state: HelpDeskFeedbackFormState, action: PayloadAction<CustomError>) {
      state.error = action.payload;
    },
    setProject(state: HelpDeskFeedbackFormState, action: PayloadAction<ProjectHelpdesk>) {
      state.project = action.payload;
    },
  },

  extraReducers: {
    [SET_PROGRESS]: (state: HelpDeskFeedbackFormState, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isInProgress: action.payload,
      };
    },
  },
});

export const {setError, setFormData, setSelectProps, setProject} = actions;

export default reducer;

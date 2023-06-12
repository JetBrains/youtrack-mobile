import * as actions from './create-issue-actions';
import * as commandDialogHelper from 'components/command-dialog/command-dialog-helper';
import * as storage from 'components/storage/storage';
import mocks from '../../../test/mocks';
import {
  commandDialogTypes,
  createIssueNamespace,
} from './create-issue-action-types';
import {CUSTOM_ERROR_MESSAGE} from 'components/error/error-messages';
import {ISSUE_CREATED} from './create-issue-action-types';
import {setApi} from 'components/api/api__instance';
import API from 'components/api/api';
import Store from 'store';
import {IssueCreate} from 'types/Issue';


let apiMock: API;
const getApi = () => apiMock;

const createStoreMock = mocks.createMockStore(getApi);
const PROJECT_ID_MOCK = 'PROJECT_ID';
describe('<CreateIssue/>', () => {
  let stateMock;
  let ownPropsMock;
  let issueMock: IssueCreate;
  let store: typeof Store;
  let issueDraftBase: Partial<IssueCreate>;
  beforeEach(async () => {
    await storage.__setStorageState({});
    issueMock = mocks.createIssueMock({
      project: {
        id: PROJECT_ID_MOCK,
      },
    });
    issueDraftBase = {
      id: issueMock.id,
      summary: issueMock.summary,
      description: issueMock.description,
      project: issueMock.project,
      fields: issueMock.fields,
    };
    createStore();
  });


  describe('loadStoredProject', () => {
    it('should set cached draft project id', async () => {
      await storage.__setStorageState({
        projectId: PROJECT_ID_MOCK,
      });
      await store.dispatch(actions.loadStoredProject());
      expect(store.getActions()[0]).toEqual({
        payload: {
          projectId: PROJECT_ID_MOCK,
        },
        type: `${createIssueNamespace}/setDraftProjectId`,
      });
    });

    it('should not set draft project id', async () => {
      await storage.__setStorageState({
        projectId: null,
      });
      await store.dispatch(actions.loadStoredProject());
      expect(store.getActions()).toHaveLength(0);
    });

    it('should set project id from the issues context', async () => {
      const contextProjectIdMock = 'issuesContextProjectId';
      createStore({
        issueList: {
          searchContext: {
            $type: 'Project',
            id: contextProjectIdMock,
          },
        },
      });
      await storage.__setStorageState({
        projectId: undefined,
      });

      await store.dispatch(actions.loadStoredProject());

      expect(store.getActions()[0]).toEqual({
        payload: {
          projectId: contextProjectIdMock,
        },
        type: `${createIssueNamespace}/setDraftProjectId`,
      });
    });

  });


  describe('loadIssueFromDraft', () => {
    it('should load issue draft', async () => {
      const draftIdMock = 'draftId';
      apiMock.issue.loadIssueDraft.mockResolvedValueOnce(issueMock);

      await store.dispatch(actions.loadIssueFromDraft(draftIdMock));

      expect(apiMock.issue.loadIssueDraft).toHaveBeenCalledWith(draftIdMock);
      expect(store.getActions()[0]).toEqual({
        payload: {
          issue: issueMock,
        },
        type: `${createIssueNamespace}/setIssueDraft`,
      });
    });
    it('should reset issue draft id on failed request', async () => {
      const draftIdMock = 'draftId';
      apiMock.issue.loadIssueDraft.mockRejectedValueOnce();

      expect(store.getState().creation.issue.id).toEqual(issueMock.id);

      await store.dispatch(actions.loadIssueFromDraft(draftIdMock));

      expect(apiMock.issue.loadIssueDraft).toHaveBeenCalledWith(draftIdMock);
      expect(store.getActions()[0]).toEqual({
        payload: undefined,
        type: `${createIssueNamespace}/resetIssueDraftId`,
      });
    });
  });


  describe('updateIssueDraft', () => {
    it('should update a draft', async () => {
      const draftMockData = {
        fields: [{}, {}],
      };
      const responseMock = {...issueMock, ...draftMockData, created: 0};
      apiMock.issue.updateIssueDraft.mockResolvedValueOnce(responseMock);
      await store.dispatch(actions.updateIssueDraft(false, draftMockData));
      expect(apiMock.issue.updateIssueDraft).toHaveBeenCalledWith({
        ...issueDraftBase,
        ...draftMockData,
      });
      expect(store.getActions()[0]).toEqual({
        payload: {
          issue: responseMock,
        },
        type: `${createIssueNamespace}/setIssueDraft`,
      });
    });
    it('should update a summary and description only', async () => {
      apiMock.issue.updateIssueDraft.mockResolvedValueOnce({
        summary: issueMock.summary,
        description: issueMock.description,
        fields: [{}],
      });
      await store.dispatch(actions.updateIssueDraft(true));
      expect(apiMock.issue.updateIssueDraft).toHaveBeenCalledWith({
        ...issueDraftBase,
        fields: undefined,
      });
      expect(store.getActions()[0]).toEqual({
        payload: {
          issue: {
            summary: issueMock.summary,
            description: issueMock.description,
          },
        },
        type: `${createIssueNamespace}/setIssueDraft`,
      });
    });
    it('should reset a project fields of the issue draft if server responded with 404 error', async () => {
      const error = new Error('404');
      error.error_description = CUSTOM_ERROR_MESSAGE.NO_ENTITY_FOUND;
      apiMock.issue.updateIssueDraft.mockRejectedValueOnce(error);
      await store.dispatch(actions.updateIssueDraft(false));
      expect(apiMock.issue.updateIssueDraft).toHaveBeenCalledWith(
        issueDraftBase,
      );
      expect(store.getActions()[0]).toEqual({
        payload: undefined,
        type: `${createIssueNamespace}/clearDraftProject`,
      });
    });
  });
  describe('initializeWithDraftOrProject', () => {
    it('should load an issue draft with provided draft id', async () => {
      await store.dispatch(actions.initializeWithDraftOrProject(issueMock.id));
      expect(apiMock.issue.loadIssueDraft).toHaveBeenCalledWith(issueMock.id);
      expect(store.getActions()[0]).toEqual({
        payload: {
          preDefinedDraftId: issueMock.id,
        },
        type: `${createIssueNamespace}/setIssuePredefinedDraftId`,
      });
    });
    it('should load an issue draft with cached draft id', async () => {
      apiMock.issue.loadIssueDraft.mockResolvedValueOnce(issueMock);
      await storage.__setStorageState({
        draftId: issueMock.summary,
      });
      await store.dispatch(actions.initializeWithDraftOrProject());
      expect(apiMock.issue.loadIssueDraft).toHaveBeenCalledWith(
        issueMock.summary,
      );
    });
    it('should create a new issue draft with cached project id', async () => {
      apiMock.issue.loadIssueDraft.mockResolvedValueOnce(issueMock);
      const projectIdMock = issueMock.project.id;
      await storage.__setStorageState({
        draftId: null,
        projectId: projectIdMock,
      });
      await store.dispatch(actions.initializeWithDraftOrProject());
      expect(apiMock.issue.loadIssueDraft).not.toHaveBeenCalledWith(
        issueMock.summary,
      );
      expect(store.getActions()[0]).toEqual({
        payload: {
          projectId: projectIdMock,
        },
        type: `${createIssueNamespace}/setDraftProjectId`,
      });
    });
  });


  describe('createIssue', () => {
    let createdIssueMock;
    beforeEach(async () => {
      await storage.__setStorageState({
        issue: issueMock,
      });
      apiMock.issue.updateIssueDraft.mockResolvedValueOnce(issueMock);
      createdIssueMock = {...issueMock, created: 1974};
      apiMock.issue.createIssue.mockResolvedValueOnce(createdIssueMock);
    });
    it('should enable processing', async () => {
      await store.dispatch(actions.createIssue());
      expect(store.getActions()[0]).toEqual({
        payload: undefined,
        type: `${createIssueNamespace}/startIssueCreation`,
      });
    });
    it('should update a draft before create a new issue', async () => {
      await store.dispatch(actions.createIssue());
      expect(apiMock.issue.updateIssueDraft).toHaveBeenCalledWith(
        {...issueDraftBase, fields: undefined},
      );
      expect(store.getActions()[1]).toEqual({
        payload: {
          issue: issueMock,
        },
        type: `${createIssueNamespace}/setIssueDraft`,
      });
    });
    it('should submit a new issue and propagate just created entity', async () => {
      await store.dispatch(actions.createIssue());
      expect(apiMock.issue.createIssue).toHaveBeenCalledWith(issueMock);
      expect(store.getActions()[2]).toEqual({
        type: ISSUE_CREATED,
        issue: createdIssueMock,
        preDefinedDraftId: null,
      });
    });
    it('should submit a new issue and do not propagate just created entity', async () => {
      await store.dispatch(
        actions.createIssue(
          () => null,
          () => false,
        ),
      );
      expect(apiMock.issue.createIssue).toHaveBeenCalledWith(issueMock);
      expect(store.getActions()).toHaveLength(4);
      expect(store.getActions()[0]).toEqual({
        type: 'IssueCreate/startIssueCreation',
      });
      expect(store.getActions()[1]).toEqual({
        type: 'IssueCreate/setIssueDraft',
        payload: {
          issue: issueMock,
        },
      });
      expect(store.getActions()[2]).toEqual({
        type: 'IssueCreate/resetCreation',
      });
      expect(store.getActions()[3]).toEqual({
        type: 'IssueCreate/stopIssueCreation',
      });
    });
    it('should reset issue draft and disable processing after submitting', async () => {
      await store.dispatch(actions.createIssue());
      expect(store.getActions()[3]).toEqual({
        payload: undefined,
        type: `${createIssueNamespace}/resetCreation`,
      });
      expect(store.getActions()[4]).toEqual({
        payload: undefined,
        type: `${createIssueNamespace}/stopIssueCreation`,
      });
    });
  });
  describe('updateFieldValue', () => {
    it('should update issue draft before updating a field value', async () => {
      apiMock.issue.updateIssueDraft.mockResolvedValueOnce(issueMock);
      await store.dispatch(actions.updateFieldValue({}, {}));
      expect(apiMock.issue.updateIssueDraft).toHaveBeenCalled();
    });
    it('should update issue field value', async () => {
      const fieldMock = mocks.createIssueFieldMock();
      const fieldValueMock = {...fieldMock.value, name: 'Show-stopper'};
      apiMock.issue.updateIssueDraftFieldValue.mockResolvedValueOnce({
        value: fieldValueMock,
      });
      await store.dispatch(actions.updateFieldValue(fieldMock, fieldValueMock));
      expect(store.getActions()[0]).toEqual({
        payload: {
          field: fieldMock,
          value: fieldValueMock,
        },
        type: `${createIssueNamespace}/setIssueFieldValue`,
      });
    });
    it('should refresh an issue draft after updating a field value', async () => {
      apiMock.issue.loadIssueDraft.mockResolvedValueOnce(issueMock);
      apiMock.issue.updateIssueDraftFieldValue.mockResolvedValueOnce({
        value: {},
      });
      await store.dispatch(actions.updateFieldValue({}, {}));
      expect(apiMock.issue.loadIssueDraft).toHaveBeenCalled();
    });
  });
  describe('toggleCommandDialog', () => {
    it('should show the command dialog', async () => {
      await store.dispatch(actions.toggleCommandDialog(true));
      expect(store.getActions()[0]).toEqual({
        type: commandDialogTypes.OPEN_COMMAND_DIALOG,
      });
    });
    it('should close the command dialog', async () => {
      await store.dispatch(actions.toggleCommandDialog(false));
      expect(store.getActions()[0]).toEqual({
        type: commandDialogTypes.CLOSE_COMMAND_DIALOG,
      });
    });
  });
  describe('getCommandSuggestions', () => {
    it('should show command suggestions', async () => {
      const commandSuggestionDataMock = {
        suggestions: [{}],
      };
      jest
        .spyOn(commandDialogHelper, 'loadIssueCommandSuggestions')
        .mockResolvedValueOnce(commandSuggestionDataMock);
      await loadSuggestions();
      expect(store.getActions()[0]).toEqual({
        type: commandDialogTypes.RECEIVE_COMMAND_SUGGESTIONS,
        suggestions: commandSuggestionDataMock,
      });
    });
    it('should not show command suggestions', async () => {
      jest
        .spyOn(commandDialogHelper, 'loadIssueCommandSuggestions')
        .mockRejectedValueOnce(new Error('cannot load suggestions'));
      await loadSuggestions();
      expect(store.getActions()).toHaveLength(0);
    });

    async function loadSuggestions() {
      await store.dispatch(actions.getCommandSuggestions('maj', 3));
    }
  });
  describe('applyCommand', () => {
    it('should apply a command', async () => {
      apiMock.issue.loadIssueDraft.mockResolvedValueOnce({});
      jest.spyOn(commandDialogHelper, 'applyCommand').mockResolvedValueOnce({});
      await store.dispatch(actions.applyCommand('major'));
      expect(store.getActions()[0]).toEqual({
        type: commandDialogTypes.START_APPLYING_COMMAND,
      });
      expect(store.getActions()[1]).toEqual({
        type: commandDialogTypes.CLOSE_COMMAND_DIALOG,
      });
      expect(store.getActions()[2]).toEqual({
        type: `${createIssueNamespace}/setIssueDraft`,
        payload: {
          issue: {},
        },
      });
    });
  });

  function createStore(stateData: Record<string, any> = {}) {
    apiMock = {
      auth: {
        getAuthorizationHeaders: jest.fn(),
      },
      issue: {
        loadIssueDraft: jest.fn(),
        updateIssueDraft: jest.fn(),
        createIssue: jest.fn(),
        updateIssueDraftFieldValue: jest.fn(),
      },
    };
    setApi(apiMock);
    stateMock = {
      app: {
        issuePermissions: {},
      },
      creation: {
        processing: false,
        attachingImage: null,
        predefinedDraftId: null,
        issue: issueMock,
      },
    };
    ownPropsMock = {};
    store = createStoreMock({...stateMock, ...stateData}, ownPropsMock);
  }
});

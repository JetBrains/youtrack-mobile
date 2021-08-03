import * as actions from './create-issue-actions';
import * as storage from '../../components/storage/storage';
import mocks from '../../../test/mocks';
import {createIssueReducersNamespace} from './create-issue-reducers';
import {CUSTOM_ERROR_MESSAGE} from '../../components/error/error-messages';
import {ISSUE_CREATED} from './create-issue-action-types';
import {setApi} from '../../components/api/api__instance';

let apiMock;
const getApi = () => apiMock;
const createStoreMock = mocks.createMockStore(getApi);
const PROJECT_ID_MOCK = 'PROJECT_ID';


describe('<CreateIssue/>', () => {
  let stateMock;
  let ownPropsMock;
  let issueMock;
  let store;
  let issueDraftBase;

  beforeEach(async () => {
    await storage.__setStorageState({});
    issueMock = mocks.createIssueMock({project: {id: PROJECT_ID_MOCK}});
    issueDraftBase = {
      id: issueMock.id,
      summary: issueMock.summary,
      description: issueMock.description,
      project: issueMock.project,
    };
    createStore();
  });

  describe('loadStoredProject', () => {
    it('should set cached draft project id', async () => {
      await storage.__setStorageState({projectId: PROJECT_ID_MOCK});
      await store.dispatch(actions.loadStoredProject());

      expect(store.getActions()[0]).toEqual({
        payload: {
          projectId: PROJECT_ID_MOCK,
        },
        type: `${createIssueReducersNamespace}/setDraftProjectId`,
      });
    });

    it('should not set draft project id', async () => {
      await storage.__setStorageState({projectId: null});
      await store.dispatch(actions.loadStoredProject());

      expect(store.getActions().length).toEqual(0);
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
        type: `${createIssueReducersNamespace}/setIssueDraft`,
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
        type: `${createIssueReducersNamespace}/resetIssueDraftId`,
      });
    });
  });


  describe('updateIssueDraft', () => {
    it('should update a draft', async () => {
      const draftMockData = {
        fields: [{}, {}],
      };
      const responseMock = {
        ...issueMock,
        ...draftMockData,
        created: 0,
      };
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
        type: `${createIssueReducersNamespace}/setIssueDraft`,
      });
    });

    it('should update a summary and description only', async () => {
      apiMock.issue.updateIssueDraft.mockResolvedValueOnce({
        summary: issueMock.summary,
        description: issueMock.description,
        fields: [{}],
      });

      await store.dispatch(actions.updateIssueDraft(true));

      expect(apiMock.issue.updateIssueDraft).toHaveBeenCalledWith(issueDraftBase);
      expect(store.getActions()[0]).toEqual({
        payload: {
          issue: {
            summary: issueMock.summary,
            description: issueMock.description,
          },
        },
        type: `${createIssueReducersNamespace}/setIssueDraft`,
      });
    });

    it('should reset a project fields of the issue draft if server responded with 404 error', async () => {
      const error = new Error('404');
      error.error_description = CUSTOM_ERROR_MESSAGE.NO_ENTITY_FOUND;
      apiMock.issue.updateIssueDraft.mockRejectedValueOnce(error);

      await store.dispatch(actions.updateIssueDraft(false));

      expect(apiMock.issue.updateIssueDraft).toHaveBeenCalledWith(issueDraftBase);
      expect(store.getActions()[0]).toEqual({
        payload: undefined,
        type: `${createIssueReducersNamespace}/clearDraftProject`,
      });
    });
  });


  describe('initializeWithDraftOrProject', () => {
    it('should load an issue draft with provided draft id', async () => {
      await store.dispatch(actions.initializeWithDraftOrProject(issueMock.id));

      expect(apiMock.issue.loadIssueDraft).toHaveBeenCalledWith(issueMock.id);
      expect(store.getActions()[0]).toEqual({
        payload: {preDefinedDraftId: issueMock.id},
        type: `${createIssueReducersNamespace}/setIssuePredefinedDraftId`,
      });
    });

    it('should load an issue draft with cached draft id', async () => {
      apiMock.issue.loadIssueDraft.mockResolvedValueOnce(issueMock);
      await storage.__setStorageState({draftId: issueMock.summary});

      await store.dispatch(actions.initializeWithDraftOrProject());

      expect(apiMock.issue.loadIssueDraft).toHaveBeenCalledWith(issueMock.summary);
    });

    it('should create a new issue draft with cached project id', async () => {
      apiMock.issue.loadIssueDraft.mockResolvedValueOnce(issueMock);
      const projectIdMock = issueMock.project.id;
      await storage.__setStorageState({
        draftId: null,
        projectId: projectIdMock,
      });

      await store.dispatch(actions.initializeWithDraftOrProject());

      expect(apiMock.issue.loadIssueDraft).not.toHaveBeenCalledWith(issueMock.summary);
      expect(store.getActions()[0]).toEqual({
        payload: {projectId: projectIdMock},
        type: `${createIssueReducersNamespace}/setDraftProjectId`,
      });
    });
  });


  describe('createIssue', () => {
    let createdIssueMock;
    beforeEach(async () => {
      await storage.__setStorageState({issue: issueMock});
      apiMock.issue.updateIssueDraft.mockResolvedValueOnce(issueMock);
      createdIssueMock = {
        ...issueMock,
        created: 1974,
      };
      apiMock.issue.createIssue.mockResolvedValueOnce(createdIssueMock);
    });

    it('should enable processing', async () => {
      await store.dispatch(actions.createIssue());

      expect(store.getActions()[0]).toEqual({
        payload: undefined,
        type: `${createIssueReducersNamespace}/startIssueCreation`,
      });
    });

    it('should update a draft before create a new issue', async () => {
      await store.dispatch(actions.createIssue());

      expect(apiMock.issue.updateIssueDraft).toHaveBeenCalledWith(issueDraftBase);
      expect(store.getActions()[1]).toEqual({
        payload: {issue: issueMock},
        type: `${createIssueReducersNamespace}/setIssueDraft`,
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

    it('should reset issue draft and disable processing after submitting', async () => {
      await store.dispatch(actions.createIssue());

      expect(store.getActions()[3]).toEqual({
        payload: undefined,
        type: `${createIssueReducersNamespace}/resetCreation`,
      });
      expect(store.getActions()[4]).toEqual({
        payload: undefined,
        type: `${createIssueReducersNamespace}/stopIssueCreation`,
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
      const fieldValueMock = {
        ...fieldMock.value,
        name: 'Show-stopper',
      };
      apiMock.issue.updateIssueDraftFieldValue.mockResolvedValueOnce({value: fieldValueMock});

      await store.dispatch(actions.updateFieldValue(fieldMock, fieldValueMock));

      expect(store.getActions()[0]).toEqual({
        payload: {
          field: fieldMock,
          value: fieldValueMock,
        },
        type: `${createIssueReducersNamespace}/setIssueFieldValue`,
      });
    });

    it('should refresh an issue draft after updating a field value', async () => {
      apiMock.issue.loadIssueDraft.mockResolvedValueOnce(issueMock);
      apiMock.issue.updateIssueDraftFieldValue.mockResolvedValueOnce({value: {}});

      await store.dispatch(actions.updateFieldValue({}, {}));

      expect(apiMock.issue.loadIssueDraft).toHaveBeenCalled();
    });
  });


  function createStore() {
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
    store = createStoreMock(stateMock, ownPropsMock);
  }
});

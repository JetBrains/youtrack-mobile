import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import {__setStorageState, getStorageState} from 'components/storage/storage';
import animation from 'components/animation/animation';
import * as actions from './board-actions';
import * as notification from 'components/notification/notification';
import * as types from './board-action-types';
import mocks from '../../../test/mocks';
import {SET_PROGRESS} from '../../actions/action-types';
let apiMock;
let store;
let agileUserProfileMock: AgileUserProfile;
let defaultAgileMock: Board;
let agileWithStatusMock;
let sprintMock: Sprint;
let storeActions;
const sprintIdMock = 'sprint-foo';

const getApi = () => apiMock;

const middlewares = [thunk.withExtraArgument(getApi)];
const storeMock = configureMockStore(middlewares);
const issueMock = mocks.createIssueMock();
let cachedSprintMock;
let cachedSprintIdMock;
describe('Agile board async actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(async () => {
    const sseTicketMock = 'SSETicket';
    cachedSprintIdMock = 'cachedSprint';
    cachedSprintMock = createSprintMock(cachedSprintIdMock);
    animation.layoutAnimation = jest.fn();
    sprintMock = createSprintMock(sprintIdMock, [
      createSprintMock(sprintIdMock),
      createSprintMock('sprint-bar'),
    ]);
    defaultAgileMock = sprintMock.agile;
    agileUserProfileMock = {
      defaultAgile: defaultAgileMock,
      visitedSprints: [
        createSprintMock('sprint-baz'),
        createSprintMock('sprint-boo'),
        sprintMock,
      ],
    };
    agileWithStatusMock = {
      status: {
        valid: true,
        errors: [],
      },
    };
    apiMock = {
      agile: {
        getSprint: jest.fn(() => sprintMock),
        getAgileUserProfile: jest.fn(() => agileUserProfileMock),
        updateAgileUserProfile: jest.fn(),
        getAgile: jest.fn(() => agileWithStatusMock),
        getAgileIssues: jest.fn().mockResolvedValueOnce([
          {
            id: 'issueId',
          },
        ]),
        loadSprintSSETicket: jest.fn().mockResolvedValueOnce(sseTicketMock),
      },
    };
    updateStore({
      agile: {
        profile: agileUserProfileMock,
      },
    });
    await __setStorageState({
      agileLastSprint: cachedSprintMock,
    });
  });
  describe('Agile user profile', () => {
    it('should load Agile user profile', async () => {
      updateStore();
      await store.dispatch(actions.loadAgileProfile());
      storeActions = store.getActions();
      expect(storeActions[0]).toEqual({
        type: types.RECEIVE_AGILE_PROFILE,
        profile: agileUserProfileMock,
      });
    });
    it('should update Agile user profile visited sprints on sprint change', async () => {
      await setLoadSprintExpectation();
      expect(apiMock.agile.updateAgileUserProfile).toHaveBeenCalledWith({
        visitedSprints: [
          {
            id: sprintMock.id,
          },
        ],
      });
    });
    it('should update Agile user profile default agile on agile change', async () => {
      await store.dispatch(actions.loadBoard(sprintMock.agile));
      expect(apiMock.agile.updateAgileUserProfile.mock.calls[0][0]).toEqual({
        defaultAgile: {
          id: sprintMock.agile.id,
        },
      });
    });
  });
  describe('Agile board', () => {
    describe('Load Agile with a status', () => {
      it('should load an agile', async () => {
        agileWithStatusMock = {
          status: {
            valid: true,
            errors: [],
          },
        };
        const agile = await store.dispatch(
          actions.loadAgile(defaultAgileMock.id),
        );
        expect(apiMock.agile.getAgile).toHaveBeenCalledWith(
          defaultAgileMock.id,
        );
        expect(agile).toEqual(agileWithStatusMock);
      });
      it('should return default invalid status', async () => {
        agileWithStatusMock = Promise.reject('request error');
        const agile = await store.dispatch(actions.loadAgile(''));
        expect(agile).toEqual(actions.DEFAULT_ERROR_AGILE_WITH_INVALID_STATUS);
      });
    });
    describe('Default agile', () => {
      beforeEach(async () => {
        await __setStorageState({
          agileLastSprint: cachedSprintMock,
        });
      });
      it('should load cached sprint first', async () => {
        await store.dispatch(actions.loadDefaultAgileBoard());
        expect(store.getActions()[1]).toEqual({
          type: types.RECEIVE_SPRINT,
          sprint: cachedSprintMock,
        });
      });
      it('should load the last visited sprint of the default agile', async () => {
        await store.dispatch(actions.loadDefaultAgileBoard());
        expect(apiMock.agile.getSprint).toHaveBeenCalledWith(
          defaultAgileMock.id,
          sprintIdMock,
          actions.PAGE_SIZE,
          0,
          undefined,
        );
      });
      it('should load the last visited sprint with query', async () => {
        const queryMock = 'for:me';
        await store.dispatch(actions.loadDefaultAgileBoard(queryMock));
        expect(apiMock.agile.getSprint).toHaveBeenCalledWith(
          defaultAgileMock.id,
          sprintIdMock,
          actions.PAGE_SIZE,
          0,
          queryMock,
        );
      });
      it('should load the default agile board`s sprint if there is no matching items from `visitedSprints`', async () => {
        updateStore({
          agile: {
            profile: {
              defaultAgile: defaultAgileMock,
              visitedSprints: [],
            },
          },
        });
        await __setStorageState({
          agileLastSprint: null,
        });
        await store.dispatch(actions.loadDefaultAgileBoard());
        const targetSprint =
          defaultAgileMock.sprints[defaultAgileMock.sprints.length - 1];
        expect(apiMock.agile.getSprint).toHaveBeenCalledWith(
          targetSprint.agile.id,
          targetSprint.id,
          actions.PAGE_SIZE,
          0,
          undefined,
        );
      });
      it('should load cached sprint if it matches the board and if there is no matching items from `visitedSprints`', async () => {
        updateStore({
          agile: {
            profile: {
              defaultAgile: defaultAgileMock,
              visitedSprints: [],
            },
          },
        });
        await __setStorageState({
          agileLastSprint: defaultAgileMock.sprints[0],
        });
        await store.dispatch(actions.loadDefaultAgileBoard());
        const targetSprint =
          defaultAgileMock.sprints[defaultAgileMock.sprints.length - 1];
        expect(apiMock.agile.getSprint).toHaveBeenCalledWith(
          targetSprint.agile.id,
          defaultAgileMock.sprints[0].id,
          actions.PAGE_SIZE,
          0,
          undefined,
        );
      });
    });
  });
  describe('Load sprint', () => {
    describe('Load sprint issues', () => {
      beforeEach(async () => {
        await store.dispatch(actions.loadSprintIssues(sprintMock));
        storeActions = store.getActions();
      });
      it('should load sprint issues', () => {
        expect(apiMock.agile.getAgileIssues).toHaveBeenCalledWith([
          {
            id: issueMock.id,
          },
        ]);
      });
      it('should stop loading sprint', async () => {
        expect(storeActions[2]).toEqual({
          type: SET_PROGRESS,
          isInProgress: false,
        });
      });
      it('should cache a sprint with loaded issues', async () => {
        await expect(getStorageState().agileLastSprint.id).toEqual(
          sprintIdMock,
        );
      });
    });
    describe('Success loading', () => {
      beforeEach(async () => {
        await setLoadSprintExpectation();
      });
      it('should load sprint', () => {
        expect(apiMock.agile.getSprint).toHaveBeenCalledWith(
          sprintMock.agile.id,
          sprintMock.id,
          actions.PAGE_SIZE,
          0,
          undefined,
        );
      });
      it('should show loading sprint', () => {
        expect(storeActions[1]).toEqual({
          type: SET_PROGRESS,
          isInProgress: true,
        });
      });
      it('should receive sprint', () => {
        expect(storeActions[2]).toEqual({
          type: types.RECEIVE_SPRINT,
          sprint: sprintMock,
        });
      });
    });
    describe('Error loading', () => {
      it('should stop loading if loaded sprint is invalid', async () => {
        apiMock.agile.getSprint = jest.fn(() => null);
        notification.setNotificationComponent({
          show: jest.fn(),
        });
        await setLoadSprintExpectation();
        expect(storeActions[0]).toEqual({
          type: types.AGILE_ERROR,
          error: null,
        });
        expect(storeActions[1]).toEqual({
          type: SET_PROGRESS,
          isInProgress: true,
        });
        expect(storeActions[2]).toEqual({
          type: types.RECEIVE_SPRINT,
          sprint: null,
        });
        expect(storeActions[3]).toEqual({
          //loading sprint issues
          type: SET_PROGRESS,
          isInProgress: true,
        });
        expect(storeActions[4]).toEqual({
          type: types.AGILE_ERROR,
          error: new Error('Could not load requested sprint issues'),
        });
        expect(storeActions[5]).toEqual({
          type: SET_PROGRESS,
          isInProgress: false,
        });
      });
    });
  });
  describe('getAgileUserProfile', () => {
    const NULL_AGILE_STATE = {};
    it('should return Agile user profile', async () => {
      const agileUserProfile = await store.dispatch(
        actions.getAgileUserProfile(),
      );
      expect(agileUserProfile).toEqual(agileUserProfileMock);
    });
    it('should not throw if agile profile is missing in a store', async () => {
      updateStore({
        agile: {
          profile: null,
        },
      });
      const agileUserProfile = await store.dispatch(
        actions.getAgileUserProfile(),
      );
      expect(agileUserProfile).toEqual(NULL_AGILE_STATE);
    });
    it('should not throw if agile is missing in a store', async () => {
      updateStore({});
      const agileUserProfile = await store.dispatch(
        actions.getAgileUserProfile(),
      );
      expect(agileUserProfile).toEqual(NULL_AGILE_STATE);
    });
  });
});

async function setLoadSprintExpectation(
  sprintId: string | null | undefined,
  agileId: string | null | undefined,
  query: string | null | undefined,
) {
  await store.dispatch(
    actions.loadSprint(
      agileId || sprintMock.agile.id,
      sprintId || sprintMock.id,
      query,
    ),
  );
  storeActions = store.getActions();
  return storeActions;
}

function updateStore(state: Record<string, any> | null | undefined = {}) {
  store = storeMock(state);
}

function createSprintMock(
  id: string,
  agileSprints: Sprint[] | null | undefined,
) {
  const agileId = `agileId-of-${id}`;
  const sprints =
    agileSprints &&
    agileSprints.map(it => {
      it.agile.id = agileId;
      return it;
    });
  return {
    id: id,
    agile: {
      id: agileId,
      sprints: sprints,
    },
    board: {
      trimmedSwimlanes: [
        {
          cells: [
            {
              issues: [issueMock],
            },
          ],
        },
      ],
    },
  };
}

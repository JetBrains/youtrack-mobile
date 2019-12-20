/* @flow */

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from './board-actions';
import * as types from './board-action-types';
import animation from '../../components/animation/animation';
import * as notification from '../../components/notification/notification';
import type {AgileUserProfile, Board, Sprint} from '../../flow/Agile';

let apiMock;
let store;
let agileUserProfileMock: AgileUserProfile;
let agileMock: Board;
let sprintMock: Sprint;
let storeActions;
const sprintIdMock = 'foo';

const getApi = () => apiMock;
const middlewares = [thunk.withExtraArgument(getApi)];
const storeMock = configureMockStore(middlewares);

describe('Agile board async actions', () => {
  afterEach(() => {jest.clearAllMocks();});

  beforeEach(() => {
    animation.layoutAnimation = jest.fn();

    sprintMock = createSprintMock(sprintIdMock, [
      createSprintMock(sprintIdMock),
      createSprintMock('bar')
    ]);
    agileMock = sprintMock.agile;

    agileUserProfileMock = {
      defaultAgile: agileMock,
      visitedSprints: [
        createSprintMock('baz'),
        createSprintMock('boo'),
        sprintMock
      ]
    };

    apiMock = {
      agile: {
        getSprint: jest.fn(() => sprintMock),
        getAgileUserProfile: jest.fn(() => agileUserProfileMock),
        updateAgileUserProfile: jest.fn(() => sprintMock)
      }
    };

    updateStore({agile: {profile: agileUserProfileMock}});
  });


  describe('Agile user profile', () => {
    it('should load Agile user profile', async () => {
      updateStore();
      await store.dispatch(actions.loadAgileProfile());
      storeActions = store.getActions();

      expect(storeActions[0]).toEqual({
        type: types.RECEIVE_AGILE_PROFILE,
        profile: agileUserProfileMock
      });
    });

    it('should update Agile user profile', async () => {
      await setLoadSprintExpectation();

      expect(apiMock.agile.updateAgileUserProfile).toHaveBeenCalledWith(sprintMock.id);
    });
  });


  describe('Agile board', () => {
    it('should load last visited sprint', async () => {
      await store.dispatch(actions.loadDefaultAgileBoard());

      expect(apiMock.agile.getSprint).toHaveBeenCalledWith(
        agileMock.id,
        sprintIdMock,
        actions.PAGE_SIZE
      );
    });

    it('should load last profile default board`s sprint if there is no matching items from `visitedSprints`',
      async () => {
        updateStore({
          agile: {
            profile: {
              defaultAgile: agileMock,
              visitedSprints: []
            }
          }
        });
        await store.dispatch(actions.loadDefaultAgileBoard());

        const targetSprint = agileMock.sprints[agileMock.sprints.length - 1];
        expect(apiMock.agile.getSprint).toHaveBeenCalledWith(
          targetSprint.agile.id,
          targetSprint.id,
          actions.PAGE_SIZE
        );
      });

    it('should show select board manually control if default board is missing in an agile profile', async () => {
      updateStore({
        agile: {profile: {defaultAgile: null}}
      });

      await store.dispatch(actions.loadDefaultAgileBoard());
      storeActions = store.getActions();

      expect(apiMock.agile.getSprint).not.toHaveBeenCalled();
      expect(storeActions[1]).toEqual({
        type: types.NO_AGILE_SELECTED
      });

    });
  });


  describe('Load sprint', () => {
    describe('Success loading', () => {
      beforeEach(async () => {
        await setLoadSprintExpectation();
      });

      it('should fetch sprint', () => {
        expect(apiMock.agile.getSprint).toHaveBeenCalledWith(
          sprintMock.agile.id,
          sprintMock.id,
          actions.PAGE_SIZE
        );
      });

      it('should show loading sprint', () => {
        expect(storeActions[0]).toEqual({
          type: types.START_SPRINT_LOADING
        });
      });

      it('should receive sprint', () => {
        expect(storeActions[1]).toEqual({
          type: types.RECEIVE_SPRINT,
          sprint: sprintMock
        });
      });

      it('should hide loading sprint', () => {
        expect(storeActions[2]).toEqual({
          type: types.STOP_SPRINT_LOADING
        });
        expect(storeActions[3]).toEqual({
          isOutOfDate: false,
          type: types.IS_OUT_OF_DATE
        });
      });
    });

    describe('Error loading', () => {
      it('should show select board manually control if loaded sprint is invalid', async () => {
        apiMock.agile.getSprint = jest.fn(() => null);
        notification.setNotificationComponent({show: jest.fn()});
        await setLoadSprintExpectation();

        expect(storeActions[2]).toEqual({
          type: types.NO_AGILE_SELECTED
        });
      });
    });
  });


  describe('getAgileUserProfile', () => {
    const NULL_AGILE_STATE = {};
    it('should return Agile user profile', async () => {
      const agileUserProfile = await store.dispatch(actions.getAgileUserProfile());
      expect(agileUserProfile).toEqual(agileUserProfileMock);
    });

    it('should not throw if agile profile is missing in a store', async () => {
      updateStore({
        agile: {profile: null}
      });
      const agileUserProfile = await store.dispatch(actions.getAgileUserProfile());
      expect(agileUserProfile).toEqual(NULL_AGILE_STATE);
    });

    it('should not throw if agile is missing in a store', async () => {
      updateStore({});
      const agileUserProfile = await store.dispatch(actions.getAgileUserProfile());
      expect(agileUserProfile).toEqual(NULL_AGILE_STATE);
    });
  });
});


async function setLoadSprintExpectation(sprintId: ?string, agileId: ?string) {
  await store.dispatch(actions.loadSprint(
    agileId || sprintMock.agile.id,
    sprintId || sprintMock.id
  ));
  storeActions = store.getActions();
  return storeActions;
}

function updateStore(state: ?Object = {}) {
  store = storeMock(state);
}

function createSprintMock(id: string, agileSprints: ?Array<Sprint>) {
  const agileId = `agileId-${id}`;
  const sprints = agileSprints && agileSprints.map(it => {
    it.agile.id = agileId;
    return it;
  });

  return {
    id: id,
    agile: {
      id: agileId,
      sprints: sprints
    }
  };
}

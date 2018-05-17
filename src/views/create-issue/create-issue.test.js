import * as actions from './create-issue-actions';
import * as types from './create-issue-action-types';

import {populateStorage, flushStoragePart} from '../../components/storage/storage';
import sinon from 'sinon';

const FAKE_PROJECT_ID = 'FAKE_PROJECT_ID';

describe('Issue creation actions', () => {
  let dispatch;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    dispatch = sinon.spy();
  });

  afterEach(() => sandbox.restore());

  it('should read stored draft ID if exists', async () => {
    await populateStorage();
    await flushStoragePart({projectId: FAKE_PROJECT_ID});
    await actions.loadStoredProject()(dispatch);

    dispatch.should.have.been.calledWith({type: types.SET_DRAFT_PROJECT_ID, projectId: FAKE_PROJECT_ID});
  });
});

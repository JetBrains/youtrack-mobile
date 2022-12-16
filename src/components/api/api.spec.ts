import Api from './api';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';

import * as feature from '../feature/feature';

describe('API', () => {
  const serverUrl = 'http://foo.bar';

  let authMock;
  const createApiInstance = (auth = authMock) => new Api(auth);

  beforeEach(() => {
    authMock = {
      refreshToken: sinon.spy(),
      authParams: {
        token_type: 'token type',
        access_token: 'fake token',
      },
      getAuthorizationHeaders: () => ({Authorization: 'token type fake token'}),
      config: {
        backendUrl: serverUrl,
      },
    };
  });

  afterEach(() => fetchMock.restore());

  it('should create instance', () => {
    createApiInstance().should.be.defined;
  });

  it('should store config', () => {
    createApiInstance().config.should.equal(authMock.config);
  });

  it('should construct issue URL', () => {
    createApiInstance().youTrackIssueUrl.should.equal('http://foo.bar/api/issues');
  });

  it('should make request', async () => {
    fetchMock.get(`${serverUrl}?$top=-1`, {foo: 'bar'});
    const res = await createApiInstance().makeAuthorizedRequest(serverUrl);
    res.foo.should.equal('bar');
  });

  it('should refresh token and make request again if outdated', async () => {
    const callSpy = sinon.spy();

    let isFirst = true;
    fetchMock.mock(`${serverUrl}?$top=-1`, (...args) => {
      callSpy(...args);

      if (isFirst) {
        isFirst = false;
        return 401;
      }
      return {foo: 'bar'};
    });

    const res = await createApiInstance().makeAuthorizedRequest(serverUrl);

    res.foo.should.equal('bar');
    authMock.refreshToken.should.have.been.called;
    callSpy.should.have.been.called.twice;
  });

  it('should load issue', async () => {
    fetchMock.mock(`^${serverUrl}/api/issues/test-id`, {id: 'issue-id', comments: [{author: {avatarUrl: 'http://foo.bar'}}]});
    const res = await createApiInstance().issue.getIssue('test-id');

    res.id.should.equal('issue-id');
  });

  it('should convert issue attachments', async () => {
    fetchMock.mock(`^${serverUrl}/api/issues/test-id`, {id: 'issue-id', comments: [], attachments: [
      {
        id: 'foo',
        url: '/persistent/123',
      },
    ]});
    const res = await createApiInstance().issue.getIssue('test-id');

    res.attachments[0].url.should.equal(`${serverUrl}/persistent/123`);
  });

  it('should handle relative avatar url in comments on loading comments', async () => {
    const relativeUrl = '/hub/users/123';
    fetchMock.mock(`^${serverUrl}/api/issues/test-id/comments`, [
      {
        id: 'foo',
        author: {
          avatarUrl: relativeUrl,
        },
      },
    ]);

    const comments = await createApiInstance().issue.getIssueComments('test-id');

    comments[0].author.avatarUrl.should.equal(`${serverUrl}${relativeUrl}`);
  });

  it('should handle relative avatar url in custom field possible values', async () => {
    const relativeUrl = '/hub/users/123';
    fetchMock.mock(`^${serverUrl}/api/admin/customFieldSettings/bundles`, [
      {avatarUrl: relativeUrl},
    ]);

    const res = await createApiInstance().getCustomFieldUserValues('test-id');

    res[0].avatarUrl.should.equal(`${serverUrl}${relativeUrl}`);
  });

  it('should post comment', async () => {
    fetchMock.post(`^${serverUrl}/api/issues/test-issue-id/comments`, {
      id: 'test-comment',
      author: {
        avatarUrl: 'http://foo.bar',
      },
    });
    const res = await createApiInstance().issue.submitComment('test-issue-id', {text: 'test comment text'});

    res.id.should.equal('test-comment');
  });

  it('should update existing comment if ID is provided', async () => {
    fetchMock.post(`^${serverUrl}/api/issues/test-issue-id/comments/123`, {
      id: 'test-comment',
      author: {
        avatarUrl: 'http://foo.bar',
      },
    });
    const res = await createApiInstance().issue.submitComment('test-issue-id', {text: 'test comment text', id: '123'});

    res.id.should.equal('test-comment');
  });

  it('should fix relative URL of author avatar after positng comment', async () => {
    const relativeUrl = '/hub/users/123';

    fetchMock.post(`^${serverUrl}/api/issues/test-issue-id/comments`, {
      id: 'test-comment',
      author: {
        avatarUrl: relativeUrl,
      },
    });
    const res = await createApiInstance().issue.submitComment('test-issue-id', {text: 'test comment text'});

    res.author.avatarUrl.should.equal(`${serverUrl}${relativeUrl}`);
  });


  describe('Get issues count', () => {
    let issuesApi;
    let response;
    beforeEach(() => {
      issuesApi = createApiInstance().issues;
      jest.spyOn(feature, 'checkVersion');
    });

    it('should get issues count using legacy REST endpoint', async () => {
      const responseMock = {value: 1};

      feature.checkVersion.mockReturnValueOnce(false);

      fetchMock.get(`^${serverUrl}/rest/issue/count?sync=false&filter=`, responseMock);
      response = await issuesApi.getIssuesCount();

      expect(response).toEqual(responseMock.value);
    });

    it('should get issues count using actual REST endpoint', async () => {
      feature.checkVersion.mockReturnValueOnce(true);

      const responseMock = {count: 1};
      fetchMock.post(`^${serverUrl}/api/issuesGetter/count?fields=count`, responseMock);
      response = await issuesApi.getIssuesCount();

      expect(response).toEqual(responseMock.count);
    });
  });


  describe('Support legacy API entry points', () => {
    let api;

    it('should be TRUE if the server version >= than 2022.3', () => {
      authMock.config.version = '2022.3';
      api = createApiInstance();
      expect(api.isActualAPI).toEqual(true);
      expect(api.user.apiUrl).toEqual(`${serverUrl}/api/users`);
      expect(api.issue.draftsURL).toEqual(`${serverUrl}/api/users/me/drafts`);
      expect(api.projects.projectsURL).toEqual(`${serverUrl}/api/admin/projects`);
    });

    it('should be TRUE if the server version < than 2022.3', () => {
      authMock.config.version = '2022.2';
      api = createApiInstance();
      expect(api.isActualAPI).toEqual(false);
      expect(api.user.apiUrl).toEqual(`${serverUrl}/api/admin/users`);
      expect(api.issue.draftsURL).toEqual(`${serverUrl}/api/admin/users/me/drafts`);
      expect(api.projects.projectsURL).toEqual(`${serverUrl}/api/admin/projects`);
    });
  });

});

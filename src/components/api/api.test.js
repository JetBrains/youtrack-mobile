import Api from './api';
import fetchMock from 'fetch-mock';
import sinon from 'sinon';

describe('API', () => {
  const serverUrl = 'http://foo.bar';

  let fakeAuth;
  const createInstance = (auth = fakeAuth) => new Api(auth);

  beforeEach(() => {
    fakeAuth = {
      refreshToken: sinon.spy(),
      authParams: {
        token_type: 'token type',
        access_token: 'fake token'
      },
      getAuthorizationHeaders: () => ({Authorization: 'token type fake token'}),
      config: {
        backendUrl: serverUrl
      }
    };
  });

  afterEach(() => fetchMock.restore());

  it('should create instance', () => {
    createInstance().should.be.defined;
  });

  it('should store config', () => {
    createInstance().config.should.equal(fakeAuth.config);
  });

  it('should construct issue URL', () => {
    createInstance().youTrackIssueUrl.should.equal('http://foo.bar/api/issues');
  });

  it('should make request', async () => {
    fetchMock.get(`${serverUrl}?$top=-1`, {foo: 'bar'});
    const res = await createInstance().makeAuthorizedRequest(serverUrl);
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

    const res = await createInstance().makeAuthorizedRequest(serverUrl);

    res.foo.should.equal('bar');
    fakeAuth.refreshToken.should.have.been.called;
    callSpy.should.have.been.called.twice;
  });

  it('should load issue', async () => {
    fetchMock.mock(`^${serverUrl}/api/issues/test-id`, {id: 'issue-id', comments: [{author: {avatarUrl: 'http://foo.bar'}}]});
    const res = await createInstance().issue.getIssue('test-id');

    res.id.should.equal('issue-id');
  });

  it('should convert issue attachments', async () => {
    fetchMock.mock(`^${serverUrl}/api/issues/test-id`, {id: 'issue-id', comments: [], attachments: [
      {
        id: 'foo',
        url: '/persistent/123'
      }
    ]});
    const res = await createInstance().issue.getIssue('test-id');

    res.attachments[0].url.should.equal(`${serverUrl}/persistent/123`);
  });

  it('should handle relative avatar url in comments on loading comments', async () => {
    const relativeUrl = '/hub/users/123';
    fetchMock.mock(`^${serverUrl}/api/issues/test-id/comments`, [
      {
        id: 'foo',
        author: {
          avatarUrl: relativeUrl
        }
      }
    ]);

    const comments = await createInstance().issue.getIssueComments('test-id');

    comments[0].author.avatarUrl.should.equal(`${serverUrl}${relativeUrl}`);
  });

  it('should handle relative avatar url in custom field possible values', async () => {
    const relativeUrl = '/hub/users/123';
    fetchMock.mock(`^${serverUrl}/api/admin/customFieldSettings/bundles`, [
      {avatarUrl: relativeUrl}
    ]);

    const res = await createInstance().getCustomFieldUserValues('test-id');

    res[0].avatarUrl.should.equal(`${serverUrl}${relativeUrl}`);
  });

  it('should post comment', async () => {
    fetchMock.post(`^${serverUrl}/api/issues/test-issue-id/comments`, {
      id: 'test-comment',
      author: {
        avatarUrl: 'http://foo.bar'
      }
    });
    const res = await createInstance().issue.submitComment('test-issue-id', {text: 'test comment text'});

    res.id.should.equal('test-comment');
  });

  it('should update existing comment if ID is provided', async () => {
    fetchMock.post(`^${serverUrl}/api/issues/test-issue-id/comments/123`, {
      id: 'test-comment',
      author: {
        avatarUrl: 'http://foo.bar'
      }
    });
    const res = await createInstance().issue.submitComment('test-issue-id', {text: 'test comment text', id: '123'});

    res.id.should.equal('test-comment');
  });

  it('should fix relative URL of author avatar after positng comment', async () => {
    const relativeUrl = '/hub/users/123';

    fetchMock.post(`^${serverUrl}/api/issues/test-issue-id/comments`, {
      id: 'test-comment',
      author: {
        avatarUrl: relativeUrl
      }
    });
    const res = await createInstance().issue.submitComment('test-issue-id', {text: 'test comment text'});

    res.author.avatarUrl.should.equal(`${serverUrl}${relativeUrl}`);
  });
});

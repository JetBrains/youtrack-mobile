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
    fetchMock.get('*', {foo: 'bar'});
    const res = await createInstance().makeAuthorizedRequest(serverUrl);
    res.foo.should.equal('bar');
  });

  it('should refresh token and make request again if outdated', async () => {
    const callSpy = sinon.spy();

    let isFirst = true;
    fetchMock.mock(serverUrl, (...args) => {
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
});

import React from 'react';
import {NativeModules} from 'react-native';
import {LogIn} from './log-in';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('LogIn', () => {
  let defaultProps;

  beforeEach(() => {
    const fakeAuth = {
      config: {
        backendUrl: 'http://ytbackend',
        auth: {
          serverUri: 'http://hub'
        }
      },
      obtainTokenByCredentials: sinon.spy(),
      obtainTokenByOAuthCode: sinon.spy()
    };

    defaultProps = {
      auth: fakeAuth,
      onLogIn: sinon.spy(),
      onChangeServerUrl: sinon.spy()
    };

    NativeModules.RNKeychainManager.getInternetCredentialsForServer = sinon.stub().returns(Promise.resolve({username: 'foo', password: 'bar'}));
    NativeModules.RNKeychainManager.setInternetCredentialsForServer = sinon.spy();
  });

  function shallowRender(props) {
    return shallow(<LogIn {...defaultProps} {...props}/>);
  }

  it('should render', () => {
    shallowRender({}).should.be.defined;
  });

  it('should log in with credentials', () => {
    const wrapper = shallowRender({});

    const instance = wrapper.instance();
    instance.logInViaCredentials = sinon.spy();
    instance.forceUpdate();

    wrapper.find({testID: 'login-input'}).simulate('change', {target: {value: 'foo'}});
    wrapper.find({testID: 'password-input'}).simulate('change', {target: {value: 'bar'}});
    wrapper.find({testID: 'log-in'}).simulate('press');

    instance.logInViaCredentials.should.have.been.called;
  });
});

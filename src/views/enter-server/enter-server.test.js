import EnterServer from './enter-server';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import renderer from 'react-test-renderer';

describe('EnterServer', () => {
  const serverUrl = 'http://foo.com';
  let connectToYouTrack;
  let onCancel;
  let wrapper;
  let waitForNextTick;
  let connectPromise;

  function renderComponent(url = serverUrl) {
    wrapper = shallow(<EnterServer serverUrl={url} connectToYoutrack={connectToYouTrack} onCancel={onCancel}/>);
  }

  beforeEach(() => {
    connectPromise = Promise.resolve({foo: 'bar'});
    waitForNextTick = () => new Promise(resolve => setTimeout(resolve));

    connectToYouTrack = sinon.spy(() => connectPromise);
    onCancel = sinon.spy();

    renderComponent();
  });

  it('should render', () => {
    wrapper.should.be.defined;
  });

  it('should connect to youtrack', async() => {
    const connectButton = wrapper.find(TouchableOpacity);
    connectButton.simulate('press');
    await waitForNextTick();

    connectToYouTrack.should.have.been.calledWith(serverUrl);
  });

  it('should add protocol if url entered has no one', async() => {
    renderComponent('foo.bar');
    wrapper.find('TouchableOpacity').simulate('press');
    await waitForNextTick();

    connectToYouTrack.should.have.been.calledWith('https://foo.bar');
  });

  it('should replace HTTP with HTTPS on cloud instance', async() => {
    renderComponent('http://foo.myjetbrains.com');
    wrapper.find('TouchableOpacity').simulate('press');
    await waitForNextTick();

    connectToYouTrack.should.have.been.calledWith('https://foo.myjetbrains.com');
  });

  it('should strip wrapping spaces', async() => {
    renderComponent('   foo.bar ');
    wrapper.find('TouchableOpacity').simulate('press');
    await waitForNextTick();

    connectToYouTrack.should.have.been.calledWith('https://foo.bar');
  });

  it('should strip tailing slash', async() => {
    renderComponent('http://foo.bar/');
    wrapper.find('TouchableOpacity').simulate('press');
    await waitForNextTick();

    connectToYouTrack.should.have.been.calledWith('http://foo.bar');
  });

  it('should try next URL on failure if protocol is entered', async() => {
    connectPromise = Promise.reject({message: 'test reject'});
    const connectButton = wrapper.find(TouchableOpacity);

    connectButton.simulate('press');
    await waitForNextTick();
    connectButton.simulate('press');
    await waitForNextTick();

    connectToYouTrack.should.have.been.calledWith('http://foo.com');
    connectToYouTrack.should.have.been.calledWith('http://foo.com/youtrack');
    connectToYouTrack.should.have.been.calledWith('http://foo.com/rest/workflow/version');
  });


  it('should try next URL on failure if no protocol entered', async() => {
    connectPromise = Promise.reject({message: 'test reject'});
    renderComponent('foo.bar');
    const connectButton = wrapper.find(TouchableOpacity);

    connectButton.simulate('press');
    await waitForNextTick();
    connectButton.simulate('press');
    await waitForNextTick();
    connectButton.simulate('press');
    await waitForNextTick();
    connectButton.simulate('press');
    await waitForNextTick();

    connectToYouTrack.should.have.been.calledWith('https://foo.bar');
    connectToYouTrack.should.have.been.calledWith('https://foo.bar/youtrack');
    connectToYouTrack.should.have.been.calledWith('http://foo.bar');
    connectToYouTrack.should.have.been.calledWith('http://foo.bar/youtrack');
    connectToYouTrack.should.have.been.calledWith('http://foo.bar/rest/workflow/version');
  });

  it('should stop and display error if IncompatibleYouTrackError throwed', async() => {
    connectPromise = Promise.reject({isIncompatibleYouTrackError: true, message: 'Incompatible youtrack'});

    wrapper.find('TouchableOpacity').simulate('press');
    await waitForNextTick();

    wrapper.state('error').message.should.equal('Incompatible youtrack');
  });

  it('should not allow empty input', () => {
    const instance = shallow(
      <EnterServer serverUrl={''} connectToYoutrack={connectToYouTrack} onCancel={onCancel}/>
    ).instance();
    instance.isValidInput().should.be.false;
  });

  it('should not allow AT in server input (to not confuse users with email)', () => {
    const instance = shallow(
      <EnterServer serverUrl={'foo@bar.com'} connectToYoutrack={connectToYouTrack} onCancel={onCancel}/>
    ).instance();

    instance.isValidInput().should.be.false;
  });

  it('should allow not empty input', () => {
    const instance = shallow(
      <EnterServer serverUrl={'someserver'} connectToYoutrack={connectToYouTrack} onCancel={onCancel}/>
    ).instance();

    instance.isValidInput().should.be.true;
  });
});

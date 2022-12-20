import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {DEFAULT_THEME} from 'components/theme/theme';
import {EnterServer} from './enter-server';
import {ThemeContext} from 'components/theme/theme-context';
describe('EnterServer', () => {
  const serverUrl = 'http://example.com';
  let connectToYouTrack;
  let onCancel;
  let connectPromise;
  beforeEach(() => {
    connectPromise = Promise.resolve({
      foo: 'bar',
    });
    connectToYouTrack = jest.fn(() => connectPromise);
    onCancel = jest.fn();
  });

  function doRender(url = '') {
    return render(
      <ThemeContext.Provider
        value={{
          uiTheme: DEFAULT_THEME,
        }}
      >
        <EnterServer
          serverUrl={url}
          connectToYoutrack={connectToYouTrack}
          onCancel={onCancel}
        />
      </ThemeContext.Provider>,
    );
  }

  describe('Render', () => {
    it('should render screen', () => {
      const {getByTestId} = doRender();
      expect(getByTestId('test:id/enterServer')).toBeTruthy();
      expect(getByTestId('test:id/enterServerBackButton')).toBeTruthy();
      expect(getByTestId('test:id/server-url')).toBeTruthy();
      expect(getByTestId('test:id/enterServerHint')).toBeTruthy();
      expect(getByTestId('test:id/next')).toBeTruthy();
      expect(getByTestId('test:id/enterServerHint')).toBeTruthy();
      expect(getByTestId('test:id/enterServerHelpLink')).toBeTruthy();
    });
  });
  describe('Connect to a server', () => {
    it('should connect to server', () => {
      const {getByTestId} = doRender(serverUrl);
      fireEvent.press(getByTestId('test:id/next'));
      expect(connectToYouTrack).toHaveBeenCalledWith(serverUrl);
    });
    it('should add protocol for entered URL', () => {
      const {getByTestId} = doRender(serverUrl);
      fireEvent.press(getByTestId('test:id/next'));
      expect(connectToYouTrack).toHaveBeenCalledWith(serverUrl);
    });
    it('should replace HTTP with HTTPS for a cloud instance', () => {
      const {getByTestId} = doRender('http://foo.myjetbrains.com');
      fireEvent.press(getByTestId('test:id/next'));
      expect(connectToYouTrack).toHaveBeenCalledWith(
        'https://foo.myjetbrains.com',
      );
    });
    it('should trim white spaces', () => {
      const {getByTestId} = doRender('   foo.bar ');
      fireEvent.press(getByTestId('test:id/next'));
      expect(connectToYouTrack).toHaveBeenCalledWith('https://foo.bar');
    });
    it('should remove tailing slash from URL', () => {
      const {getByTestId} = doRender('http://foo.bar/');
      fireEvent.press(getByTestId('test:id/next'));
      expect(connectToYouTrack).toHaveBeenCalledWith('http://foo.bar');
    });
    it('should try next URL on failure if protocol is entered', async () => {
      connectPromise = Promise.reject('ERROR');
      const {getByTestId} = doRender('http://foo.bar/');
      fireEvent.press(getByTestId('test:id/next'));
      await expect(connectToYouTrack).toHaveBeenCalledWith('http://foo.bar');
      await expect(connectToYouTrack).toHaveBeenCalledWith(
        'http://foo.bar/youtrack',
      );
      await expect(connectToYouTrack).toBeCalledTimes(2);
    });
    it('should try next URL on failure if no protocol entered', async () => {
      connectPromise = Promise.reject('ERROR');
      const {getByTestId} = doRender('foo.bar');
      fireEvent.press(getByTestId('test:id/next'));
      await expect(connectToYouTrack).toHaveBeenCalledWith('https://foo.bar');
      await expect(connectToYouTrack).toHaveBeenCalledWith(
        'https://foo.bar/youtrack',
      );
      await expect(connectToYouTrack).toHaveBeenCalledWith('http://foo.bar');
      await expect(connectToYouTrack).toHaveBeenCalledWith(
        'http://foo.bar/youtrack',
      );
      await expect(connectToYouTrack).toBeCalledTimes(4);
    });
  });
  describe('EnterServer', () => {
    let instance;
    beforeEach(() => {
      instance = new EnterServer({});
    });
    describe('onApplyServerUrlChange', () => {
      it('should throw `Incompatible` error', async () => {
        const incompatibleError = {
          isIncompatibleYouTrackError: true,
          message: 'Incompatible youtrack',
        };
        connectPromise = Promise.reject(incompatibleError);
        instance = new EnterServer({
          serverUrl: 'foo.bar',
          connectToYoutrack: connectToYouTrack,
        });
        const msg = await instance.onApplyServerUrlChange();
        expect(msg).toEqual(incompatibleError.message);
      });
    });
    describe('isValidInput', () => {
      it('should allow not empty URL', async () => {
        expect(createInstance('').isValidInput()).toEqual(false);
        expect(createInstance(' ').isValidInput()).toEqual(false);
      });
      it('should validate server URL', () => {
        expect(createInstance('ab/').isValidInput()).toEqual(true);
        expect(createInstance('ab.c').isValidInput()).toEqual(true);
        expect(createInstance('ab.cd').isValidInput()).toEqual(true);
        expect(createInstance('a.aus').isValidInput()).toEqual(true);
        expect(createInstance('a.youtrack.i/').isValidInput()).toEqual(true);
        expect(createInstance('www.a.au').isValidInput()).toEqual(true);
        expect(createInstance('www.a.b.cd').isValidInput()).toEqual(true);
        expect(createInstance('www.a.bc/youtrack/me').isValidInput()).toEqual(
          true,
        );
        expect(createInstance('https://www.a.bc').isValidInput()).toEqual(true);
        expect(createInstance('https://a.bc').isValidInput()).toEqual(true);
        expect(createInstance('http://www.a.bc').isValidInput()).toEqual(true);
        expect(createInstance('http://a.bc').isValidInput()).toEqual(true);
      });

      function createInstance(serverUrl) {
        return new EnterServer({
          serverUrl,
        });
      }
    });
    describe('getPossibleUrls', () => {
      it('should return possible base URLs for a custom domain', () => {
        expect(instance.getPossibleUrls('myyOutrack.com')).toEqual([
          'https://myyoutrack.com',
          'https://myyoutrack.com/youtrack',
          'http://myyoutrack.com',
          'http://myyoutrack.com/youtrack',
        ]);
      });
      it('should return possible base URLs for `youtrack.cloud` instances', () => {
        [
          'htTp://example.yOutrack.CLOUD',
          'htTps://example.yOutrack.CLOUD',
        ].forEach(utl => {
          expect(instance.getPossibleUrls(utl)).toEqual([
            'https://example.youtrack.cloud',
            'https://example.youtrack.cloud/youtrack',
          ]);
        });
      });
      it('should return possible base URLs for `myjetbrains.com` instances', () => {
        [
          'htTp://exAmple.MyJetbrains.Com',
          'htTps://exAmple.MyJetbrains.Com',
        ].forEach(utl => {
          expect(instance.getPossibleUrls(utl)).toEqual([
            'https://example.myjetbrains.com',
            'https://example.myjetbrains.com/youtrack',
          ]);
        });
      });
    });
  });
});
// @ts-ignore
import {Analytics, Hits} from 'react-native-google-analytics';

import * as ga from './usage';
import appPackage from '../../../package.json';

const paramsMock = {};
jest.mock('react-native-google-analytics', () => ({
  Analytics: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue(paramsMock),
  })),
  Hits: {
    ScreenView: jest.fn().mockReturnValue(paramsMock),
    Event: jest.fn().mockReturnValue(paramsMock),
  },
}));


describe('Google Analytics', () => {
  beforeEach(() => {
    ga.reset();
    ga.default.init(false);
  });

  it('should create GA instance', async () => {
    const instance: Analytics = await ga.getInstance();

    await expect(instance.send).toBeTruthy();
  });

  it('should enable analytics', async () => {
    expect(ga.isAnalyticsEnabled).toEqual(false);
    ga.default.init(true);

    expect(ga.isAnalyticsEnabled).toEqual(true);
  });

  it('should disable analytics', async () => {
    ga.default.init(true);
    expect(ga.isAnalyticsEnabled).toEqual(true);
    ga.default.init(false);

    expect(ga.isAnalyticsEnabled).toEqual(false);
  });


  describe('Analytics enabled', () => {
    beforeEach(() => {
      ga.default.init(true);
    });

    it('should create GA instance if it`s not created yet before sending an event', async () => {
      expect(ga.gaAnalyticInstance).toEqual(null);
      await ga.default.trackScreenView('');

      await expect(ga.gaAnalyticInstance).toBeTruthy();
    });

    it('should track an event', async () => {
      expect(ga.gaAnalyticInstance).toEqual(null);
      await ga.default.trackEvent('');

      await expect(ga.gaAnalyticInstance.send).toHaveBeenCalledWith(paramsMock);
    });

    it('should create screen view event params and track screen view', async () => {
      const screenName: string = 'screenName';
      await ga.default.trackScreenView(screenName);

      await expect(Hits.ScreenView).toHaveBeenCalledWith(
        'YouTrack Mobile',
        screenName,
        appPackage.version
      );
      await expect(ga.gaAnalyticInstance.send).toHaveBeenCalledWith(paramsMock);
    });

  });

});

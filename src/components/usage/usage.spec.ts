import * as usage from './usage';

describe('Analytics', () => {
  it('should be enabled by default', async () => {
    expect(usage.isAnalyticsEnabled).toEqual(false);
    usage.default.init(true);

    expect(usage.isAnalyticsEnabled).toEqual(true);
  });

  it('should disable analytics', async () => {
    usage.default.init(true);
    expect(usage.isAnalyticsEnabled).toEqual(true);
    usage.default.init(false);

    expect(usage.isAnalyticsEnabled).toEqual(false);
  });


  describe('Analytic events', () => {
    beforeEach(() => {
      usage.default.init(true);
    });

    it('should track an event without params', () => {
      usage.default.trackEvent('event name');

      expect(usage.default.getInstance().logEvent).toHaveBeenCalledWith('event_name', {});
    });

    it('should track an event with message', () => {
      usage.default.trackEvent('eventName', 'Success');

      expect(usage.default.getInstance().logEvent).toHaveBeenCalledWith('eventName', {message: 'Success'});
    });

    it('should track an event with message and extra data', () => {
      usage.default.trackEvent('eventName', 'Success', {id: 1});

      expect(usage.default.getInstance().logEvent).toHaveBeenCalledWith('eventName', {message: 'Success', id: 1});
    });

    it('should track an event with message and extra data 2', () => {
      usage.default.trackEvent('eventName', null, {id: 1});

      expect(usage.default.getInstance().logEvent).toHaveBeenCalledWith('eventName', {id: 1});
    });

    it('should create screen view event params and track screen view', async () => {
      const screenName: string = 'ScreenName';
      await usage.default.trackScreenView(screenName);

      await expect(usage.default.getInstance().logScreenView).toHaveBeenCalledWith({
        screen_name: screenName,
        screen_class: screenName,
      });
    });

  });

});

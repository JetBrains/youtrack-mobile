import RNLocalize from 'react-native-localize';

import * as storage from 'components/storage/storage';
import mocks from '../../../test/mocks';
import {__setStorageState} from 'components/storage/storage';
import {absDate, DEFAULT_DATE_PATTERN, DEFAULT_DATE_TIME_PATTERN, ytDate} from 'components/date/date';


describe('Date', () => {
  beforeEach(() => {
    __setStorageState({});
  });


  describe('absDate', function () {
    const dateInMillis = 1551448813974;
    const dateMock = new Date(dateInMillis);
    const formatDateParams = {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'};
    const _Date = Date;

    beforeEach(() => mockGlobalDateObj(dateMock));

    afterEach(() => global.Date = _Date);

    it('should return absolute date with provided locale string', () => {
      const localeString = 'en-EN';
      absDate(dateInMillis, localeString);

      expect(dateMock.toLocaleTimeString).toHaveBeenCalledWith([localeString], formatDateParams);
    });

    it('should return absolute date with no locale string', () => {
      const defaultDeviceLocale = 'ko-KO';
      jest.spyOn(RNLocalize, 'getLocales').mockReturnValueOnce([{languageTag: defaultDeviceLocale, isRTL: false}, {languageTag: 'us-US', isRTL: false}]);
      absDate(dateInMillis);

      expect(dateMock.toLocaleTimeString).toHaveBeenCalledWith(defaultDeviceLocale, formatDateParams);
    });


    function mockGlobalDateObj(date) {
      date.toLocaleTimeString = jest.fn();
      global.Date = class extends _Date {
        constructor() {
          super();
          return date;
        }
      };
    }
  });


  describe('ytDate', () => {
    let testDate;
    const actual = jest.requireActual('components/storage/storage');
    afterEach(() => {
      jest.restoreAllMocks();
      storage.getStorageState = actual.getStorageState;
    });
    beforeEach(() => {
      jest.spyOn(storage, 'getStorageState');
      testDate = new Date('March 20, 2020 17:48:30 GMT+01:00');
    });

    it('should return empty string if no date is provided', () => {
      expect(ytDate()).toEqual('');
      expect(ytDate(null)).toEqual('');
    });

    describe('Absolute dates', () => {

      describe('default format', () => {
        beforeEach(() => {
          storage.getStorageState.mockReturnValue(
            createStorageStateMock()
          );
        });

        it('should return date in a default format', () => {
          expect(ytDate(testDate)).toEqual('20 Mar 2020 17:48');
        });

        it('should return date without the time in a default format', () => {
          expect(ytDate(testDate, true)).toEqual('20 Mar 2020');
        });
      });

      describe('custom format', () => {
        beforeEach(() => {
          storage.getStorageState.mockReturnValue(
            createStorageStateMock('d MMM yyyy hh:mm aaa', 'd/MM/yyyy')
          );
        });

        it('should return date string from the user`s profile', () => {
          expect(ytDate(testDate)).toEqual('20 Mar 2020 05:48 pm');
        });

        it('should return date string from the user`s profile without the time', () => {
          expect(ytDate(testDate, true)).toEqual('20/03/2020');
        });
      });
    });

    describe('Relative dates', () => {
      beforeEach(() => {
        storage.getStorageState.mockReturnValue(
          createStorageStateMock(null, null, false)
        );
      });

      it('should return `just now`', () => {
        expect(ytDate(Date.now())).toEqual('just now');
      });

      it('should return date in minutes', () => {
        expect(ytDate(Date.now() - 60 * 1000 * 2)).toEqual('2 minutes ago');
      });

      it('should return date in hours', () => {
        expect(ytDate(Date.now() - 60 * 1000 * 60 * 2)).toEqual('about 2 hours ago');
      });

      it('should return date in years', () => {
        expect(ytDate(Date.now() - 60 * 1000 * 60 * 24 * 366)).toEqual('about 1 year ago');
      });
    });


    function createStorageStateMock(
      pattern = DEFAULT_DATE_TIME_PATTERN,
      datePattern = DEFAULT_DATE_PATTERN,
      useAbsoluteDates = true
    ) {
      return {
        currentUser: mocks.createUserMock({
          ytCurrentUser: {
            profiles: {
              appearance: {
                useAbsoluteDates,
              },
              general: {
                dateFieldFormat: {
                  pattern,
                  datePattern,
                },
              },
            },
          },
        }),
      };
    }
  });

});

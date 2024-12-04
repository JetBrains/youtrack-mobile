import * as storage from 'components/storage/storage';
import {__setStorageState} from 'components/storage/storage';

import mocks from 'test/mocks';
import {
  absDate,
  getFormattedDate,
  USER_DATE_FORMAT_DEFAULT_DATE_PATTERN,
  USER_DATE_FORMAT_DEFAULT_PATTERN,
  ytDate,
} from 'components/date/date';

import type {StorageState} from 'components/storage/storage';

describe('Date', () => {
  beforeEach(() => {
    __setStorageState({});
  });

  describe('ytDate', () => {
    let timestamp: number | undefined;
    afterEach(() => {
      jest.restoreAllMocks();
    });

    beforeEach(() => {
      jest.spyOn(storage, 'getStorageState');
      timestamp = new Date('March 20, 2020 17:48:30 GMT+01:00').getTime();
    });

    it('should return empty string if no date is provided', () => {
      expect(ytDate()).toEqual('');
      expect(ytDate(null as any)).toEqual('');
    });

    describe('Absolute dates', () => {
      describe('absDate', () => {
        it('should return abs date', () => {
          expect(absDate(new Date(0))).toEqual('1 Jan 1970 01:00');
        });
        it('should return abs date - 2 min before', () => {
          expect(absDate(new Date(0).getMilliseconds() - 60 * 1000 * 2)).toEqual('1 Jan 1970 00:58');
        });
      });

      describe('default format', () => {
        beforeEach(() => {
          (storage.getStorageState as jest.Mock).mockReturnValue(createStorageStateMock());
        });
        it('should return date in a default format', () => {
          expect(ytDate(timestamp)).toEqual('20 Mar 2020 17:48');
        });
        it('should return date without the time in a default format', () => {
          expect(ytDate(timestamp, true)).toEqual('20 Mar 2020');
        });
      });

      describe('custom format', () => {
        beforeEach(() => {
          (storage.getStorageState as jest.Mock).mockReturnValue(
            createStorageStateMock('d MMM yyyy hh:mm aaa', 'd/MM/yyyy')
          );
        });
        it('should return date string from the user`s profile', () => {
          expect(ytDate(timestamp)).toEqual('20 Mar 2020 05:48 pm');
        });
        it('should return date string from the user`s profile without the time', () => {
          expect(ytDate(timestamp, true)).toEqual('20/03/2020');
        });
      });
    });

    describe('Relative dates', () => {
      beforeEach(() => {
        (storage.getStorageState as jest.Mock).mockReturnValue(createStorageStateMock('', '', false));
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
      pattern = USER_DATE_FORMAT_DEFAULT_PATTERN,
      datePattern = USER_DATE_FORMAT_DEFAULT_DATE_PATTERN,
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

  describe('getFormattedDate', () => {
    let date: Date;

    beforeEach(() => {
      date = new Date('2023-01-20T15:30:00');
    });

    it('should return formatted date string based on the given pattern', () => {
      expect(getFormattedDate(date, 'd MMM yyyy')).toEqual('20 Jan 2023');
    });

    it('should return January as 01 based on the given pattern', () => {
      expect(getFormattedDate(date, 'yyyy-MM-dd')).toEqual('2023-01-20');
    });

    it('should handle invalid dates gracefully', () => {
      expect(() => getFormattedDate(new Date('invalid-date'), 'd MMM yyyy')).toThrow();
    });

    it('should return locale-specific formatted date', () => {
      const ss = {currentUser: {ytCurrentUser: {profiles: {general: {locale: {language: 'en-US'}}}}}} as StorageState;
      jest.spyOn(storage, 'getStorageState').mockReturnValue(ss);
      expect(getFormattedDate(date, 'PPPP')).toContain('Friday, January 20th, 2023');
    });
  });
});

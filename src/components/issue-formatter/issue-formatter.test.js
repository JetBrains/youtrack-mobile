import RNLocalize from 'react-native-localize';

import {
  getEntityPresentation,
  getVisibilityPresentation,
  absDate,
  getReadableID,
  ytDate,
  DEFAULT_DATE_TIME_PATTERN, DEFAULT_DATE_PATTERN,
} from './issue-formatter';
import BaseAPI from '../api/api__base';
import mocks from '../../../test/mocks';


describe('Issue formatter', () => {

  describe('getEntityPresentation', function() {
    it('should return empty string if no parameter is provided', () => {
      getEntityPresentation().should.equal('');
    });

    it('should return empty string if no parameter has no field to return', () => {
      getEntityPresentation({}).should.equal('');
    });

    describe('Has ringId', () => {
      it('should return `fullName`', () => {
        const item = {
          ringId: 'id',
          fullName: 'fullName',
          name: 'name',
        };

        getEntityPresentation(item).should.equal(item.fullName);
      });

      it('should return `localizedName`', () => {
        const item = {
          ringId: 'id',
          name: 'name',
          localizedName: 'localizedName',
        };

        getEntityPresentation(item).should.equal(item.localizedName);
      });

      it('should return `name`', () => {
        const item = {
          ringId: 'id',
          login: 'login',
          name: 'name',
        };

        getEntityPresentation(item).should.equal(item.name);
      });

      it('should return `login`', () => {
        const item = {
          ringId: 'id',
          presentation: 'presentation',
          login: 'login',
        };

        getEntityPresentation(item).should.equal(item.login);
      });

      it('should return `presentation`', () => {
        const item = {
          ringId: 'id',
          presentation: 'presentation',
        };

        getEntityPresentation(item).should.equal(item.presentation);
      });
    });


    describe('Has no ringId', () => {
      it('should return `name` if `ringId` is missing', () => {
        const item = {
          fullName: 'fullName',
          name: 'name',
        };

        getEntityPresentation(item).should.equal(item.name);
      });

      it('should return `userName` if `ringId` is missing', () => {
        const item = {
          fullName: 'fullName',
          userName: 'name',
        };

        getEntityPresentation(item).should.equal(item.userName);
      });

      it('should return `login` if `ringId` is missing', () => {
        const item = {
          fullName: 'fullName',
          login: 'name',
        };

        getEntityPresentation(item).should.equal(item.login);
      });

    });

  });


  describe('getVisibilityPresentation', function() {
    it('should return null if no parameter is provided', () => {
      const visibilityPresentation = getVisibilityPresentation() === null;
      visibilityPresentation.should.be.true;
    });

    it('should return empty string if there are no `permittedGroups` and `permittedUsers`', () => {
      const visibilityPresentation = getVisibilityPresentation({});
      visibilityPresentation.should.equal('');
    });

    it('should return combined `permittedGroups` and `permittedUsers` presentation separated by comma', () => {
      const permittedUsers = [{
        login: 'userLogin',
      }];
      const permittedGroups = [{
        name: 'groupName',
      }];

      const visibilityPresentation = getVisibilityPresentation({
        visibility: {
          permittedGroups: permittedGroups,
          permittedUsers: permittedUsers,
        },
      });

      visibilityPresentation.should.equal(`${permittedGroups[0].name}, ${permittedUsers[0].login}`);
    });
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


    describe('getReadableID', () => {
      it('should return empty string if issue is not provided', () => {
        expect(getReadableID()).toEqual('');
      });

      it('should return empty string if there is no `idReadable` or `id`', () => {
        expect(getReadableID({})).toEqual('');
      });

      it('should return issue `idReadable` value', () => {
        const issueMock = {id: 'id', idReadable: 'idReadable'};

        expect(getReadableID(issueMock)).toEqual(issueMock.idReadable);
      });

      it('should return issue `id` value', () => {
        const issueMock = {id: 'id', type: 0};

        expect(getReadableID(issueMock)).toEqual(issueMock.id);
      });
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
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.spyOn(BaseAPI, 'getUser');
      testDate = new Date('March 20, 2020 17:48:30 GMT+01:00');
    });

    it('should return empty string if no date is provided', () => {
      expect(ytDate()).toEqual('');
      expect(ytDate(null)).toEqual('');
    });

    describe('default format', () => {
      beforeEach(() => {
        BaseAPI.getUser.mockReturnValueOnce(
          mocks.createUserMock(createUserProfileMock(DEFAULT_DATE_TIME_PATTERN, DEFAULT_DATE_PATTERN))
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
        BaseAPI.getUser.mockReturnValueOnce(
          mocks.createUserMock(createUserProfileMock('d MMM yyyy hh:mm aaa', 'd/MM/yyyy'))
        );
      });

      it('should return date string from the user`s profile', async () => {
        expect(ytDate(testDate)).toEqual('20 Mar 2020 05:48 pm');
      });

      it('should return date string from the user`s profile without the time', () => {
        expect(ytDate(testDate, true)).toEqual('20/03/2020');
      });
    });


    function createUserProfileMock(pattern, datePattern) {
      return {
        profiles: {
          general: {
            dateFieldFormat: {
              pattern,
              datePattern,
            },
          },
        },
      };
    }
  });

});

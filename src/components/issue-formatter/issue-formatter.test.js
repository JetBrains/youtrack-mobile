import {getEntityPresentation, getVisibilityPresentation, absDate} from './issue-formatter';
import sinon from 'sinon';

describe('getEntityPresentation', function() {
  it('should return empty string if no parameter is provided', () => {
    getEntityPresentation().should.equal('');
  });

  it('should return empty string if no parameter has no field to return', () => {
    getEntityPresentation({}).should.equal('');
  });

  it('should return `fullName`', () => {
    const item = {
      fullName: 'fullName',
      name: 'name',
    };

    getEntityPresentation(item).should.equal(item.fullName);
  });

  it('should return `localizedName`', () => {
    const item = {
      name: 'name',
      localizedName: 'localizedName'
    };

    getEntityPresentation(item).should.equal(item.localizedName);
  });

  it('should return `name`', () => {
    const item = {
      login: 'login',
      name: 'name',
    };

    getEntityPresentation(item).should.equal(item.name);
  });

  it('should return `login`', () => {
    const item = {
      presentation: 'presentation',
      login: 'login',
    };

    getEntityPresentation(item).should.equal(item.login);
  });

  it('should return `presentation`', () => {
    const item = {
      presentation: 'presentation'
    };

    getEntityPresentation(item).should.equal(item.presentation);
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
      login: 'userLogin'
    }];
    const permittedGroups = [{
      name: 'groupName'
    }];

    const visibilityPresentation = getVisibilityPresentation({
      visibility: {
        permittedGroups: permittedGroups,
        permittedUsers: permittedUsers
      }
    });

    visibilityPresentation.should.equal(`${permittedGroups[0].name}, ${permittedUsers[0].login}`);
  });
});


describe('absDate', function () {
  const dateInMillis = 1551448813974;
  const dateMock = new Date(dateInMillis);
  const formatDateParams = {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'};
  const _Date = Date;

  beforeEach(() => {
    dateMock.toLocaleTimeString = sinon.spy();
    global.Date = class extends _Date {
      constructor() {
        super();
        return dateMock;
      }
    };
  });

  afterEach(() => global.Date = _Date);

  it('should return absolute date with provided locale string', () => {
    const localeString = 'en-US';
    absDate(dateInMillis, localeString);

    dateMock.toLocaleTimeString.should.have.been.calledWith([localeString], formatDateParams);
  });
  it('should return absolute date with no locale string', () => {
    absDate(dateInMillis);

    dateMock.toLocaleTimeString.should.have.been.calledWith([], formatDateParams);
  });
});



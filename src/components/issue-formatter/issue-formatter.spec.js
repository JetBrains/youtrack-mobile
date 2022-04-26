import {getEntityPresentation, getVisibilityPresentation} from './issue-formatter';

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
});

import {
  getEntityPresentation,
  getVisibilityPresentation,
} from './issue-formatter';

describe('Issue formatter', () => {
  describe('getEntityPresentation', function () {
    it('should return empty string if no parameter is provided', () => {
      expect(getEntityPresentation()).toBe('');
    });

    it('should return empty string if no parameter has no field to return', () => {
      expect(getEntityPresentation({})).toBe('');
    });

    describe('Has ringId', () => {
      it('should return `fullName`', () => {
        const item = {
          ringId: 'id',
          fullName: 'fullName',
          name: 'name',
        };

        expect(getEntityPresentation(item)).toBe(item.fullName);
      });

      it('should return `localizedName`', () => {
        const item = {
          ringId: 'id',
          name: 'name',
          localizedName: 'localizedName',
        };

        expect(getEntityPresentation(item)).toBe(item.localizedName);
      });

      it('should return `name`', () => {
        const item = {
          ringId: 'id',
          login: 'login',
          name: 'name',
        };

        expect(getEntityPresentation(item)).toBe(item.name);
      });

      it('should return `login`', () => {
        const item = {
          ringId: 'id',
          presentation: 'presentation',
          login: 'login',
        };
        expect(getEntityPresentation(item)).toBe(item.login);
      });

      it('should return `presentation`', () => {
        const item = {
          ringId: 'id',
          presentation: 'presentation',
        };

        expect(getEntityPresentation(item)).toBe(item.presentation);
      });
    });

    describe('Has no ringId', () => {
      it('should return `name` if `ringId` is missing', () => {
        const item = {
          fullName: 'fullName',
          name: 'name',
        };

        expect(getEntityPresentation(item)).toBe(item.name);
      });

      it('should return `userName` if `ringId` is missing', () => {
        const item = {
          fullName: 'fullName',
          userName: 'name',
        };

        expect(getEntityPresentation(item)).toBe(item.userName);
      });

      it('should return `login` if `ringId` is missing', () => {
        const item = {
          fullName: 'fullName',
          login: 'name',
        };

        expect(getEntityPresentation(item)).toBe(item.login);
      });
    });
  });

  describe('getVisibilityPresentation', function () {
    it('should return null if no parameter is provided', () => {
      // @ts-ignore
      const visibilityPresentation = getVisibilityPresentation() === null;
      expect(visibilityPresentation).toBe(true);
    });

    it('should return empty string if there are no `permittedGroups` and `permittedUsers`', () => {
      const visibilityPresentation = getVisibilityPresentation({});
      expect(visibilityPresentation).toBe('');
    });

    it('should return combined `permittedGroups` and `permittedUsers` presentation separated by comma', () => {
      const permittedUsers = [
        {
          login: 'userLogin',
        },
      ];
      const permittedGroups = [
        {
          name: 'groupName',
        },
      ];
      const visibilityPresentation = getVisibilityPresentation({
        visibility: {
          permittedGroups: permittedGroups,
          permittedUsers: permittedUsers,
        },
      });
      expect(visibilityPresentation).toBe(
        `${permittedGroups[0].name}, ${permittedUsers[0].login}`,
      );
    });
  });
});

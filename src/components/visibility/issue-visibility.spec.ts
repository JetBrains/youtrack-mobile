import {ResourceTypes} from '../api/api__resource-types';
import IssueVisibility from './issue-visibility';

import {UserGroup} from 'types/UserGroup';
import {User} from 'types/User';
import {Visibility} from 'types/Visibility';


describe('IssueVisibility', function () {

  describe('isSecured', () => {
    it('should return true if it has visibility groups', () => {
      expect(IssueVisibility.isSecured(createVisibility({
        permittedGroups: [{}],
      }))).toEqual(true);
    });

    it('should return true if it has visibility users', () => {
      expect(IssueVisibility.isSecured(createVisibility({
        permittedUsers: [{}],
      }))).toEqual(true);
    });

    it('should return false if it has no visibility groups and users', () => {
      expect(IssueVisibility.isSecured(createVisibility({}))).toEqual(false);
    });
  });


  describe('visibility', function () {
    it('should create visibility with empty `permittedUsers` and `permittedGroups` and limited visibility type', () => {
      const visibilityMock = IssueVisibility.visibility(null, true);

      expect(visibilityMock?.$type).toEqual(ResourceTypes.VISIBILITY_LIMITED);
      expect(visibilityMock?.permittedUsers?.length).toEqual(0);
      expect(visibilityMock?.permittedGroups?.length).toEqual(0);
    });

    it('should create visibility with empty `permittedUsers` and `permittedGroups` and unlimited visibility type', () => {
      const visibilityMock = IssueVisibility.visibility();

      expect(visibilityMock?.$type).toEqual(ResourceTypes.VISIBILITY_UNLIMITED);
      expect(visibilityMock?.permittedUsers?.length).toEqual(0);
      expect(visibilityMock?.permittedGroups?.length).toEqual(0);
    });

    it('should create change visibility type to limited but leave `permittedUsers` and `permittedGroups` as is', () => {
      const itemMock = {id: 'id'};
      const updatedVisibility = IssueVisibility.visibility(createVisibility({
        $type: ResourceTypes.VISIBILITY_UNLIMITED,
        permittedUsers: [itemMock],
        permittedGroups: [itemMock, itemMock],
      }), true);

      expect(updatedVisibility?.$type).toEqual(ResourceTypes.VISIBILITY_LIMITED);
      expect(updatedVisibility?.permittedUsers?.length).toEqual(1);
      expect(updatedVisibility?.permittedUsers?.[0]).toEqual(itemMock);
      expect(updatedVisibility?.permittedGroups?.length).toEqual(2);
      expect(updatedVisibility?.permittedGroups?.[1]).toEqual(itemMock);
    });
  });


  describe('hasUsersOrGroups', function () {
    it('should return true if it has groups', () => {
      expect(IssueVisibility.hasUsersOrGroups(createVisibility({
        permittedGroups: [{}],
      }))).toEqual(true);
    });

    it('should return true if it has users', () => {
      expect(IssueVisibility.hasUsersOrGroups(createVisibility({
        permittedUsers: [{}],
      }))).toEqual(true);
    });

    it('should return true if it has users and groups', () => {
      expect(IssueVisibility.hasUsersOrGroups(createVisibility({
        permittedUsers: [{}],
        permittedGroups: [{}],
      }))).toEqual(true);
    });

    it('should return false if it has no users and groups', () => {
      expect(IssueVisibility.hasUsersOrGroups(createVisibility({
        $type: ResourceTypes.VISIBILITY_LIMITED,
      }))).toEqual(false);
    });
  });

  function createVisibility(data: Record<keyof Visibility, string | User[] | UserGroup[]>) {
    return data as Visibility;
  }
});

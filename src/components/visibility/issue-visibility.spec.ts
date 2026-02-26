import IssueVisibility from './issue-visibility';
import {ResourceTypes} from '../api/api__resource-types';

import type {Visibility} from 'types/Visibility';


describe('IssueVisibility', function () {

  describe('isSecured', () => {
    it('should return true if it has visibility groups', () => {
      expect(
        IssueVisibility.isSecured({
          permittedGroups: [{}],
        } as Visibility),
      ).toEqual(true);
    });

    it('should return true if it has visibility users', () => {
      expect(
        IssueVisibility.isSecured({
          permittedUsers: [{}],
        } as Visibility),
      ).toEqual(true);
    });

    it('should return false if it has no visibility groups and users', () => {
      expect(IssueVisibility.isSecured({} as Visibility)).toEqual(false);
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
      const updatedVisibility = IssueVisibility.visibility(
        {
          $type: ResourceTypes.VISIBILITY_UNLIMITED,
          permittedUsers: [itemMock],
          permittedGroups: [itemMock, itemMock],
        } as Visibility,
        true,
      );

      expect(updatedVisibility?.$type).toEqual(ResourceTypes.VISIBILITY_LIMITED);
      expect(updatedVisibility?.permittedUsers?.length).toEqual(1);
      expect(updatedVisibility?.permittedUsers?.[0]).toEqual(itemMock);
      expect(updatedVisibility?.permittedGroups?.length).toEqual(2);
      expect(updatedVisibility?.permittedGroups?.[1]).toEqual(itemMock);
    });
  });
});

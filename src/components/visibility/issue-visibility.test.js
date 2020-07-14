import {ResourceTypes, getShortEntityType} from '../api/api__resource-types';
import IssueVisibility from './issue-visibility';

describe('IssueVisibility', function () {

  describe('isSecured', () => {
    it('should return true if it has visibility groups', () => {
      const visibilityMock = {permittedGroups: [{}]};

      IssueVisibility.isSecured(visibilityMock).should.be.true;
    });

    it('should return true if it has visibility users', () => {
      const visibilityMock = {permittedUsers: [{}]};

      IssueVisibility.isSecured(visibilityMock).should.be.true;
    });

    it('should return false if it has no visibility groups and users', () => {
      IssueVisibility.isSecured({}).should.be.false;
    });
  });


  describe('visibility', function() {
    it('should create visibility with empty `permittedUsers` and `permittedGroups` and limited visibility type', () => {
      const visibilityMock = IssueVisibility.visibility(null, true);

      visibilityMock.$type.should.equal(ResourceTypes.VISIBILITY_LIMITED);
      visibilityMock.permittedUsers.length.should.equal(0);
      visibilityMock.permittedGroups.length.should.equal(0);
    });

    it('should create visibility with empty `permittedUsers` and `permittedGroups` and unlimited visibility type', () => {
      const visibilityMock = IssueVisibility.visibility();

      visibilityMock.$type.should.equal(ResourceTypes.VISIBILITY_UNLIMITED);
      visibilityMock.permittedUsers.length.should.equal(0);
      visibilityMock.permittedGroups.length.should.equal(0);
    });

    it('should create change visibility type to limited but leave `permittedUsers` and `permittedGroups` as is', () => {
      const itemMock = {};
      const visibilityMock = {
        $type: ResourceTypes.VISIBILITY_UNLIMITED,
        permittedUsers: [itemMock],
        permittedGroups: [itemMock, itemMock]
      };

      const updatedVisibility = IssueVisibility.visibility(visibilityMock, true);

      updatedVisibility.$type.should.equal(ResourceTypes.VISIBILITY_LIMITED);
      updatedVisibility.permittedUsers.length.should.equal(1);
      updatedVisibility.permittedUsers[0].should.equal(itemMock);
      updatedVisibility.permittedGroups.length.should.equal(2);
      updatedVisibility.permittedGroups[1].should.equal(itemMock);
    });
  });


  describe('toggleOption', function() {
    it('should remove an item from `permittedUsers`', () => {
      const userMock1 = {id: 'bar'};
      const userMock2 = {$type: ResourceTypes.USER, id: 'foo'};
      const visibilityMock = {
        permittedUsers: [userMock1, userMock2]
      };

      const updatedVisibility = IssueVisibility.toggleOption(visibilityMock, userMock2);

      updatedVisibility.permittedUsers.length.should.equal(1);
      updatedVisibility.permittedUsers[0].should.equal(userMock1);
      updatedVisibility.permittedGroups.length.should.equal(0);
    });

    it('should remove an item with a short $type from `permittedUsers`', () => {
      const userMock1 = {id: 'bar'};
      const userMock2 = {$type: ResourceTypes.USER, id: 'foo'};
      const visibilityMock = {
        permittedUsers: [userMock1, userMock2]
      };

      const updatedVisibility = IssueVisibility.toggleOption(
        visibilityMock,
        Object.assign({}, userMock2, {$type: getShortEntityType(ResourceTypes.USER)})
      );

      updatedVisibility.permittedUsers.length.should.equal(1);
      updatedVisibility.permittedUsers[0].should.equal(userMock1);
      updatedVisibility.permittedGroups.length.should.equal(0);
    });

    it('should add an item to `permittedUsers`', () => {
      const userMock = {$type: ResourceTypes.USER, id: 'foo'};
      const visibilityMock = {
        permittedUsers: []
      };

      const updatedVisibility = IssueVisibility.toggleOption(visibilityMock, userMock);

      updatedVisibility.$type.should.equal(ResourceTypes.VISIBILITY_LIMITED);
      updatedVisibility.permittedUsers.length.should.equal(1);
      updatedVisibility.permittedUsers[0].id.should.equal(userMock.id);
      updatedVisibility.permittedGroups.length.should.equal(0);
    });

    it('should remove an item from `permittedGroup`', () => {
      const userMock1 = {id: 'bar'};
      const userMock2 = {$type: ResourceTypes.USER_GROUP, id: 'foo'};
      const visibilityMock = {
        permittedGroups: [userMock1, userMock2]
      };

      const updatedVisibility = IssueVisibility.toggleOption(visibilityMock, userMock2);

      updatedVisibility.permittedGroups.length.should.equal(1);
      updatedVisibility.permittedGroups[0].should.equal(userMock1);
      updatedVisibility.permittedUsers.length.should.equal(0);
    });

    it('should remove an item with short $type from `permittedGroup`', () => {
      const userMock1 = {id: 'bar'};
      const userMock2 = {$type: ResourceTypes.USER_GROUP, id: 'foo'};
      const visibilityMock = {
        permittedGroups: [
          userMock1,
          Object.assign({}, userMock2, {$type: getShortEntityType(ResourceTypes.USER_GROUP)})
        ]
      };

      const updatedVisibility = IssueVisibility.toggleOption(visibilityMock, userMock2);

      updatedVisibility.permittedGroups.length.should.equal(1);
      updatedVisibility.permittedGroups[0].should.equal(userMock1);
      updatedVisibility.permittedUsers.length.should.equal(0);
    });

    it('should add an item to `permittedGroup`', () => {
      const userMock = {$type: ResourceTypes.USER_GROUP, id: 'foo'};
      const visibilityMock = {
        permittedGroups: []
      };

      const updatedVisibility = IssueVisibility.toggleOption(visibilityMock, userMock);

      updatedVisibility.$type.should.equal(ResourceTypes.VISIBILITY_LIMITED);
      updatedVisibility.permittedGroups.length.should.equal(1);
      updatedVisibility.permittedGroups[0].should.equal(userMock);
      updatedVisibility.permittedUsers.length.should.equal(0);
    });
  });


  describe('hasUsersOrGroups', function() {
    it('should return true if it has groups', () => {
      const visibilityMock = {permittedGroups: [{}]};

      IssueVisibility.hasUsersOrGroups(visibilityMock).should.be.true;
    });

    it('should return true if it has users', () => {
      const visibilityMock = {permittedUsers: [{}]};

      IssueVisibility.hasUsersOrGroups(visibilityMock).should.be.true;
    });

    it('should return true if it has users and groups', () => {
      const visibilityMock = {
        permittedUsers: [{}],
        permittedGroups: [{}]
      };

      IssueVisibility.hasUsersOrGroups(visibilityMock).should.be.true;
    });

    it('should return false if it has no users and groups', () => {
      const visibilityMock = {$type: ResourceTypes.VISIBILITY_LIMITED,};

      IssueVisibility.hasUsersOrGroups(visibilityMock).should.be.false;
    });
  });
});

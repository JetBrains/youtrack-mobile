import {
  createNullProjectCustomField,
  nullProjectCustomFieldMaxLength,
} from './util';


describe('createNullProjectCustomField', () => {

  describe('NULL safety', () => {
    it('should not throw if `projectName` param is not defined', () => {
      expect(() => createNullProjectCustomField()).not.toThrow();
    });

    it('should not throw if `maxLength` param is not defined', () => {
      expect(() => createNullProjectCustomField('projectName', 'name', undefined)).not.toThrow();
    });

    it('should not throw if `name` param is not defined', () => {
      expect(() => createNullProjectCustomField('projectName', 'label', undefined)).not.toThrow();
    });
  });


  describe('Field', () => {
    const projectLabelMock = 'label';
    let projectNameMock;
    beforeEach(() => {
      projectNameMock = 'YouTrack Mobile lets you track your team’s projects and tasks, and collaborate on the go.';
    });

    it('should return project custom field without shortening a project name', () => {
      projectNameMock = 'YouTrack Mobile';
      expect(createNullProjectCustomField(
        projectNameMock
      )).toEqual({
        projectCustomField: {field: {name: undefined}},
        value: {name: getProjectName()},
      });
    });

    it('should return project custom field with a project name not longer than default max length characters', () => {
      expect(createNullProjectCustomField(
        projectNameMock,
      )).toEqual({
        projectCustomField: {field: {name: undefined}},
        value: {name: getProjectName()},
      });
    });

    it('should return project custom field with a project name not longer than provided length', () => {
      expect(createNullProjectCustomField(
        projectNameMock,
        projectLabelMock,
        10,
      )).toEqual({
        projectCustomField: {field: {name: projectLabelMock}},
        value: {name: getProjectName(10)},
      });
    });

    it('should return project custom field with a project name', () => {
      const projectCustomFieldNameMock = 'project custom field label';
      expect(createNullProjectCustomField(
        projectNameMock,
        projectCustomFieldNameMock,
        10,
      )).toEqual({
        projectCustomField: {field: {name: projectCustomFieldNameMock}},
        value: {name: getProjectName(10)},
      });
    });


    function getProjectName(maxLength = nullProjectCustomFieldMaxLength) {
      return projectNameMock.length > maxLength ? `${projectNameMock.slice(0, maxLength - 3)}…` : projectNameMock;
    }
  });

});

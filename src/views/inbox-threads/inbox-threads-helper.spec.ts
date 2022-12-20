import {createMessagesMap} from './inbox-threads-helper';
describe('Inbox Threads Helper', () => {
  describe('createMessagesMap', () => {
    let messages;
    beforeEach(() => {
      messages = [
        {
          id: 'm1',
          activities: [
            {
              id: 'm1a1',
            },
          ],
        },
        {
          id: 'm2',
          activities: [
            {
              id: 'm2a1',
            },
            {
              id: 'm2a2',
            },
          ],
        },
      ];
    });
    it('should handle case when no messages array', () => {
      expect(createMessagesMap(null)).toEqual(null);
    });
    it('should return NULL if messages array is empty', () => {
      expect(createMessagesMap([])).toEqual(null);
    });
    it('should return empty map if no activities', () => {
      expect(createMessagesMap([{}])).toEqual({});
    });
    it('should create map activity to message', () => {
      const activityToMessageMap = createMessagesMap(messages);
      expect(activityToMessageMap?.m1a1).toEqual(messages[0]);
      expect(activityToMessageMap?.m2a1).toEqual(messages[1]);
      expect(activityToMessageMap?.m2a2).toEqual(messages[1]);
    });
  });
});
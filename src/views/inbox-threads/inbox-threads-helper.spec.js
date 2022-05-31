import InboxThreadItemSubscription from './inbox-threads__subscription';
import InboxThreadMention from './inbox-threads__mention';
import InboxThreadReaction from './inbox-threads__reactions';
import mocks from '../../../test/mocks';
import {getThreadData} from './inbox-threads-helper';


describe('Inbox Threads Helper', () => {
  let threadMock;

  describe('getThreadData', () => {
    it('should create subscription item', async () => {
      threadMock = mocks.createThreadMock({id: 'S-thread'});

      expect(getThreadData(threadMock)).toEqual({
        entity: threadMock.subject.target,
        component: InboxThreadItemSubscription,
        entityAtBottom: false,
      });
    });

    it('should create reaction item', async () => {
      threadMock = mocks.createThreadMock({id: 'R-thread'});

      expect(getThreadData(threadMock)).toEqual({
        entity: threadMock.subject.target,
        component: InboxThreadReaction,
        entityAtBottom: true,
      });
    });

    it('should create mention item', async () => {
      threadMock = mocks.createThreadMock({id: 'M-thread'});

      expect(getThreadData(threadMock)).toEqual({
        entity: threadMock.subject.target,
        component: InboxThreadMention,
        entityAtBottom: true,
      });
    });
  });

});

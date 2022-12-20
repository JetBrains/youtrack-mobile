import {guid} from 'util/util';
import {updateActivityCommentReactions} from './activity__stream-helper';
import mocks from '../../../test/mocks';
describe('Stream Helper', () => {
  describe('updateActivityCommentReactions', () => {
    let commentMock;
    let userMock;
    let reactionMock;
    const anotherReactionName = 'life';
    beforeEach(() => {
      commentMock = mocks.createCommentMock();
      userMock = mocks.createUserMock();
      reactionMock = {
        reaction: 'heart',
        id: 'heart',
        author: userMock,
      };
      reactionMock = createReaction('heart', userMock);
    });
    it('should add a new reaction to a comment that has no reactions', () => {
      const updatedComment = updateActivityCommentReactions({
        comment: commentMock,
        currentUser: userMock,
        reaction: reactionMock,
      });
      expect(updatedComment.reactions).toEqual([reactionMock]);
      expect(updatedComment.reactionOrder).toEqual(reactionMock.reaction);
    });
    it('should add a new reaction to a comment that has reactions', () => {
      const commentReactionsMock = [
        {
          reaction: anotherReactionName,
        },
      ];
      commentMock = mocks.createCommentMock({
        reactions: commentReactionsMock,
        reactionOrder: anotherReactionName,
      });
      const updatedComment = updateActivityCommentReactions({
        comment: commentMock,
        currentUser: userMock,
        reaction: reactionMock,
      });
      expect(updatedComment.reactions).toEqual(
        commentReactionsMock.concat(reactionMock),
      );
      expect(updatedComment.reactionOrder).toEqual(
        `${anotherReactionName}|${reactionMock.reaction}`,
      );
    });
    it('should add already existed reaction to a comment that has reactions', () => {
      const anotherReaction = createReaction(reactionMock.reaction);
      commentMock.reactions = [anotherReaction];
      commentMock.reactionOrder = reactionMock.reaction;
      const updatedComment = updateActivityCommentReactions({
        comment: commentMock,
        currentUser: userMock,
        reaction: reactionMock,
      });
      expect(updatedComment.reactions).toEqual([anotherReaction, reactionMock]);
      expect(updatedComment.reactionOrder).toEqual(reactionMock.reaction);
    });
    it('should remove an existed user reaction', () => {
      const anotherReaction = createReaction(anotherReactionName);
      commentMock.reactions = [reactionMock, anotherReaction];
      commentMock.reactionOrder = [
        reactionMock.reaction,
        anotherReactionName,
      ].join('|');
      const updatedComment = updateActivityCommentReactions({
        comment: commentMock,
        currentUser: userMock,
        reaction: reactionMock,
      });
      expect(updatedComment.reactions).toEqual([anotherReaction]);
      expect(updatedComment.reactionOrder).toEqual(anotherReactionName);
    });
    it('should remove only user`s reaction but leave the same from another user', () => {
      const anotherReaction = createReaction(reactionMock.reaction);
      commentMock.reactions = [anotherReaction, reactionMock];
      commentMock.reactionOrder = anotherReaction.reaction;
      const updatedComment = updateActivityCommentReactions({
        comment: commentMock,
        currentUser: userMock,
        reaction: reactionMock,
      });
      expect(updatedComment.reactions).toEqual([anotherReaction]);
      expect(updatedComment.reactionOrder).toEqual(anotherReaction.reaction);
    });

    function createReaction(name = '', author = mocks.createUserMock()) {
      return {
        id: guid(),
        reaction: name,
        author,
      };
    }
  });
});
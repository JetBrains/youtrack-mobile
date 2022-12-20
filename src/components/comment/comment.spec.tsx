import React from 'react';
import {render, cleanup} from '@testing-library/react-native';
import Comment from './comment';
import mocks from '../../../test/mocks';
import {__setStorageState} from '../storage/storage';
import {DEFAULT_THEME} from '../theme/theme';
import {setApi} from '../api/api__instance';
jest.mock('react', () => {
  const ActualReact = jest.requireActual('react');
  return {
    ...ActualReact,
    useContext: () => ({
      uiTheme: require('../theme/theme').DEFAULT_THEME,
    }),
  };
});
describe('<Comment/>', () => {
  const backendUrlMock = 'example.com';
  let commentMock;
  let attachmentsMock;
  beforeEach(() => {
    __setStorageState({});

    setApi({
      auth: {
        getAuthorizationHeaders: jest.fn(),
      },
      config: {
        backendUrl: backendUrlMock,
      },
    });
  });
  beforeEach(() => {
    attachmentsMock = [];
  });
  afterEach(() => cleanup());
  it('should render a Markdown comment', () => {
    commentMock = mocks.createCommentMock();
    const {getByTestId} = renderComment();
    expect(getByTestId('commentMarkdown')).toHaveTextContent(commentMock.text);
  });
  it('should render a YouTrack Wiki comment', () => {
    const textPreviewMock = mocks.randomSentence(4);
    commentMock = mocks.createCommentMock({
      usesMarkdown: false,
      textPreview: textPreviewMock,
    });
    const {getByTestId} = renderComment({
      youtrackWiki: {
        backendUrl: backendUrlMock,
      },
    });
    expect(getByTestId('commentYTWiki')).toHaveTextContent(textPreviewMock);
  });
  it('should render a legacy comment presentation', () => {
    commentMock = mocks.createCommentMock();
    const {getByTestId} = renderComment({
      activitiesEnabled: false,
    });
    expect(getByTestId('commentLegacyAuthor')).toHaveTextContent(
      commentMock.author.fullName,
    );
  });

  function renderComment({youtrackWiki, activitiesEnabled} = {}) {
    return render(
      <Comment
        comment={commentMock}
        attachments={attachmentsMock}
        uiTheme={DEFAULT_THEME}
        youtrackWiki={youtrackWiki}
        activitiesEnabled={activitiesEnabled}
      />,
    );
  }
});
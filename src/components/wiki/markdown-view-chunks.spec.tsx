import React from 'react';

import {render, cleanup} from '@testing-library/react-native';

import Api from 'components/api/api';
import MarkdownViewChunks from './markdown-view-chunks';
import mocks from '../../../test/mocks';
import ThemeProvider from 'components/theme/theme-provider';

import {__setStorageState} from '../storage/storage';
import {setApi} from '../api/api__instance';
import OAuth2 from 'components/auth/oauth2';

let apiMock;
describe('<Menu/>', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    apiMock = new Api(mocks.createAuthMock(mocks.createConfigMock()) as OAuth2);
    setApi(apiMock);

    __setStorageState({});
  });
  afterEach(cleanup);
  describe('Render', () => {
    it('should render component', () => {
      const {queryByTestId} = doRender();
      expect(queryByTestId('markdownViewChunks')).toBeDefined();
    });
  });

  function doRender(
    {
      children = '@root',
      attachments = [],
      chunkSize = 11,
      onCheckboxUpdate = jest.fn(),
      mentionedArticles = [],
      mentionedIssues = [],
      mentionedUsers = [],
      scrollData = {},
    } = {
      children: '`code snippet`',
    },
  ) {
    return render(
      <ThemeProvider mode={'dark'}>
        <MarkdownViewChunks
          attachments={attachments}
          chunkSize={chunkSize}
          onCheckboxUpdate={onCheckboxUpdate}
          mentions={{
            articles: mentionedArticles,
            issues: mentionedIssues,
            users: mentionedUsers,
          }}
          scrollData={scrollData}
        >
          {children}
        </MarkdownViewChunks>,
      </ThemeProvider>
    );
  }
});

import React from 'react';

import {render, cleanup} from '@testing-library/react-native';

import Api from '../api/api';
import MarkdownViewChunks from './markdown-view-chunks';
import mocks from '../../../test/mocks';
import {__setStorageState} from '../storage/storage';
import {DEFAULT_THEME} from '../theme/theme';
import {setApi} from '../api/api__instance';


let apiMock;

describe('<Menu/>', () => {

  beforeEach(() => {
    jest.restoreAllMocks();
    apiMock = new Api(mocks.createAuthMock(mocks.createConfigMock()));
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
      children,
      attachments,
      chunkSize,
      onCheckboxUpdate,
      mentionedArticles,
      mentionedIssues,
      scrollData,
    } = {children: '`code snippet`'},
  ) {
    return render(
      <MarkdownViewChunks
        attachments={attachments}
        chunkSize={chunkSize}
        onCheckboxUpdate={onCheckboxUpdate}
        mentionedArticles={mentionedArticles}
        mentionedIssues={mentionedIssues}
        scrollData={scrollData}
        uiTheme={DEFAULT_THEME}
      >{children}</MarkdownViewChunks>
    );
  }
});

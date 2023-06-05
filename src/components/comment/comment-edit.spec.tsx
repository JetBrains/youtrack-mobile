import React from 'react';

import {Provider} from 'react-redux';
import {render, cleanup, screen} from '@testing-library/react-native';

import CommentEdit from 'components/comment/comment-edit';
import mocks from 'test/mocks';
import {DEFAULT_THEME} from 'components/theme/theme';
import {ThemeContext} from 'components/theme/theme-context';

import {Props as CommentEditProps} from './comment-edit';

type Comment = CommentEditProps['editingComment'];


const storeMock = mocks.createMockStore({})({
  app: {},
});

describe('<CommentEdit/>', () => {
  let editingCommentMock: Comment;
  let onCommentChangeMock: jest.Mock;
  let onSubmitCommentMock: jest.Mock;

  beforeEach(() => {
    editingCommentMock = mocks.createCommentMock();
    onCommentChangeMock = jest.fn();
    onSubmitCommentMock = jest.fn();
  });

  afterEach(() => cleanup());


  it('should render component', () => {
    doRender();

    expect(screen.getByTestId('test:id/commentEdit')).toBeTruthy();
    expect(screen.getByTestId('test:id/commentEditInput')).toBeTruthy();
  });


  function doRender(isArticle: boolean = false, isEditMode: boolean = false) {
    return render(
      <Provider store={storeMock}>
        <ThemeContext.Provider value={{uiTheme: DEFAULT_THEME}}>
          <CommentEdit
            isEditMode={isEditMode}
            isArticle={isArticle}
            editingComment={editingCommentMock}
            onCommentChange={onCommentChangeMock}
            onSubmitComment={onSubmitCommentMock}
            getVisibilityOptions={() => Promise.resolve([])}
          />
        </ThemeContext.Provider>
      </Provider>
    );
  }

});

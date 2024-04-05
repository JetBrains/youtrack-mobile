import React from 'react';

import {Provider} from 'react-redux';
import {render, screen} from '@testing-library/react-native';

import API from 'components/api/api';
import HelpDeskFeedback from './helpdesk-feedback';
import mocks from 'test/mocks';
import {defaultTheme} from 'components/theme/theme';
import {setApi} from 'components/api/api__instance';
import {ThemeContext} from 'components/theme/theme-context';

import HelpDeskFormAPI from 'components/api/api__helpdesk';
import {FeedbackFormBlockFieldValue} from 'views/helpdesk-feedback/index';
import {FeedbackForm} from 'types/FeedbackForm';
import {MockStore} from 'redux-mock-store';
import {ProjectHelpdesk} from 'types/Project';

let project: ProjectHelpdesk;
let storeMock: MockStore;
let apiMock: API;
const getApi = () => apiMock;

describe('HelpDesk Feedback', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    project = createProject();

    apiMock = {
      helpDesk: {
        getForm: () => Promise.resolve({} as FeedbackForm),
        getFieldValues: () => Promise.resolve([{} as FeedbackFormBlockFieldValue]),
        submitForm: () => Promise.resolve(),
      } as unknown as HelpDeskFormAPI,
    } as API;
    setApi(apiMock);

    storeMock = mocks.createMockStore(getApi)({
      app: {
        isInProgress: false,
      },
      helpDeskFeedbackForm: {
        form: null,
      },
    });
  });

  it('should render component', () => {
    doRender();

    expect(screen.getByTestId('test:id/helpDeskFeedback')).toBeTruthy();
  });

});

function doRender() {
  return render(
    <Provider store={storeMock}>
      <ThemeContext.Provider value={defaultTheme}>
        <HelpDeskFeedback project={project} />
      </ThemeContext.Provider>
    </Provider>
  );
}

function createProject() {
  return {
    name: 'name',
    ringId: 'ringId',
    id: 'id',
    archived: false,
    shortName: 'PRJ',
    plugins: {
      helpDeskSettings: {
        id: 'sid',
        defaultForm: {
          title: 'Feedback',
          uuid: '123',
        },
        enabled: true,
      },
    },
  };
}

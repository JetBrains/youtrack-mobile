import QueryParser from './query-parser';
import {QueryAssistAst} from 'components/query-assist/query-parser_types';

const astMock: QueryAssistAst = {
  expression: {
    terms: [
      {
        field: {
          start: 0,
          stop: 6,
          name: 'project',
          filterFields: [
            {
              id: 'project',
              $type: 'PredefinedFilterField',
            },
          ],
          $type: 'SearchField',
        },
        values: [
          {
            minus: false,
            value: {
              name: 'Demo project',
              $type: 'SearchValue',
            },
            stop: 22,
            start: 9,
            $type: 'AttributeSearchValue',
          },
          {
            minus: false,
            value: {
              name: 'HELP',
              $type: 'SearchValue',
            },
            stop: 28,
            start: 25,
            $type: 'AttributeSearchValue',
          },
        ],
        stop: 28,
        start: 0,
        $type: 'CategorizedSearchTerm',
      },
      {
        text: 'some',
        minus: false,
        stop: 33,
        start: 30,
        $type: 'TextSearchTerm',
      },
      {
        field: {
          start: 35,
          stop: 41,
          name: 'project',
          filterFields: [
            {
              id: 'project',
              $type: 'PredefinedFilterField',
            },
          ],
          $type: 'SearchField',
        },
        values: [
          {
            minus: false,
            value: {
              name: 'Collaboration',
              $type: 'SearchValue',
            },
            stop: 56,
            start: 44,
            $type: 'AttributeSearchValue',
          },
        ],
        stop: 56,
        start: 35,
        $type: 'CategorizedSearchTerm',
      },
      {
        text: 'more',
        minus: false,
        stop: 61,
        start: 58,
        $type: 'TextSearchTerm',
      },
      {
        field: {
          start: 63,
          stop: 67,
          name: 'State',
          filterFields: [
            {
              customField: {
                name: 'State',
                id: '94-2',
                $type: 'CustomField',
              },
              id: '94-2',
              $type: 'CustomFilterField',
            },
          ],
          $type: 'SearchField',
        },
        values: [
          {
            minus: false,
            value: {
              name: 'Unresolved',
              $type: 'SearchValue',
            },
            stop: 79,
            start: 70,
            $type: 'AttributeSearchValue',
          },
        ],
        stop: 79,
        start: 63,
        $type: 'CategorizedSearchTerm',
      },
      {
        text: 'text',
        minus: false,
        stop: 84,
        start: 81,
        $type: 'TextSearchTerm',
      },
    ],
    $type: 'TermExpression',
  },
  $type: 'SearchAst',
} as QueryAssistAst;
const queryMock: string = 'project: {Demo project}, HELP some project: Collaboration more State: Unresolved text';

describe('QueryParser', () => {
  let parser: QueryParser;

  it('get unused field values', () => {
    parser = new QueryParser(queryMock, astMock);

    expect(parser.getValue).toBeTruthy();
  });
});

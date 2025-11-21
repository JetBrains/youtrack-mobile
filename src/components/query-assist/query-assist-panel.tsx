import React from 'react';
import {View} from 'react-native';

import ModalPortal from 'components/modal-view/modal-portal';
import QueryAssist, {QueryAssistModal} from './query-assist';
import {isSplitView} from 'components/responsive/responsive-helper';

import type {AssistSuggest} from 'types/Issue';
import type {ViewStyleProp} from 'types/Internal';

interface Props {
  queryAssistSuggestions: AssistSuggest[];
  query: string;
  suggestIssuesQuery: (query: string, caret: number) => any;
  onQueryUpdate: (query: string) => any;
  onClose: (query: string) => any;
  issuesCount?: number | null | undefined;
  style?: ViewStyleProp;
  clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
}


const QueryAssistPanel = (props: Props): React.JSX.Element => {
  const loadSuggests = (q: string, caret: number) => props.suggestIssuesQuery(q, caret);
  const applyQuery = (q: string) => props.onQueryUpdate(q);
  const Component = isSplitView() ? QueryAssistModal : QueryAssist;

  return (
    <ModalPortal onHide={() => {}} popup>
      <View style={props.style}>
        <Component
          suggestions={props.queryAssistSuggestions}
          currentQuery={props.query}
          onChange={loadSuggests}
          onApplyQuery={applyQuery}
          onClose={props.onClose}
          clearButtonMode={props.clearButtonMode}
        />
      </View>
    </ModalPortal>
  );
};


export default React.memo(QueryAssistPanel);

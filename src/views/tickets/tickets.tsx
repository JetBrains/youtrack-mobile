import React from 'react';
import {Text, View} from 'react-native';

import * as ticketsActions from './tickets-actions';
import usage from 'components/usage/usage';
import {ANALYTICS_TICKETS_PAGE} from 'components/analytics/analytics-ids';
import {doConnectComponent, Issues} from 'views/issues/issues';
import {i18n} from 'components/i18n/i18n';

import styles from 'views/issues/issues.styles';

import type {Folder} from 'types/User';
import type {IssuesProps} from '../issues/issues';

type TicketsProps = IssuesProps & typeof ticketsActions;

export class Tickets extends Issues<TicketsProps> {

  constructor(props: TicketsProps) {
    super(props);
    this.props.init();
    usage.trackScreenView('Tickets');
  }

  get searchQuery() {
    return this.props.helpdeskQuery;
  }

  get ticketsTitle() {
    return i18n('Tickets');
  }

  getAnalyticId() {
    return ANALYTICS_TICKETS_PAGE;
  }

  getSearchContext(): Folder {
    const {helpdeskSearchContext, user} = this.props;
    const defaultHelpdeskFolder: Folder = user.profiles.helpdesk.helpdeskFolder;
    const name = defaultHelpdeskFolder.id === helpdeskSearchContext.id
      ? this.ticketsTitle
      : helpdeskSearchContext.name;
    return {...helpdeskSearchContext, name};
  }

  renderContextButton = () => {
    return this.isReporter() ? (
      <View
        key="helpdeskContext"
        accessible={true}
        testID="test:id/helpdesk-context"
        style={styles.searchContext}
      >
        <View style={styles.searchContextButton}>
          <Text numberOfLines={1} style={styles.contextButtonText}>
            {this.ticketsTitle}
          </Text>
        </View>
      </View>
    ) : super.renderContextButton();
  };
}


export default doConnectComponent(Tickets, ticketsActions);

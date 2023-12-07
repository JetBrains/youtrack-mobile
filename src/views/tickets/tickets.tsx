import usage from 'components/usage/usage';
import {doConnectComponent, Issues} from 'views/issues/issues';

import * as ticketsActions from './tickets-actions';
import {ANALYTICS_TICKETS_PAGE} from 'components/analytics/analytics-ids';
import {i18n} from 'components/i18n/i18n';

import type {IssuesProps} from '../issues/issues';
import {Folder} from 'types/User';

type TicketsProps = IssuesProps & typeof ticketsActions;

export class Tickets extends Issues<TicketsProps> {

  constructor(props: TicketsProps) {
    super(props);
    this.props.setHelpDeskMode();
    usage.trackScreenView('Tickets');
  }

  getAnalyticId() {
    return ANALYTICS_TICKETS_PAGE;
  }

  getSearchContext(): Folder {
    const {helpdeskSearchContext, user} = this.props;
    const defaultHelpdeskFolder: Folder = user.profiles.helpdesk.helpdeskFolder;
    const name = defaultHelpdeskFolder.id === helpdeskSearchContext.id
      ? i18n('Tickets')
      : helpdeskSearchContext.name;
    return {...helpdeskSearchContext, name};
  }
}


export default doConnectComponent(Tickets, ticketsActions);

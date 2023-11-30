import usage from 'components/usage/usage';
import {doConnectComponent, Issues} from 'views/issues/issues';

import * as ticketsActions from './tickets-actions';
import {ANALYTICS_TICKETS_PAGE} from 'components/analytics/analytics-ids';

import type {IssuesProps} from '../issues/issues';
import {ReduxThunkDispatch} from 'types/Redux';

type TicketsProps = IssuesProps & typeof ticketsActions;

export class Tickets<P extends TicketsProps> extends Issues<P> {

  constructor(props: P) {
    super(props);
    this.props.setHelpDeskMode();
    usage.trackScreenView('Tickets');
  }

  getAnalyticId() {
    return ANALYTICS_TICKETS_PAGE;
  }
}


const mapDispatchToProps = (dispatch: ReduxThunkDispatch): {[fnName: string]: ReduxThunkDispatch} => {
  return {
    onOpenContextSelect: () => dispatch(ticketsActions.openContextSelect()),
    setHelpDeskMode: () => dispatch(ticketsActions.setHelpDeskMode()),
  };
};

export default doConnectComponent(Tickets, mapDispatchToProps, {helpDesk: true});

import usage from 'components/usage/usage';
import {doConnectComponent, Issues} from 'views/issues/issues';

import type {Props as TicketsProps} from '../issues/issues';


export class Tickets<Props extends TicketsProps> extends Issues {

  constructor(props: Props) {
    super(props);
    usage.trackScreenView('Tickets');
  }
}


export default doConnectComponent(Tickets);

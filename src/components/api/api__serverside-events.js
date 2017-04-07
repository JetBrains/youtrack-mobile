/* @flow */
import RNEventSource from 'react-native-event-source';
import qs from 'qs';
import log from '../../components/log/log';
import agileFields from './api__agile-fields';

export default class ServersideEvents {
  backendUrl: string;
  eventSource: RNEventSource;

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
  }

  subscribeAgileBoardUpdates(ticket: string) {
    const queryString = qs.stringify(
      {
        ticket,
        fields: agileFields.liveUpdate.toString()
      },
      {encode: false}
    );

    this.eventSource = new RNEventSource(`${this.backendUrl}/api/eventSourceBus?${queryString}`);

    this.eventSource.addEventListener('open', () => log.info('SSE connection opened'));

    this.eventSource.addEventListener('error', (e) => log.warn('SSE connection closed', e));
  }

  listenTo(eventName: string, callback: any => any) {
    this.eventSource.addEventListener(eventName, event => {
      return callback(event.data? JSON.parse(event.data) : event);
    });
  }

  close() {
    this.eventSource.removeAllListeners();
    this.eventSource.close();
  }
}

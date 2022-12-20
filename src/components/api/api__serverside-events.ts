import RNEventSource from '@gpsgate/react-native-eventsource';
import qs from 'qs';
import log from 'components/log/log';
import agileFields from './api__agile-fields';
import apiHelper from './api__helper';
import {logEvent} from '../log/log-helper';
export default class ServersideEvents {
  backendUrl: string;
  lastPing: Date | null | undefined;
  eventSource: typeof RNEventSource;

  constructor(backendUrl: string) {
    this.backendUrl = backendUrl;
  }

  subscribeAgileBoardUpdates(ticket: string) {
    const queryString = qs.stringify(
      {
        ticket,
        fields: agileFields.liveUpdate.toString(),
      },
      {
        encode: false,
      },
    );
    this.eventSource = new RNEventSource(
      `${this.backendUrl}/api/eventSourceBus?${queryString}`,
    );

    if (!this.eventSource) {
      logEvent({
        message: 'Unable to establish SSE connection',
      });
      return;
    }

    this.eventSource.addEventListener('open', () =>
      log.info('SSE connection opened'),
    );
    this.eventSource.addEventListener('error', () =>
      log.info('SSE connection closed'),
    );
    this.eventSource.addEventListener(
      'ping',
      () => (this.lastPing = new Date()),
    );
  }

  listenTo(eventName: string, callback: (arg0: any) => any) {
    this.eventSource &&
      this.eventSource.addEventListener(eventName, event => {
        const data = event.data ? JSON.parse(event.data) : event;

        if (event.data) {
          apiHelper.patchAllRelativeAvatarUrls(data, this.backendUrl);
        }

        return callback(data);
      });
  }

  close() {
    if (this?.eventSource) {
      if (this.eventSource?._unregisterEvents) {
        this.eventSource._unregisterEvents();
      }

      this.eventSource.close();
    }
  }
}

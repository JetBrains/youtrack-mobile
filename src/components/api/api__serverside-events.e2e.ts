export default class ServersideEvents {
  eventSource: Record<string, any>;

  subscribeAgileBoardUpdates() {
    this.eventSource = {};
  }
}

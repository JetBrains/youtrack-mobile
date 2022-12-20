import {routeMap} from '../../app-routes';
let requestsMap: {[key in keyof typeof routeMap]?: Set<AbortController>};
const requestController: {
  add: (
    routeId: keyof typeof routeMap,
    abortController: AbortController,
  ) => void;
  cancelIssuesRequests: () => void;
  delete: (
    routeId: keyof typeof routeMap,
    abortController: AbortController,
  ) => void;
  init: () => typeof requestsMap;
} = {
  init: (): typeof requestsMap => {
    requestsMap = {
      [routeMap.AgileBoard]: new Set(),
      [routeMap.Article]: new Set(),
      [routeMap.Inbox]: new Set(),
      [routeMap.Issue]: new Set(),
      [routeMap.Issues]: new Set(),
      [routeMap.KnowledgeBase]: new Set(),
    };
    return requestsMap;
  },
  add: (
    routeId: keyof typeof routeMap,
    abortController: AbortController,
  ): void => {
    requestsMap[routeId].add(abortController);
  },
  delete: (
    routeId: keyof typeof routeMap,
    abortController: AbortController,
  ): void => {
    if (requestsMap[routeId].has(abortController)) {
      requestsMap[routeId].delete(abortController);
    }
  },
  cancelIssuesRequests: (): void => {
    requestsMap[routeMap.Issues].forEach((it: AbortController) => {
      it.abort();
    });
    requestsMap[routeMap.Issues].clear();
  },
};

function fetch2(
  url: string,
  params: any,
  controller?: {[key in keyof typeof routeMap]?: AbortController},
): Promise<Response> {
  const routeId: keyof typeof routeMap | null | undefined =
    controller && Object.keys(controller)[0];

  if (controller && routeId) {
    requestController.add(routeId, controller[routeId]);
  }

  return fetch(url, params);
}

export {fetch2, requestController, requestsMap};

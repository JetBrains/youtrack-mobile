import {routeMap} from 'app-routes';

type RouteName = keyof typeof routeMap;
type RequestsMap = { [key in RouteName]?: Set<AbortController> };
export type RequestController = { [key in RouteName]?: AbortController };


let requestsMap: RequestsMap;

const requestController: {
  add: (routeId: RouteName, abortController: AbortController) => void;
  delete: (routeId: RouteName, abortController: AbortController) => void;
  init: () => RequestsMap;
  cancelIssuesRequests: () => void;
  cancelAllRequests: () => void;
} = {
  init: (): RequestsMap => {
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
  add: (routeId: RouteName, abortController: AbortController): void => {
    requestsMap?.[routeId]?.add(abortController);
  },
  delete: (routeId: RouteName, abortController: AbortController): void => {
    if (requestsMap?.[routeId]?.has(abortController)) {
      requestsMap?.[routeId]?.delete(abortController);
    }
  },
  cancelIssuesRequests: (): void => {
    // @ts-ignore
    requestsMap?.[routeMap.Issues]?.forEach((it: AbortController) => {
      it.abort();
    });
    // @ts-ignore
    requestsMap?.[routeMap.Issues]?.clear();
  },
  cancelAllRequests: (): void => {
    Object.keys(requestsMap).forEach((routeName: string) => {
      // @ts-ignore
      requestsMap?.[routeName]?.forEach((it: AbortController) => {
        it.abort();
      });
      // @ts-ignore
      requestsMap?.[routeName]?.clear();
    });
  },
};

function fetch2(
  url: string,
  params: any,
  controller?: RequestController,
): Promise<Response> {

  if (controller) {
    const routeId: RouteName = Object.keys(controller)[0] as RouteName;
    requestController.add(routeId, controller[routeId]);
  }

  return fetch(url, params);
}

export {fetch2, requestController, requestsMap};

import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';

// import { match } from 'path-to-regexp';

export interface IRouteItem {
  name: string;
  entry: string;
  activeRule: string;
  children?: Array<IRouteItem>;
};

export type TRouteMode = 'hash' | 'history' | 'memory';

// Create your own history instance.
// import { createBrowserHistory } from "history";
// let history = createBrowserHistory();

// // Get the current location.
// let location = history.location;

// // Listen for changes to the current location.
// let unlisten = history.listen(({ location, action }) => {
//   console.log(action, location.pathname, location.state);
// });

// // Use push to push a new entry onto the history stack.
// history.push("/home", { some: "state" });

// // Use replace to replace the current entry in the stack.
// history.replace("/logged-in");

// // Use back/forward to navigate one entry back or forward.
// history.back();

// // To stop listening, call the function returned from listen().
// unlisten();

/**
 * 生成路由处理
 * @date 2022-10-26
 * @param {any} routeMode 'history' | 'hash' | 'memory'
 * @returns {any}
 */
export function genRouter(routeMode: TRouteMode): any {
  if (routeMode === 'history') {
    return createBrowserHistory();
  } else if (routeMode === 'hash') {
    return createHashHistory();
  } else if (routeMode === 'memory') {
    return createMemoryHistory();
  }
}

/**
 * 匹配路由
 * @date 2022-11-21
 * @returns {any}
 */
export function deepMatchRoute(routes: Array<IRouteItem>, curPath: string) {
  console.log('routes>>>', routes, curPath)
  let matchRouteInfo: IRouteItem | object = {};

  if (routes && Array.isArray(routes) && routes.length) {
    // routes.every((routeItem: IRouteItem) => {
    //   const matchEvent = match(routeItem?.activeRule, { decode: decodeURIComponent });
    //   console.log('matchEvent>>', matchEvent);
      
    //   const matchResult = matchEvent(curPath);

    //   if (routeItem?.children) {
    //     matchRouteInfo = deepMatchRoute(routeItem?.children, curPath);
    //   }

    //   if (matchResult) {
    //     matchRouteInfo = routeItem;

    //     return false;
    //   }

    //   return true;
    // });
  }

  return matchRouteInfo;
};
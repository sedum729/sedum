import { createBrowserHistory, createHashHistory, createMemoryHistory, Action, createPath, parsePath } from 'history';

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
 * @param {any} routeMode 'brower' | 'hash' | 'memory'
 * @returns {any}
 */
export function genRouter(routeMode) {
  if (routeMode === 'brower') {
    return createBrowserHistory();
  } else if (routeMode === 'hash') {
    return createHashHistory();
  } else if (routeMode === 'memory') {
    return createMemoryHistory();
  }
}

/**
 * 描述
 * @date 2022-10-27
 * @returns {any}
 */
export function parseRoute(routes, routeMap = new Map()) {
  if (routes && Array.isArray(routes)) {
    routes.forEach(item => {
      const pathName = item?.path;

      if (!routeMap.has(pathName)) {
        routeMap.set(pathName, item);
      } else {
        throw new Error('重复路由注册');
      }
    });
  }

  return routeMap;
}
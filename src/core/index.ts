import { getRootContainer } from './utils';

import { genRouter, IRouteItem, deepMatchRoute } from './router';

// import { startApp } from '../micro-app';

type TRouteMode = 'hash' | 'history';

interface ISedumOptions {
  rootContainer: string | HTMLElement;
  routes: Array<IRouteItem>;
  routeMode: TRouteMode;
};

type TSedum = {
  rootContainerElement: Element | null;
  start: () => void;
};

class Sedum implements TSedum {
  rootContainerElement: Element;
  routes: Array<IRouteItem>;
  routeMode: TRouteMode;
  router: any;

  constructor(options: ISedumOptions) {
    const {
      rootContainer,
      routes,
      routeMode,
    } = options;

    this.rootContainerElement = getRootContainer(rootContainer);
    this.routes = routes;
    this.routeMode = routeMode;

    this.router = genRouter(routeMode || 'hash');

    this.router.listen(this.listenRouter);
  }

  listenRouter(...props: any) {
    console.log('props>>>', props);
  }

  start() {
    const curPathName = this.router?.location?.pathname;
    console.log('curPath>>>', curPathName);
    deepMatchRoute(this.routes, curPathName);
    // startApp({

    // });
  }
};

export default Sedum;
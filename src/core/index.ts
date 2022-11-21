import { getRootContainer } from './utils';

import { genRouter } from './router';

// import { startApp } from '../micro-app';

interface IRouteItem {
  name: string;
  entry: string;
  activeRule: string;
};

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
    console.log('this.rootContainerElement>>>', this.router.location);
    // startApp({

    // });
  }
};

export default Sedum;
import { getRootNode } from './utils';

import { genRouter, parseRoute, matchRoute } from './router';

import { startApp as microAppStart, destroyApp as microAppDestroy } from '../micro-app';

class Sedum {
  constructor(options) {
    const { root, routeMode = 'brower' } = options;

    if (!root) {
      throw new Error('请传入挂载节点');
    }

    if (!routeMode) {
      throw new Error('请设置路由模式');
    }

    /**
     * 存放当前路由
    */
    this.routes = [];

    /**
     * 应用挂载节点
     * 支持传入 string ｜ dom节点
    */
    this.root = root;

    /**
     * 路由模式
     * brower | hash
    */
    this.routeMode = routeMode;

    /**
     * 路由
    */
    this.history = null;

    /**
     * 是否以注册路由监听者
    */
    this.hasHistoryLiestener = false;

    /**
     * 当前激活的路由
    */
    this.activeRoute = null;

    /**
     * 记录路由地址
    */
    this.pathname = '';

    /**
     * 记录微应用
    */
    this.prevMicroApp = null;

    this.init();
  }

  /**
   * 初始化路由
   * @date 2022-10-26
   * @returns {any}
   */
  init() {
    this.history = genRouter(this.routeMode);

    if (!this.unListenHistory) {
      this.unListenHistory = this.listenHistory();
    }
  }

  listenHistory() {
    this.hasHistoryLiestener = true;

    return this.history.listen(({ location, action }) => {
      this.transitionView();
    });
  }

  /**
   * 寻找当前激活状态的路由信息
   * @date 2022-10-27
   * @returns {any}
   */
  findActiveRoute() {
    const { pathname } = this.history.location;

    const activeRoute = matchRoute(pathname, this.routeMap);

    this.activeRoute = activeRoute;
  }

  async transitionView() {
    if (this.prevMicroAppInfo) {
      // console.log('this.prevMicroApp>>', this.prevMicroAppInfo);
      // alert(1);
      microAppDestroy(this.prevMicroAppInfo.name);
    }

    this.findActiveRoute();

    this.prevMicroAppInfo = {
      ...this.activeRoute,
      el: this.root
    };

    microAppStart(this.prevMicroAppInfo);
  }

  /**
   * 注册路由
   * @date 2022-10-26
   * @returns {any}
   */
  registerRoute(routes) {
    this.routes = routes;
  }

  /**
   * 开始运行
   * @date 2022-10-26
   * @returns {any}
   */
  start() {
    
    this.root = getRootNode(this.root);

    this.routeMap = parseRoute(this.routes);

    this.transitionView();
  }

};

export default Sedum;
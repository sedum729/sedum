import { getRootNode } from './utils';

import { genRouter, parseRoute } from './router';

class ZhiYuan {
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

    this.init();
  }

  /**
   * 初始化路由
   * @date 2022-10-26
   * @returns {any}
   */
  init() {
    this.history = genRouter(this.routeMode);

    console.log('>>>', this.history.location);

    if (!this.hasHistoryLiestener) {
      this.unListenHistory = this.listenHistory();
    }
  }

  listenHistory() {
    this.hasHistoryLiestener = true;

    return this.history.listen(({ location, action }) => {
      this.findActiveRoute(location, action);
    });
  }

  unListenHistory() {

  }

  /**
   * 寻找当前激活状态的路由信息
   * @date 2022-10-27
   * @returns {any}
   */
  findActiveRoute(location, action) {

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

    console.log('>>>', this.routeMap, this.root);
  }
};

export default ZhiYuan;
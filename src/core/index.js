import { getRootNode } from './utils';

class ZhiYuan {
  constructor(options) {
    const { root, routeMode } = options;

    if (!root) {
      throw new Error('请传入挂载节点');
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

    console.log('>>>', this.routes, this.root);
  }
};

export default ZhiYuan;
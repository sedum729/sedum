import { appRouteParse } from './utils';

import { genIframe, insertScriptToIframe } from './iframe';

import { rawDocumentQuerySelector } from './common';

import { win_child_runtime } from './constant';

import { proxyGenerator } from './proxy';

import {
  creatZhiYuanComponent,
  renderElementToContainer,
  renderTemplateToShadowRoot,
} from './shadow';

import {
  addSandbox
} from './store';

/**
 * 纸鸢实例
*/
export default class Z {
  constructor(options) {
    const { url, name, el } = options;

    /**
     * 当前实例的唯一标识符
    */
    this.id = name;

    /**
     * 实例需要处理的路由地址
    */
    this.url = url;

    /**
     * 挂载节点
    */
    this.el = el;

    /**
     * 子应用js执行队列
    */
    this.execQueue = [];

    const mainHostPath = window.location.protocol + "//" + window.location.host;

    /**
     * 解析地址
    */
    const { urlElement, appHostPath, appRoutePath } = appRouteParse(url);

    const iframe = genIframe({
      sandbox: this,
      mainHostPath,
      appHostPath,
      appRoutePath,
    });
    this.iframe = iframe;

    const { proxyWindow, proxyDocument, proxyLocation } = proxyGenerator(
      iframe,
      urlElement,
      mainHostPath,
      appHostPath
    );
    this.proxyWindow = proxyWindow;
    this.proxyDocument = proxyDocument;
    this.proxyLocation = proxyLocation;


    addSandbox(name, this);
  }

  /**
   * 激活子应用
   * 同步路由
   * 动态修改iframe的fetch
   * 准备shadoow
   * 准备子应用注入
   */
  async active(options) {
    await this.iframeReady;

    const { template } = options;

    this.template = template;

    const iframeWindow = this.iframe.contentWindow;

    // 处理子应用的自定义fetch

    // 处理子应用路由同步


    // 准备shadow
    if (this.shadowRoot) {
    } else {
      const iframeBody = rawDocumentQuerySelector.call(iframeWindow.document, 'body');

      this.el = renderElementToContainer(creatZhiYuanComponent(this.id), this.el || iframeBody);
    }


    // 将内容插入到shadowRoot中
    await renderTemplateToShadowRoot(this.shadowRoot, iframeWindow, this.template);

    // todo: need handle css rule;
  }

  /**
   * 处理脚本
   * 处理样式
  */
  async start(getExternalScripts) {
    this.execFlag = true;
    // 执行脚本
    const scriptResultList = await getExternalScripts();
    // 如果已经销毁了则中断
    if (!this.iframe) return;
    // 标志位，执行代码前设置
    const iframeWindow = this.iframe.contentWindow;
    iframeWindow[win_child_runtime] = true;

    // 同步代码
    const syncScriptResultList = [];
    // 异步代码
    const asyncScriptResultList = [];
    // defer代码需要保证顺序并且DOMContentLoaded前完成，这里统一放置同步脚本后执行
    const deferScriptResultList = [];

    // 对脚本标签进行分类
    scriptResultList.forEach((scriptResult) => {
      if (scriptResult.defer) deferScriptResultList.push(scriptResult);
      else if (scriptResult.async) asyncScriptResultList.push(scriptResult);
      else syncScriptResultList.push(scriptResult);
    });

    // 同步代码
    syncScriptResultList.concat(deferScriptResultList).forEach((scriptResult) => {
      this.execQueue.push(() => {
        scriptResult.contentPromise.then((content) => {
          insertScriptToIframe({ ...scriptResult, content }, iframeWindow)
        })
      })
    })

    // 异步代码
    asyncScriptResultList.forEach((scriptResult) => {
      scriptResult.contentPromise.then((content) => {
        insertScriptToIframe({ ...scriptResult, content }, iframeWindow)
      })
    })

    this.execQueue.shift()();

    // 所有的execQueue队列执行完毕，start才算结束，保证串行的执行子应用
    return new Promise((resolve) => {
      this.execQueue.push(() => {
        resolve();
        this.execQueue.shift()?.();
      });
    });
  }
}
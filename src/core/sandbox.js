import { appRouteParse } from './utils';

import { genIframe } from './iframe';

import { rawDocumentQuerySelector } from './common';

import {
  win_child_runtime
} from './constant';

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
    const { url, name } = options;

    /**
     * 当前实例的唯一标识符
    */
    this.id = name;

    /**
     * 实例需要处理的路由地址
    */
    this.url = url;

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

    console.log('get shadowRoot>>', this.shadowRoot);

    // 准备shadow
    if (this.shadowRoot) {
      console.log('get shadowRoot>>', this.shadowRoot);
    } else {
      const iframeBody = rawDocumentQuerySelector.call(iframeWindow.document, 'body');

      this.el = renderElementToContainer(creatZhiYuanComponent(this.id), iframeBody);
    }

    // 将内容插入到shadowRoot中
    await renderTemplateToShadowRoot(this.shadowRoot, iframeWindow, this.template);

    // todo: need handle css rule;
  }

  /**
   * 处理脚本
   * 处理样式
  */
  async start() {
    const iframeWindow = this.iframe.contentWindow;

    iframeWindow[win_child_runtime] = true;
  }
}
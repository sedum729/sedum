import { getContainer, rawElementAppendChild, relativeElementTagAttrMap } from './common';

import { attr_data_id, win_sandbox_name, style_shade } from './constant';

import { getSandboxById } from './store';

import { patchElementEffect } from './iframe';

import { getAbsolutePath } from './utils';

import { patchRenderEffect } from './effect';

// 声明自定义元素
class ZhiYuanApp extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const sandboxCache = getSandboxById(this.getAttribute(attr_data_id));
    // todo patchElementEffect 暂时不知道作用
    sandboxCache.shadowRoot = shadowRoot;
  }

  disconnectedCallback() {
    const sandboxCache = getSandboxById(this.getAttribute(attr_data_id));
    // 暂时没有新增该方法
    // sandboxCache.unmount();
  }
}

/**
 * 定义自定义组件
 * @date 2022-10-22
 * @returns {any}
 */
export function defaultWebComponent() {
  if (!customElements.get("zhiyuan-frame")) {
    customElements.define('zhiyuan-frame', ZhiYuanApp);
  }
}

/**
 * 创建纸鸢组件
 * @date 2022-10-22
 * @param {any} id
 * @returns {any}
 */
export function creatZhiYuanComponent(id) {
  const contentElement = window.document.createElement('zhiyuan-frame');

  contentElement.setAttribute(attr_data_id, id);
  contentElement.classList.add('zhiyuan_iframe');

  return contentElement;
}

/**
 * 将内容插入容器
 * @date 2022-10-22
 * @returns {any}
 */
export function renderElementToContainer(content, container) {
  const realContainer = getContainer(container);

  if (realContainer && !realContainer.contains(content)) {
    if (content) {
      rawElementAppendChild.call(container, content);
    }
  }

  return realContainer;
}

/**
 * 将template渲染到shadowRoot
 * @date 2022-10-22
 * @returns {any}
 */
export async function renderTemplateToShadowRoot(shadowRoot, iframeWindow, template) {
  const html = renderTemplateToHtml(iframeWindow, template);

  // todo 这里还需要处理样式

  shadowRoot.appendChild(html);

  // do what ?
  const shade = document.createElement("div");
  shade.setAttribute("style", style_shade);
  html.insertBefore(shade, html.firstChild);
  shadowRoot.head = shadowRoot.querySelector("head");
  shadowRoot.body = shadowRoot.querySelector("body");

  // 修复 html parentNode
  Object.defineProperty(shadowRoot.firstChild, "parentNode", {
    enumerable: true,
    configurable: true,
    get: () => iframeWindow.document,
  });

  // 需要重写 head 跟 body 的 insertChild 跟 appendChild 方法 暂时不处理
  patchRenderEffect(shadowRoot, iframeWindow[win_sandbox_name].id);
}

/**
 * 将template渲染成html元素
 * @date 2022-10-22
 * @returns {any}
 */
export function renderTemplateToHtml(iframeWindow, template) {
  const sandbox = iframeWindow[win_sandbox_name];
  const document = iframeWindow.document;
  let html = document.createElement('html');
  html.innerHTML = template;

  // sandbox.head = html.querySelector('head');
  // sandbox.body = html.querySelector('body');

  const elementIterator = document.createTreeWalker(html, NodeFilter.SHOW_ELEMENT);

  let nextElement = elementIterator.currentNode;

  while (nextElement) {
    // 重写了元素的 baseURI 以及 ownerDocument 属性
    patchElementEffect(nextElement, iframeWindow);
    
    /**
     * 需要对有资源加载的标签进行资源路径替换操作
    */
    const relativeAttr = relativeElementTagAttrMap[nextElement.tagName];
    if (relativeAttr) {
      const url = nextElement[relativeAttr];
      nextElement.setAttribute(relativeAttr, getAbsolutePath(url, nextElement.baseURI || ''));
    }


    nextElement = elementIterator.nextNode();
  }

  if (!html.querySelector("head")) {
    const head = document.createElement("head");
    html.appendChild(head);
  }

  if (!html.querySelector("body")) {
    const body = document.createElement("body");
    html.appendChild(body);
  }

  return html;
}

export function clearChild(root) {
  while(root?.firstChild) {
    rawElementRemoveChild.call(root, root.firstChild);
  }
}
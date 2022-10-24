import { win_sandbox_name } from './constant';

import { rawElementRemoveChild, rawDocumentQuerySelector } from './common';

import { clearChild } from './shadow';

import { genAnchorElement } from './utils';

/**
 * js 沙箱
 * @date 2022-10-22
 * @returns {any}
 */
export function genIframe(options) {
  const {
    sandbox,
    mainHostPath,
    appHostPath,
    appRoutePath,
  } = options;


  const iframe = window.document.createElement("iframe");
  const url = mainHostPath + appRoutePath;

  const iframeAtts = {
    src: mainHostPath,
    style: 'display: none',
    name: sandbox.id,
  };

  for (const attrKey in iframeAtts) {
    const attrValue = iframeAtts[attrKey];
    iframe.setAttribute(attrKey, attrValue);
  }

  window.document.body.appendChild(iframe);

  const iframeWindow = iframe.contentWindow;

  iframeWindow[win_sandbox_name] = sandbox;


  // 给iframeWindow增加了些参数 暂时不知道作用
  // patchIframeVariable

  stopIframeLoading(iframeWindow, url);

  // 对iframe的history的pushState和replaceState进行修改
  // 将从location劫持后的数据修改回来，防止跨域错误
  // 同步路由到主应用
  // patchIframeHistory

  // 修改window对象的事件监听，只有路由事件采用iframe的事件
  // patchIframeEvents

  // 子应用前进后退，同步路由到主应用
  // syncIframeUrlToWindow

  return iframe;
}

/**
 * 初始化base标签
 */
 export function initBase(iframeWindow, url) {
  const iframeDocument = iframeWindow.document;
  const baseElement = iframeDocument.createElement("base");

  const iframeUrlElement = genAnchorElement(iframeWindow.location.href);
  const appUrlElement = genAnchorElement(url);

  baseElement.setAttribute("href", appUrlElement.protocol + "//" + appUrlElement.host + iframeUrlElement.pathname);

  iframeDocument.head.appendChild(baseElement);
}

/**
 * 初始化iframe dom结构
 * @date 2022-10-23
 * @returns {any}
 */
function initIframeDom(iframeWindow) {
  const iframeDocument = iframeWindow.document;

  clearChild(iframeDocument);

  const html = iframeDocument.createElement("html");
  html.innerHTML = `<head></head><body></body`;
  iframeDocument.appendChild(html);


}

/**
 * 防止运行主应用js代码，给子应用带来很多副作用
 * @date 2022-10-23
 * @returns {any}
 */
function stopIframeLoading(iframeWindow, url) {
  iframeWindow[win_sandbox_name].iframeReady = new Promise((resolve) => {
    function loop() {
      setTimeout(() => {
        if (iframeWindow.location.href === 'about:blank') {
          loop();
        } else {
          iframeWindow.stop();

          initIframeDom(iframeWindow);

          resolve();
        }
      });
    };

    loop();
  });
}

export function patchElementEffect(eleNode, iframeWindow) {
  if (eleNode?.__hasPatch) return;

  Object.defineProperties(eleNode, {
    baseURI: {
      configurable: true,
      get() {
        // todo 需要拼接下代理之后的url路径
      },
      set: undefined
    },
    ownerDocument: {
      configurable: true,
      get: () => iframeWindow.document
    },
    __hasPatch: {
      get: () => true
    }
  });
}

/**
 * iframe插入脚本
 * @param scriptResult script请求结果
 * @param iframeWindow
 */
export function insertScriptToIframe(scriptResult, iframeWindow) {
  const { src, module, content, crossorigin, crossoriginType, async, callback } = scriptResult;
  const scriptElement = iframeWindow.document.createElement("script");
  const nextScriptElement = iframeWindow.document.createElement("script");
  const { replace, plugins, proxyLocation } = iframeWindow[win_sandbox_name];
  let code = '';

  // 内联脚本
  if (content) {
    // patch location
    if (!module) {
      code = `(function(window, self, global, location) {
                ${content}
              }).bind(window.${win_sandbox_name}.proxyWindow)(
                window.${win_sandbox_name}.proxyWindow,
                window.${win_sandbox_name}.proxyWindow,
                window.${win_sandbox_name}.proxyWindow,
                window.${win_sandbox_name}.proxyLocation,
              );`;
    }
    // 解决 webpack publicPath 为 auto 无法加载资源的问题
    Object.defineProperty(scriptElement, "src", { get: () => src || "" });
    // 非内联脚本
  } else {
    src && scriptElement.setAttribute("src", src);
    crossorigin && scriptElement.setAttribute("crossorigin", crossoriginType);
  }
  module && scriptElement.setAttribute("type", "module");
  scriptElement.textContent = code || "";
  nextScriptElement.textContent = `if(window.${win_sandbox_name}.execQueue && window.${win_sandbox_name}.execQueue.length){ window.${win_sandbox_name}.execQueue.shift()()}`;

  const container = rawDocumentQuerySelector.call(iframeWindow.document, "head");

  if (/^<!DOCTYPE html/i.test(code)) {
    return !async && container.appendChild(nextScriptElement);
  }
  container.appendChild(scriptElement);

  // 调用回调
  callback?.(iframeWindow);

  // async脚本不在执行队列，无需next操作
  !async && container.appendChild(nextScriptElement);
}

import { win_sandbox_name } from './constant';

import { patchElementEffect } from './iframe';

import { documentProxyProperties } from './common';

/**
 * 代理 window document location
 * @date 2022-10-23
 * @param {any} iframe
 * @param {any} urlElement
 * @param {any} mainHostPath
 * @param {any} appHostPath
 * @returns {any}
 */
export function proxyGenerator(iframe, urlElement, mainHostPath, appHostPath) {
  const proxyWindow = new Proxy(iframe.contentWindow, {
    get(target, p) {
      if (p === 'location') {
        return target[win_sandbox_name]?.proxyLocation;
      }

      if (p === 'self' || p === 'window') {
        return target[win_sandbox_name]?.proxyWindow;
      }

      // todo: 这里留个口子给子应用获取全局的dom上的方法

      // 修正this指向
      return target[p];
    },

    set(target, p, value) {
      return target[p] = value;
    },

    has(target, p) {
      return p in target;
    },
  });

  const proxyDocument = new Proxy({}, {
    get(fakeDocument, propKey) {
      const document = window.document;
      const shadowRoot = iframe.contentWindow[win_sandbox_name]?.shadowRoot;

      // need fix
      if (propKey === 'createElement' || propKey === 'createTextNode') {
        return new Proxy(document[propKey], {
          apply(createElement, ctx, args) {
            const element = createElement.apply(iframe.contentWindow, args);
            patchElementEffect(element);
            return element;
          }
        });
      }
      if (propKey === 'documentURI' || propKey === 'URL') {
        return iframe.contentWindow[win_sandbox_name]?.proxyLocation?.href;
      }

      // from shadowRoot
      if (
        propKey === 'getElementsByTagName' ||
        propKey === 'getElementsByClassName' ||
        propKey === 'getElementsByName'
      ) {
        return new Proxy(shadowRoot.querySelectorAll, {
          apply(querySelectorAll, ctx, args) {
            let arg = args[0];
            if (propKey === "getElementsByTagName" && arg === "script") {
              return iframe.contentDocument.scripts;
            }
            if (propKey === "getElementsByClassName") arg = "." + arg;
            if (propKey === "getElementsByName") arg = `[name="${arg}"]`;
            return querySelectorAll.call(shadowRoot, arg);
          }
        });
      }

      if (propKey === 'getElementById') {
        return new Proxy(shadowRoot.querySelector, {
          apply(querySelector, ctx, args) {
            return querySelector.call(shadowRoot, `[id="${args[0]}"]`);
          }
        })
      }

      if (propKey === "querySelector" || propKey === "querySelectorAll") {
        return shadowRoot[propKey].bind(shadowRoot);
      }

      if (propKey === "documentElement" || propKey === "scrollingElement") return shadowRoot.firstElementChild;
      if (propKey === "forms") return shadowRoot.querySelectorAll("form");
      if (propKey === "images") return shadowRoot.querySelectorAll("img");
      if (propKey === "links") return shadowRoot.querySelectorAll("a");

      const { ownerProperties, shadowProperties, shadowMethods, documentProperties, documentMethods } = documentProxyProperties;

      const propKey2Str = `${propKey}`;

      if (ownerProperties.concat(shadowMethods).includes(propKey2Str)) {
        if (propKey === 'activeElement' && shadowRoot.activeElement === null) {
          return shadowRoot.body;
        }

        return shadowRoot[propKey2Str];
      }

      if (shadowMethods.includes(propKey2Str)) {
        return getTargetValue(shadowRoot, propKey2Str) ?? getTargetValue(document, propKey);
      }

      // from window.document
      if (documentProperties.includes(propKey2Str)) {
        return document[propKey];
      }
      if (documentMethods.includes(propKey2Str)) {
        return getTargetValue(document, propKey);
      }
    }
  });

  const proxyLocation = new Proxy({}, {
    get(fakeLocation, propKey) {
      const location = iframe.contentWindow.location;
      if (propKey === "host" || propKey === "hostname" || propKey === "protocol" || propKey === "port") {
        return urlElement[propKey];
      }
      if (propKey === "href") {
        return location[propKey].replace(mainHostPath, appHostPath);
      }
      if (propKey === "reload") {
        return () => null;
      }
      if (propKey === "replace") {
        return new Proxy(location[propKey], {
          apply(replace, _ctx, args) {
            return replace.call(location, args[0]?.replace(appHostPath, mainHostPath));
          },
        });
      }
      return getTargetValue(location, propKey);
    },

    set(fakeLocation, propKey, value) {
      // 如果是跳转链接的话重开一个iframe
      // 这里考虑使用 history.js 来实现
      if (propKey === "href") {
        // return locationHrefSet(iframe, value, appHostPath);
      }
      iframe.contentWindow.location[propKey] = value;
      return true;
    },

    ownKeys() {
      return Object.keys(iframe.contentWindow.location).filter((key) => key !== "reload");
    },

    getOwnPropertyDescriptor(target, key) {
      return { enumerable: true, configurable: true, value: this[key] };
    },
  });

  return { proxyWindow, proxyDocument, proxyLocation };
};
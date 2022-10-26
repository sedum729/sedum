import { defaultGetPublicPath } from './utils';

import { processTpl } from './template';

const styleCache = {};
const scriptCache = {};
const embedHTMLCache = {};

const fetchAssets = (src, cache, fetch) => {
  return cache[src] || (cache[src] = fetch(src)
    .then((response) => {
      return response.text();
    })
    .catch((e) => {
      cache[src] = null;
    }));
};

export function getExternalScripts(scripts, fetch) {
  return scripts.map((script) => {
    const { src, async, defer, module, ignore } = script;
    let contentPromise = null;

    if ((async || defer) && src && !module) {
      contentPromise = new Promise((resolve, reject) => fetchAssets(src, scriptCache, fetch).then(resolve, reject));
    } else if ((module && src) || ignore) {
      contentPromise = Promise.resolve("");
    } else if (!src) {
      contentPromise = Promise.resolve(script.content);
    } else {
      contentPromise = fetchAssets(src, scriptCache, fetch);
    }

    return { ...script, contentPromise };
  })
};

function getHtmlParseResult(url) {
  return fetch(url)
    .then(resp => resp.text())
    .then(html => {
      const assetPublicPath = defaultGetPublicPath(url);

      // todo 这里还需要处理 html 中的其他文件。
      const { template, scripts, styles } = processTpl(html, assetPublicPath);

      return {
        assetPublicPath,
        template,
        getExternalScripts: () => getExternalScripts(
          scripts
            .filter((script) => !script.src)
            .map((script) => ({ ...script, ignore: script.src })),
          fetch
        )
      };
    });
}

export function importHTML(url) {
  return getHtmlParseResult(url);
}
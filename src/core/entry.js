import { defaultGetPublicPath } from './utils';

import { processTpl } from './template';

function getHtmlParseResult(url) {
  return fetch(url)
    .then(resp => resp.text())
    .then(html => {
      const assetPublicPath = defaultGetPublicPath(url);

      // todo 这里还需要处理 html 中的其他文件。
      const { template } = processTpl(html);

      return {
        assetPublicPath,
        template,
      };
    });
}

export function importHTML(url) {
  return getHtmlParseResult(url);
}
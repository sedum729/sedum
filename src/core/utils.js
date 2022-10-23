export function appRouteParse(url) {
  if (!url) {
    throw new Error('纸鸢 [error info]: 当前未获取到应用url');
  }

  const urlElement = genAnchorElement(url);
  const appHostPath = urlElement.protocol + "//" + urlElement.host;
  const appRoutePath = urlElement.pathname + urlElement.search + urlElement.hash;


  return {
    urlElement,
    appHostPath,
    appRoutePath,
  }
}

/**
 * 生成a标签
 */
export function genAnchorElement(url) {
  const aElement = window.document.createElement("a");
  aElement.href = url;
  return aElement;
}

export function defaultGetPublicPath(entry) {
  if (typeof entry === "object") {
    return "/";
  }
  try {
    const { origin, pathname } = new URL(entry, location.href);
    const paths = pathname.split("/");
    // 移除最后一个元素
    paths.pop();
    return `${origin}${paths.join("/")}/`;
  } catch (e) {
    return "";
  }
}

/**
 * 获取绝对路径
 * @date 2022-10-22
 * @returns {any}
 */
export function getAbsolutePath(url, base, hash) {
  try {
    // 为空值无需处理
    if (url) {
      // 需要处理hash的场景
      if (hash && url.startsWith("#")) return url;
      return new URL(url, base).href;
    } else return url;
  } catch {
    return url;
  }
}
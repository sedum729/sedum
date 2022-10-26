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

export function getContainer(container) {
  return typeof container === "string" ? document.querySelector(container) : container;
}

const naughtySafari = typeof document.all === "function" && typeof document.all === "undefined";
const callableFnCacheMap = new WeakMap();
export const isCallable = (fn) => {
  if (callableFnCacheMap.has(fn)) {
    return true;
  }

  const callable = naughtySafari ? typeof fn === "function" && typeof fn !== "undefined" : typeof fn === "function";
  if (callable) {
    callableFnCacheMap.set(fn, callable);
  }
  return callable;
};

const boundedMap = new WeakMap();
export function isBoundedFunction(fn) {
  if (boundedMap.has(fn)) {
    return boundedMap.get(fn);
  }
  const bounded = fn.name.indexOf("bound ") === 0 && !fn.hasOwnProperty("prototype");
  boundedMap.set(fn, bounded);
  return bounded;
}

const fnRegexCheckCacheMap = new WeakMap();
export function isConstructable(fn) {
  const hasPrototypeMethods =
    fn.prototype && fn.prototype.constructor === fn && Object.getOwnPropertyNames(fn.prototype).length > 1;

  if (hasPrototypeMethods) return true;

  if (fnRegexCheckCacheMap.has(fn)) {
    return fnRegexCheckCacheMap.get(fn);
  }

  let constructable = hasPrototypeMethods;
  if (!constructable) {
    const fnString = fn.toString();
    const constructableFunctionRegex = /^function\b\s[A-Z].*/;
    const classRegex = /^class\b/;
    constructable = constructableFunctionRegex.test(fnString) || classRegex.test(fnString);
  }

  fnRegexCheckCacheMap.set(fn, constructable);
  return constructable;
}

const setFnCacheMap = new WeakMap();
export function getTargetValue(target, keyName) {
  const value = target[keyName];

  if (isCallable(value) && !isBoundedFunction(value) && !isConstructable(value)) {
    const boundValue = Function.prototype.bind.call(value, target);
    setFnCacheMap.set(value, boundValue);

    for (const key in value) {
      boundValue[key] = value[key];
    }

    if (value.hasOwnProperty("prototype") && !boundValue.hasOwnProperty("prototype")) {
      Object.defineProperty(boundValue, "prototype", { value: value.prototype, enumerable: false, writable: true });
    }

    return boundValue;
  }

  return value;
}

export function getInlineCode(match) {
  const start = match.indexOf(">") + 1;
  const end = match.lastIndexOf("<");
  return match.substring(start, end);
}
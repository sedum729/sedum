const sandboxStore = new Map();

/**
 * 添加沙箱缓存
 * @date 2022-10-22
 * @param {any} id
 * @param {any} sandbox
 * @returns {any}
 */
export function addSandbox(id, sandbox) {
  let itemSource = { sandbox };

  if (sandboxStore.has(id)) {
    itemSource = Object.assign({}, sandboxStore.get(id), itemSource);
  }

  sandboxStore.set(id, itemSource);
}

/**
 * 根据id获取sandbox
 * @date 2022-10-22
 * @param {any} id
 * @returns {any}
 */
export function getSandboxById(id) {
  return sandboxStore.get(id)?.sandbox || null;
}
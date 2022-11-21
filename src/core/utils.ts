/**
 * 获取挂载节点
 * @date 2022-10-26
 * @returns {any}
 */
export function getRootContainer(root: string | HTMLElement): Element {
  return typeof root === 'string' ? document.querySelector(root) : root;
}
/**
 * 获取挂载节点
 * @date 2022-10-26
 * @returns {any}
 */
export function getRootNode(root) {
  return typeof root ? document.querySelector(root) : root;
}
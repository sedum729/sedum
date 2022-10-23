// 相对路径问题元素的tag和attr的map
export const relativeElementTagAttrMap = {
  IMG: "src",
  A: "href",
  SOURCE: "src",
};

export function getContainer(container) {
  return typeof container === "string" ? document.querySelector(container) : container;
}

export const rawElementAppendChild = HTMLElement.prototype.appendChild;
export const rawElementRemoveChild = HTMLElement.prototype.removeChild;
export const rawDocumentQuerySelector = Document.prototype.querySelector;
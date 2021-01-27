export default class Compiler {
  constructor(vm) {
    this.vm = vm;
    this.el = vm.$el;
    this.compile(this.el);
  }

  compile(el) {
    for (let i = 0; i < el.childNodes.length; i++) {
      const node = el.childNodes[i];

      if (this.isTextNode(node)) {
        this.compileText(node);
      } else if (this.isElementNode(node)) {
        this.compileElement(node);
      }

      if (node.childNodes?.length > 0) {
        this.compile(node);
      }
    }
  }

  compileText(node) {
    const reg = /\{\{(.+?)\}\}/;
    if (reg.test(node.textContent)) {
      const key = RegExp.$1.trim();
      node.textContent = node.textContent.replace(reg, this.vm[key]);
    }
  }

  compileElement(node) {
    for (let i = 0; i < node.attributes.length; i++) {
      const attrName = node.attributes[i].name;
      if (this.isDirective(attrName)) {
        this.updater(node, node.attributes[i].value, attrName.replace(/^v-/, ''));
      }
    }
  }

  updater(node, key, attrName) {
    const fn = this[`${attrName}Updater`];
    fn?.call(this, node, key, this.vm[key]);
  }

  textUpdater(node, key, value) {
    node.textContent = value;
  }

  modelUpdater(node, key, value) {
    node.value = value;
  }

  isDirective(attrName) {
    return attrName?.startsWith('v-');
  }

  isElementNode(node) {
    return node.nodeType === 1;
  }

  isTextNode(node) {
    return node.nodeType === 3;
  }
}

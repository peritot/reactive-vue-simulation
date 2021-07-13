import Watcher from './watcher.js';

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
    let reg = /\{\{(.+?)\}\}/;
    if (reg.test(node.textContent)) {
      let textContent = node.textContent.replace(/^\{\{|\}\}$/g, '');
      // 获取变量参数
      reg = new RegExp(
        `${Object.keys(this.vm.$data)
          .map((key) => `(${key})`)
          .join('|')}`,
        'g'
      );
      const res = textContent.match(reg);
      if (res?.length > 0) {
        // 构造函数
        const fun = new Function(...[res], `return ${textContent}`);
        node.textContent = fun.apply(
          null,
          res.map((key) => {
            return this.vm[key];
          })
        );

        res.forEach((key) => {
          new Watcher(this.vm, key, (newValue) => {
            node.textContent = fun.apply(
              null,
              res.map((k) => {
                return k === key ? newValue : this.vm[key];
              })
            );
          });
        });
      }
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
    let value = this.vm[key];

    // v-on 指令
    const reg = /^on:/;
    if (reg.test(attrName)) {
      value = attrName.replace(reg, '');
      attrName = 'on';
    }

    const fn = this[`${attrName}Updater`];
    fn?.call(this, node, key, value);
  }

  textUpdater(node, key, value) {
    node.textContent = value;

    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue;
    });
  }

  htmlUpdater(node, key, value) {
    node.innerHTML = value;

    new Watcher(this.vm, key, (newValue) => {
      node.innerHTML = newValue;
    });
  }

  modelUpdater(node, key, value) {
    node.value = value;

    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue;
    });

    document.addEventListener('input', () => {
      this.vm[key] = node.value;
    });
  }

  onUpdater(node, key, value) {
    let fn = this.vm.$methods[key];
    let args = [];
    // 是否包含括号和参数
    let reg = /(.+?)\((.+?)\)/;
    let res = key.match(reg);
    if (res?.length > 0) {
      fn = this.vm.$methods[res[1]];
      args = res[2]?.replace(/\s*/g, '').split(',') || [];
    }

    node.addEventListener(value, (event) => {
      fn?.apply(node, [...args, event]);
    });
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

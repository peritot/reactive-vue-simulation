import Dep from './dep.js';

export default class Observe {
  constructor(data) {
    this.walk(data);
  }

  walk(data) {
    if (data === null || typeof data === 'undefined' || typeof data !== 'object') {
      return;
    }

    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key]);
    });
  }

  defineReactive(data, key, oldValue) {
    const self = this;

    const dep = new Dep();
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get() {
        Dep.target && dep.addSub(Dep.target);

        return oldValue;
      },
      set(newValue) {
        if (oldValue === newValue) {
          return;
        }

        oldValue = newValue;
        self.walk(newValue);

        dep.notify();
      },
    });
    self.walk(oldValue);
  }
}

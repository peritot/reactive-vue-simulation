import Dep from './dep.js';

export default class Watcher {
  constructor(vm, key, callback) {
    this.vm = vm;
    this.key = key;
    this.callback = callback;

    Dep.target = this;

    this.oldValue = this.vm[this.key];

    Dep.target = null;
  }

  update() {
    const newValue = this.vm[this.key];
    if (this.oldValue === newValue) {
      return;
    }

    return this.callback(newValue);
  }
}

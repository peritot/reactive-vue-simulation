import Observe from './observe.js';
import Compiler from './compiler.js';

export default class Vue {
  constructor(options) {
    this.$options = options || {};
    this.$el = typeof this.$options.el === 'string' ? document.querySelector(this.$options.el) : this.$options.el;
    this.$data = this.$options.data || {};
    this.$methods = this.$options.methods || {};

    this._proxyData(this.$data);

    new Observe(this.$data);

    new Compiler(this);
  }

  _proxyData(data) {
    Object.keys(data).forEach((key) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key];
        },
        set(newValue) {
          if (data[key] === newValue) {
            return;
          }

          data[key] = newValue;
        },
      });
    });
  }
}

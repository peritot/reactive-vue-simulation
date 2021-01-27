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

    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get() {
        return oldValue;
      },
      set(newValue) {
        if (oldValue === newValue) {
          return;
        }

        oldValue = newValue;

        self.walk(newValue);
      },
    });
  }
}

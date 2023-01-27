// 对数组中的部分方法进行重写

let oldArrayProto = Array.prototype; // 获取数组的原型

// newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto);

let methods = [ // 找到所有变异方法
  "push",
  "pop",
  "shift",
  "unshift",
  "reverse",
  "sort",
  "splice"
];
methods.forEach(method => {

  newArrayProto[method] = function (...args) { // 这里重写了数组的方法
    const result = oldArrayProto[method].call(this, ...args); // 内部调用了原来的方法，切片编程



    // 需要对新增的数据，再次进行劫持
    let inserted;
    let ob = this.__ob__; // 获取Observer的实例
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2);
      default:
        break;
    }

    // 对新增的内容进行观测
    if (inserted) {
      ob.observeArray(inserted)
    }

    return result;
  }

});



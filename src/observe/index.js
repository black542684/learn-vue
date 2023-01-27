import { newArrayProto } from "./array";

class Observer {
  constructor(data) {
    // Object.defineProperty只能劫持已经存在的属性 （vue里面会为此单独写一些api  $set  $delete）

    // __ob__属性中保存Observer的实例
    // 给数据加了一个标识，如果数据上面有__ob__这个属性，则表示数据表观测过
    Object.defineProperty(data, "__ob__", {
      enumerable: false, // 属性不可枚举
      value: this
    });
    if (Array.isArray(data)) {
      // 这里可以重写数组中的方法，数组中的7个方法
      // 对数组中的每一个值都进行观测 [1, {a:1}]   
      data.__proto__ = newArrayProto; 
      this.observeArray(data);

    } else {
      this.walk(data);
    }
    
  }
  // 循环对象，对属性依次劫持
  walk(data) { 
    // '重新定义'属性
    Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
  }
  // 观察数组中的每一项
  observeArray(data) {
    data.forEach(item => observe(item));
  }
}
export function defineReactive(target, key, value) { // 这个函数是一个闭包，属性劫持
  // value 可能是一个对象，需要再次进行劫持
  observe(value);
  Object.defineProperty(target, key, {
    get() { // 取值的时候\
      return value;
    },
    set(newValue) { // 修改的时候
      if (newValue === value) return;
      // 如果用户传入的是一个对象，需要再次进行数据劫持
      observe(newValue);
      value = newValue;
    }
  });
}
export function observe(data) {
  // 对这个对象进行劫持
  if (typeof data !== 'object' || data == null) {
    // 只对对象进行劫持
    return;
  }
  if (data.__ob__ instanceof Observer) { // 说明这个对象被代理过
    return data.__ob__;
  }
  // 如果一个对象被劫持过了，那就不需要再劫持了（要判断一个对象是否被劫持过，可以增添一个实例，用实例来判断是否被劫持过）
  return new Observer(data);
}
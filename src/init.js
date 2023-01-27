import { compileToFunctions } from "./complier";
import { initState } from "./state";

export function initMixin(Vue) {
  // 给Vue添加init 方法
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;

    // 初始化状态
    initState(vm);

    if (options.el) {
      vm.$mount(options.el);
    }
  }

  // 实现数据的挂载
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    const opt = vm.$options;
    if (!opt.render) {
      let template;
      if (!opt.template && el) { // 没有模板  但是写了el
        template = el.outerHTML;
      } else {
        template = opt.template;
      }

      // 这里对模板进行编译
      if (template) {
        const render = compileToFunctions(template);
        opt.render = render;
      }

    }
    opt.render; // 最终可以获取render方法

  }
}


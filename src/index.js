import { initMixin } from "./init";

/**
 * 
 * @param {Object} options 用户传入的选项
 */
function Vue(options) {
  this._init(options); // 默认调用了_init
}

initMixin(Vue); // 扩展了init方法

export default Vue;
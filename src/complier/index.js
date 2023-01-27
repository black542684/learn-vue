const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配到的分组是一个标签名
const startTagClose = /^\s*(\/?)>/; // </div>  <br/> 开始标签的结束
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 结束标签匹配

const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;// 匹配属性
// 第一个分组就是属性的key   value就是分组3/分组4/分组5


const defaultTagER = /\{\{((?:.|\r?\n)+?)\}\}/; // 匹配的内容就是表达式的变量
// 对模板进行编译处理

function parseHTML(html) { // html开始一定是一个 <
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  const stack = []; // 用于存放元素的栈
  let currentParent; // 指向栈顶
  let root; // 是否是根节点

  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null
    }
  }
  /**
   * 处理开始标签
   * @param {String} tag 
   * @param {Array} attrs 
   */
  function start(tag, attrs) { // 最终需要转化成一颗抽象语法树

    let node = createASTElement(tag, attrs);
    // 如果没有根节点
    if (!root) {
      root = node;
    }
    if (currentParent) {
      node.parent = currentParent;
      currentParent.children.push(node);
    }
    stack.push(node);
    currentParent = node;

  };

  /**
   * 处理文本
   * @param {String} text 
   */
  function chats(text) {
    // 文本直接放到当前节点中
    text = text.replace(/\s+/g, " "); // 多个空格替换成一个空格
    (text !== ' ') && currentParent.children.push({
      type: TEXT_TYPE,
      text,
      parent: currentParent
    });
  };

  /**
   * 处理结束标签
   * @param {String} tag 
   */
  function end(tag) {
    let node = stack.pop(); // 弹出栈顶元素, 校验标签是否合法，标签有没有成对出现
    currentParent = stack[stack.length - 1];
  };

  // 删除匹配完的字符串
  function advance(n) {
    html = html.substring(n);
  }
  // 解析开始标签
  function parseStartTag () {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1], // 标签名
        attrs: []
      }
      // 前进-删除匹配之后的字符
      advance(start[0].length);

      // 如果不是开始标签的结束 就一直匹配
      let attr, end;
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        // 前进-删除匹配之后的字符
        advance(attr[0].length);
        // 这里匹配到标签中的属性
        match.attrs.push({ name: attr[1], value: attr[3] || attr[4] || attr[5] })

      }
      
      if (end) {
        // 前进-删除匹配之后的字符
        advance(end[0].length);
      }
      return match;
    }

    
    return false; // 不是开始标签
  }

  while(html) {
    // 如果 textEnd 为0 说明是一个开始标签或者结束标签
    // 如果 textEnd 大于0 说明是文本的结束位置
    let textEnd = html.indexOf("<"); // 如果indexOf中的索引是0，则说明是一个开始标签

    if (textEnd == 0) {
      const startTagMatch = parseStartTag(); // 开始标签的匹配

      if (startTagMatch) {
        console.log(startTagMatch, "开始");
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      };

      // 这里匹配到结束标签
      let endTagMatch = html.match(endTag);

      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }

    if (textEnd > 0) { // 文本
      let text = html.substring(0, textEnd); // 文本内容
      if (text) {
        chats(text);
        advance(text.length);
      }
    }

  }

  console.log(root);
  console.log(html);
}



export function compileToFunctions(template) {
  // 1. 就是将template转化成ast语法书 
  let ast = parseHTML(template);

  // 2. 生成render方法 （render方法执行之后的返回结果就是虚拟DOM）
  
}
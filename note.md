## function createElement(tagName, attributes, ...children) {}
    ...children 表示把后面的参数解构, 可以是多个

## 为什么需要wrapper 
  child 如果不是个原生对象, e是个原生对象, e.appendChild(child)会出错
```Javascript 
    for(let child of children) {
      if(typeof child === "string") {
        child = document.createTextNode(child);
      }
      e.appendChild(child);
    }
```
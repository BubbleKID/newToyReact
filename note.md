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
## 理解 es6 class 中 constructor 方法 和 super 的作用
    https://juejin.cn/post/6844903638674980872

## Difference between Object.create and Object.assign
    Object.assign() provides shallow copying (Only properties and methods) and it will override the method and property declared.

    while Object.create() provides Deep copying provides prototype chain.

    https://medium.com/angularfeedacademy/difference-between-object-create-and-object-assign-834d3ddfbc81

## getter
    https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/get
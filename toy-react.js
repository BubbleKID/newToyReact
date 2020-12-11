class ElementWrapper {
  constructor(Type) {
    // 实体的DOM
    this.root = document.createElement(Type);
  }

  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }

  appendChild(component) {
    this.root.appendChild(component.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  appendChild(component) {
    this.children.push(component);
  }

  get root() {
    if (!this._root) {
      this._root = this.render().root;
    }
    return this._root;
  }
}

export function createElement(Type, attributes, ...children) {
  let e;

  // 如果type是string则当成普通的element
  if (typeof Type === 'string') {
    e = new ElementWrapper(Type);
  } else {
    e = new Type();
  }

  for (let p in attributes) {
    e.setAttribute(p, attributes[p]);
  }

  let insertChildren = (children) => {
    for(let child of children) {
      if(typeof child === "string") {
        child = new TextWrapper(child);
      }
      if(typeof child === "object" && (child instanceof Array)) {
        insertChildren(child);
      } else {
        e.appendChild(child);
      } 
    }
  }

  insertChildren(children);
  return e;
}

export function render(component, parentElement) {
  parentElement.appendChild(component.root);
}

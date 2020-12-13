const RENDER_TO_DOM = Symbol('render to dom');

function replaceContent(range, node) {
  range.insertNode(node);
  range.setStartAfter(node);
  range.deleteContents();
  range.setStartBefore(node);
  range.setEndAfter(node);
}

export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
    this._range = null;
  }

  setAttribute(name, value) {
    this.props[name] = value;
  }

  appendChild(component) {
    this.children.push(component);
  }

  get vdom() {
    return this.render().vdom;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    this._vdom = this.vdom;
    this._vdom[RENDER_TO_DOM](range);
  }

  update() {
    const isSameNode = (oldNode, newNode) => {
      if (oldNode.Type !== newNode.Type) {
        return false;
      }

      for (let name in newNode.props) {
        if(newNode.props[name] !== oldNode.props[name]) {
          return false;
        }
      }

      if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) {
        return false;
      }

      if (newNode.Type === '#text') {
        if (newNode.content !== oldNode.content) {
          return false;
        }
      }

      return true;
    };

    const update = (oldNode, newNode) => {
      if (!isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range);
        return;
      }
      newNode._range = oldNode._range;

      const newChildren = newNode.vchildren;
      const oldChildren = oldNode.vchildren;

      if (!newChildren || !newChildren.length) {
        return;
      }

      let tailRange = oldChildren[oldChildren.length - 1]._range;

      for (let i = 0; i < newChildren; i += 1) {
        const newChild = newChildren[i];
        const oldChild = oldChildren[i];

        if (i < oldChildren.length) {
          update(oldChild, newChild);
        } else {
          const range = document.createRange();
          range.setStart(tailRange.endContainer, tailRange.endOffset);
          range.setEnd(tailRange.endContainer, tailRange.endOffset);
          newChild[RENDER_TO_DOM](range);
          tailRange = range;
        }
      }
    };

    const vdom = this.vdom;
    update(this._vdom, vdom);
    this._vdom = vdom;
  }

  // rerender () {
  //   let oldRange = this._range;
  //   let range = document.createRange();
  //   range.setStart(oldRange.startContainer,oldRange.startOffset);
  //   range.setEnd(oldRange.startContainer,oldRange.startOffset);
  //   this[RENDER_TO_DOM](range);
  //   oldRange.setStart(range.endContainer, range.endOffset);
  //   oldRange.deleteContents();
  // }

  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState;
      this.rerender();
      return;
    }

    const merge = (oldState, newState) => {
      for (let p in newState) {
        if (oldState[p] === null || typeof oldState[p] !== 'object') {
          oldState[p] = newState[p];
        } else {
          merge(oldState[p], newState[p]);
        }
      }
    };

    merge(this.state, newState);
    this.update();
  }
}
class ElementWrapper extends Component {
  constructor(Type) {
    super(Type);
    this.Type = Type;
  }

  get vdom() {
    this.vchildren = this.children.map((child) => child.vdom);
    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;

    const root = document.createElement(this.Type);

    for(let name in this.props) {
      let value = this.props[name];
      if (name.match(/^on([\s\S]+)$/)) {
        root.addEventListener(RegExp.$1.replace(/^[\s\S]/, (c) => c.toLowerCase()), value);
      } else {
        if (name === 'className') {
          root.setAttribute('class', value);
        } else {
          root.setAttribute(name, value);
        }
      }
    }

    if (!this.vchildren) {
      this.vchildren = this.children.map((child) => child.vdom);
    }

    for (let child of this.vchildren) {
      let childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);
      child[RENDER_TO_DOM](childRange);
    }

    replaceContent(range, root);
  }
}

class TextWrapper extends Component {
  constructor(content) {
    super(content);
    this.Type = '#text';
    this.content = content;
  }

  get vdom() {
    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;

    const root = document.createTextNode(this.content);
    replaceContent(range, root);
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

  const insertChildren = (children) => {
    for(let child of children) {
      if(typeof child === "string") {
        child = new TextWrapper(child);
      }
      if(child === null) {
        continue;
      }
      if(typeof child === "object" && (child instanceof Array)) {
        insertChildren(child);
      } else {
        e.appendChild(child);
      } 
    }
  };

  insertChildren(children);
  return e;
}

export function render(component, parentElement) {
  const range = document.createRange();
  range.setStart(parentElement, 0);
  range.setEnd(parentElement, parentElement.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}

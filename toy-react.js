class ElementWrapper {

}

class TextWrapper {

}

export default function createElement(Type, attributes, ...children) {
  let e;

  // 如果type是string则当成普通的element
  if (typeof type === 'string') {
    e = document.createElement(Type);
  } else {
    e = new Type();
  }

  for (let p in attributes) {
    e.setAttribute(p, attributes[p]);
  }

  for(let child of children) {
    if(typeof child === "string") {
      child = document.createTextNode(child);
    }
    e.appendChild(child);
  }
  return e;
}

export function render(component, parentElement) {

}

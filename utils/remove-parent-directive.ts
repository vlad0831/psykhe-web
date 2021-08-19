import { DirectiveOptions } from 'vue'

const RemoveParent: DirectiveOptions = {
  inserted(element: HTMLElement) {
    const children = Array.from(element.children);
    const parent = element.parentElement;

    if (! parent) {
      return;
    }

    children.forEach((item) => parent.appendChild(item));
    parent.removeChild(element);
  }
}

export default RemoveParent;

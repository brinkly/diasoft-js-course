const currentScript = document.currentScript;
const componentName = currentScript?.dataset.name;

class MySelect extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<p>my-select is work</p>`
  }
}

if (!componentName) {
  throw new Error('У скрипта веб-компонента отсутствует data-name.');
} else if (!customElements.get(componentName)) {
  customElements.define(componentName, MySelect);
}
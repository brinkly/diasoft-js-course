const currentScript = document.currentScript;
const componentName = currentScript?.dataset.name;

class MySelect extends HTMLElement {
  #selectButton;
  #selectPopup;
  #selectPopupSearch;
  #optionsBox;

  connectedCallback() {
    this.#createTemplate();
  }

  #createTemplate() {
    const options = Array.from(this.querySelectorAll('option')).map((option) => ({
      value: option.value,
      text: option.textContent,
    }));

    const template = document.createElement('template');
    template.innerHTML = `
      <button type="button" class="select-button"><!--Здесь будет выбранная опция--></button>
      <div class="select-popup">
        <input class="select-popup-search" type="search" placeholder="Search..." />
        <div class="select-popup-options"><!--Здесь будет список опций--></div>
      </div>
    `;

    this.append(template.content.cloneNode(true));

    this.#selectButton = this.querySelector('.select-button');
    this.#selectPopup = this.querySelector('.select-popup');
    this.#selectPopupSearch = this.querySelector('.select-popup-search');
    this.#optionsBox = this.querySelector('.select-popup-options');

    const renderedOptions = this.#renderOptions(options);
    this.#optionsBox.replaceWith(renderedOptions);
    this.#optionsBox = renderedOptions;

    Array.from(this.querySelectorAll('option')).forEach((option) => option.remove());
  }

  #renderOptions(options) {
    const optionsTemplate = document.createElement('template');
    const optionTemplate = document.createElement('template');

    optionsTemplate.innerHTML = `<div class="select-popup-options"></div>`;
    optionTemplate.innerHTML = `
      <label class="option">
        <input type="checkbox" />
        <span class="option-text"></span>
      </label>
    `;

    const optionsBox = optionsTemplate.content.firstElementChild.cloneNode(true);

    options.forEach(({ value, text }) => {
      const optionElement = optionTemplate.content.firstElementChild.cloneNode(true);
      optionElement.dataset.value = value;
      optionElement.querySelector('.option-text').textContent = text;
      optionsBox.append(optionElement);
    });

    return optionsBox;
  }
}

if (!componentName) {
  throw new Error('У скрипта веб-компонента отсутствует data-name.');
} else if (!customElements.get(componentName)) {
  customElements.define(componentName, MySelect);
}

const currentScript = document.currentScript;
const componentName = currentScript?.dataset.name;

class MySelect extends HTMLElement {
  #shadow;
  #selectButton;
  #selectPopup;
  #selectPopupSearch;
  #optionsBox;

  connectedCallback() {
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#createTemplate();
  }

  #openPopup = () => {
    this.#selectPopup.classList.toggle('open');
  };

  #createTemplate() {
    const options = Array.from(this.querySelectorAll('option')).map((option) => ({
      value: option.value,
      text: option.textContent,
    }));

    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        :host {
          position: relative;
          display: inline-block;
          min-width: 20rem;
          font-family: var(--select-font-family, Segoe UI), sans-serif;
        }

        .select-button {
          position: relative;
          width: 100%;
          min-height: 2.75rem;
          padding: 0.75rem 2.75rem 0.75rem 0.9375rem;
          border: 1px solid var(--select-border-color, #cbd5e1);
          border-radius: 0.6rem;
          background: var(--select-button-background, #ffffff);
          text-align: left;
          font: inherit;
          cursor: pointer;
        }

        .select-button::after {
          content: "";
          position: absolute;
          top: 50%;
          right: 1rem;
          width: 0.6rem;
          height: 0.6rem;
          border-right: 2px solid var(--select-icon-color, #64748b);
          border-bottom: 2px solid var(--select-icon-color, #64748b);
          transform: translateY(-65%) rotate(45deg);
          transition: transform 0.2s ease;
        }

        .select-button:hover {
          border-color: var(--select-border-color-hover, #94a3b8);
          box-shadow: 0 1px 2px rgb(15 23 42 / 0.08), 0 14px 36px rgb(15 23 42 / 0.1);
        }

        .select-popup {
          display: none;
          position: absolute;
          z-index: 1000;
          top: calc(100% + 0.5rem);
          left: 0;
          padding: 0.75rem;
          background: var(--select-popup-background, #fff);
          border: 1px solid var(--select-border-color, #cbd5e1);
          border-radius: 0.6rem;
          box-shadow: 0 20px 50px rgb(15 23 42 / 0.16), 0 8px 24px rgb(15 23 42 / 0.08);
        }

        .select-popup.open {
          display: block;
        }

        .select-popup-search {
          width: 100%;
          margin-bottom: 0.5rem;
          padding: 0.7rem 0.875rem;
          border: 1px solid var(--select-search-border-color, #dbe2ea);
          border-radius: 0.6rem;
          background: var(--select-search-background, #f8fafc);
          font: inherit;
        }

        .select-popup-options {
          display: grid;
          overflow-y: auto;
        }

        .option {
          display: grid;
          grid-template-columns: 1rem 1fr;
          gap: 0.75rem;
          align-items: center;
          padding: 0.75rem 0.875rem;
          border-radius: 0.6rem;
          cursor: pointer;
        }

        .option:hover {
          background: var(--select-option-hover-background, #f1f5f9);
        }

        .option input {
          width: 1rem;
          height: 1rem;
        }
      </style>
      <button type="button" class="select-button">Select an option</button>
      <div class="select-popup">
        <input class="select-popup-search" type="search" placeholder="Search options" />
        <div class="select-popup-options"><!--Здесь будет список опций--></div>
      </div>
    `;

    this.#shadow.append(template.content.cloneNode(true));

    this.#selectButton = this.#shadow.querySelector('.select-button');
    this.#selectPopup = this.#shadow.querySelector('.select-popup');
    this.#selectPopupSearch = this.#shadow.querySelector('.select-popup-search');
    this.#optionsBox = this.#shadow.querySelector('.select-popup-options');

    const renderedOptions = this.#renderOptions(options);
    this.#optionsBox.replaceWith(renderedOptions);
    this.#optionsBox = renderedOptions;
    this.#selectButton.addEventListener('click', this.#openPopup);

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

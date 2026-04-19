class MySelect extends HTMLElement {
  #shadow;
  #selectButton;
  #selectPopup;
  #optionsBox;
  #searchInput;
  #options = [];
  #selectedValues = new Set();
  #searchQuery = '';

  connectedCallback() {
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#createTemplate();
    document.addEventListener('click', this.#handleDocumentClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.#handleDocumentClick);
    this.#searchInput?.removeEventListener('input', this.#handleSearchInput);
    this.#searchInput?.removeEventListener('search', this.#handleSearchInput);
    this.#searchInput?.removeEventListener('keyup', this.#handleSearchInput);
  }

  get value() {
    return Array.from(this.#selectedValues).join(',');
  }

  set value(rawValue) {
    const nextValues = String(rawValue ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);

    this.#selectedValues = new Set(nextValues);

    if (!this.#optionsBox) {
      return;
    }

    this.#syncOptionInputs();
    this.#syncButtonLabel();
    this.setAttribute('value', this.value);
  }

  #togglePopup = () => {
    if (this.#selectPopup.classList.contains('open')) {
      this.#closePopup();
      return;
    }

    this.#openPopup();
  };

  #createTemplate() {
    const externalSearchInput = this.querySelector('[slot="search"]');
    const searchPlaceholder = this.getAttribute('search-placeholder');
    this.#options = Array.from(this.querySelectorAll('option')).map((option) => ({
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
          font-family: var(--font-family, Segoe UI), sans-serif;
        }

        .select-button {
          position: relative;
          width: 100%;
          min-height: 2.75rem;
          padding: 0.75rem 2.75rem 0.75rem 0.9375rem;
          border: 1px solid var(--border-color, #cbd5e1);
          border-radius: 0.6rem;
          background: var(--background, #ffffff);
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
          background: var(--background, #fff);
          border: 1px solid var(--border-color, #cbd5e1);
          border-radius: 0.6rem;
          box-shadow: 0 20px 50px rgb(15 23 42 / 0.16), 0 8px 24px rgb(15 23 42 / 0.08);
        }

        .select-popup.open {
          display: block;
        }

        .select-popup-search, ::slotted(.select-popup-search) {
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
        <slot name="search">
          <input class="select-popup-search" type="search" placeholder="Search options" />
        </slot>
        <div class="select-popup-options"><!--Здесь будет список опций--></div>
      </div>
    `;

    this.#shadow.append(template.content.cloneNode(true));

    this.#selectButton = this.#shadow.querySelector('.select-button');
    this.#selectPopup = this.#shadow.querySelector('.select-popup');
    this.#optionsBox = this.#shadow.querySelector('.select-popup-options');
    this.#searchInput = this.#shadow.querySelector('.select-popup-search');

    if (searchPlaceholder) {
      this.#searchInput.placeholder = searchPlaceholder;
    }

    if (externalSearchInput instanceof HTMLInputElement) {
      this.#searchInput.placeholder = externalSearchInput.placeholder || this.#searchInput.placeholder;
      this.#searchInput.value = externalSearchInput.value;
      externalSearchInput.remove();
    }

    this.#selectButton.addEventListener('click', this.#togglePopup);
    this.#optionsBox.addEventListener('change', this.#handleOptionChange);
    this.#searchInput.addEventListener('input', this.#handleSearchInput);
    this.#searchInput.addEventListener('search', this.#handleSearchInput);
    this.#searchInput.addEventListener('keyup', this.#handleSearchInput);

    Array.from(this.querySelectorAll('option')).forEach((option) => option.remove());

    const initialValue = this.getAttribute('value');
    if (initialValue !== null) {
      this.value = initialValue;
    } else {
      this.#syncButtonLabel();
      this.setAttribute('value', this.value);
    }

    this.#searchQuery = this.#searchInput.value.trim().toLowerCase();
    this.#renderVisibleOptions();
  }

  #renderVisibleOptions() {
    const visibleOptions = this.#options.filter(({ text }) => text.toLowerCase().includes(this.#searchQuery));
    const optionTemplate = document.createElement('template');

    this.#optionsBox.replaceChildren();

    if (visibleOptions.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.textContent = 'Nothing found';
      this.#optionsBox.append(emptyState);
      return;
    }

    optionTemplate.innerHTML = `
      <label class="option">
        <input type="checkbox" />
        <span class="option-text"></span>
      </label>
    `;

    visibleOptions.forEach(({ value, text }) => {
      const optionElement = optionTemplate.content.firstElementChild.cloneNode(true);
      optionElement.dataset.value = value;
      optionElement.dataset.text = text.toLowerCase();
      const input = optionElement.querySelector('input');
      input.value = value;
      input.checked = this.#selectedValues.has(value);
      optionElement.querySelector('.option-text').textContent = text;
      this.#optionsBox.append(optionElement);
    });
  }

  #openPopup() {
    this.#selectPopup.classList.add('open');
    this.#searchInput?.focus();
  }

  #closePopup() {
    this.#selectPopup.classList.remove('open');
  }

  #handleDocumentClick = (event) => {
    const eventPath = event.composedPath();

    if (eventPath.includes(this)) {
      return;
    }

    this.#closePopup();
  };

  #handleOptionChange = (event) => {
    const optionInput = event.target.closest('input[type="checkbox"]');

    if (!optionInput) {
      return;
    }

    if (optionInput.checked) {
      this.#selectedValues.add(optionInput.value);
    } else {
      this.#selectedValues.delete(optionInput.value);
    }

    this.setAttribute('value', this.value);
    this.#syncButtonLabel();
  };

  #handleSearchInput = (event) => {
    this.#searchQuery = event.target.value.trim().toLowerCase();
    this.#renderVisibleOptions();
  }

  #syncOptionInputs() {
    Array.from(this.#optionsBox.querySelectorAll('input[type="checkbox"]')).forEach((input) => {
      input.checked = this.#selectedValues.has(input.value);
    });
  }

  #syncButtonLabel() {
    if (this.#selectedValues.size === 0) {
      this.#selectButton.textContent = 'Select an option';
      return;
    }

    const selectedLabels = this.#options
        .filter(({ value }) => this.#selectedValues.has(value))
        .map(({ text }) => text);

    this.#selectButton.textContent = selectedLabels.join(', ');
  }
}

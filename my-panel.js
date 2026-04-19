class MyPanel extends HTMLElement {
  #shadow;

  static observedAttributes = ['header', 'sub-header'];

  get #headerText() {
    return this.getAttribute('header') || 'Default header';
  }

  get #subHeaderText() {
    return this.getAttribute('sub-header') || '';
  }

  connectedCallback() {
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#createTemplate();
  }

  #createTemplate() {
    this.#shadow.innerHTML = '';

    const template = document.createElement('template');

    template.innerHTML = `
      <style>
        .panel {
          overflow: visible;
          border: 1px solid var(--border-color, #cbd5e1);
          border-radius: 1rem;
          background: var(--background, #ffffff);
          font-family: var(--font-family, Segoe UI), sans-serif;
        }

        .panel-header {
          padding: 1rem 1.25rem;
          font-size: 1.05rem;
          font-weight: 600;
        }
        
        .panel-sub-header-text {
          display: block;
          margin-top: 0.375rem;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 400;
        }
        
        .panel-content {
          padding: 0 1.25rem 1.25rem 1.25rem;
        }
      </style>
      <section class="panel">
        <header class="panel-header">
          <slot name="header">
            <span class="panel-header-text">${this.#headerText}</span>
          </slot>
          <slot name="sub-header">
            <span class="panel-sub-header-text" ${this.#subHeaderText ? '' : 'hidden'}>${this.#subHeaderText}</span>
          </slot>
        </header>
        <div class="panel-content">
          <slot></slot>
        </div>
        <div class="panel-footer">
          <slot name="footer"></slot>
        </div>
      </section>
    `;

    this.#shadow.append(template.content.cloneNode(true));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.#shadow) {
      return;
    }

    if (name === 'header') {
      const header = this.#shadow.querySelector('.panel-header-text');

      if (header) {
        header.textContent = this.#headerText;
      }
    }

    if (name === 'sub-header') {
      const subHeader = this.#shadow.querySelector('.panel-sub-header-text');

      if (subHeader) {
        subHeader.textContent = this.#subHeaderText;
        subHeader.hidden = !this.#subHeaderText;
      }
    }
  }
}

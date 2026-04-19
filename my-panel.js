class MyPanel extends HTMLElement {
  #shadow;

  connectedCallback() {
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#createTemplate();
  }

  #createTemplate() {
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
        
        .panel-content {
          padding: 0 1.25rem 1.25rem 1.25rem;
        }
      </style>
      <section class="panel">
        <header class="panel-header">
          <slot name="header">Panel Header</slot>
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
}

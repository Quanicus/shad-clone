class HTMXModalButton extends HTMLElement {
    constructor() {
        super() 
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host {
                    display: block;
                }
            </style>
            <slot></slot>
        `;
    }
    connectedCallback() {
        
    }
}
customElements.define('htmx-modal-button', HTMXModalButton);
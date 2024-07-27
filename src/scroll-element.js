class ScrollElement extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host {
                    display: block;
                    transition: translate 0.6s ease-in-out;
                }
            </style>
            <slot></slot>
        `;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        this.observeElement();
        //this.style.setProperty('transform', 'translateX(50%)');
    }
    observeElement() {
        const config = {
            //root: specifies element to use as viewport
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0
        }
        const observer = new IntersectionObserver(this.handleIntersection, config);
        observer.observe(this);
    }
    handleIntersection = (entries, observer) => {

        entries.forEach((element) => {
            if (element.isIntersecting) {
                this.style.setProperty('color', 'black');
                this.style.setProperty('translate', '300px');
            } else {
                this.style.setProperty('color', 'var(--primary-color-1)');
                this.style.setProperty('translate', '0px');
            }
        });
    }
}
customElements.define('scroll-element', ScrollElement);
class RadioWrap extends HTMLElement {
    static stylesApplied = false;

    constructor () {
        super()
        const template = document.createElement('template');
        template.innerHTML = `
        <style>
            :host {
                display: block;
                width: 1.5em;
                height: 1.5em; 
            }
            ::slotted(label) {
                display: block;
                width: 100%;
                height: 100%;
                cursor: pointer;
            }
        </style>
        <slot></slot>
        `;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        this.setupInput();
        this.setupHost();
        this.setStyles();
    }
    setupLabel() {

        const label = document.createElement('label');
        label.classList.add('radio-wrap-label')
        label.appendChild(this.getSVG());
        this.appendChild(label);
    }
    setupInput() {
        const config = {childList: true, subtree: false};
        const observer = new MutationObserver((mutationList, observer) => {
            for (const mutation of mutationList) {
                const input = mutation.addedNodes[0];
                if (input.tagName && input.tagName.toLowerCase() === 'input') {
                    const group = this.getAttribute('data-group');
                    input.setAttribute('name', group);
                    input.setAttribute('type', 'radio');
                    input.style.setProperty('display', 'none');
                    input.classList.add('radio-wrap-input');

                    this.addEventListener('click', () => {
                        input.click();
                    });
                    this.setupLabel();
                }
            }
        });
        observer.observe(this, config);  
    }
    setupHost() {
        this.style.setProperty('cursor', 'pointer');
    }
    getSVG() {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        const outer = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        const inner = document.createElementNS("http://www.w3.org/2000/svg", 'circle');

        const color = this.getAttribute('data-color') || 'black';
        svg.style.setProperty('width', '100%');
        svg.style.setProperty('height', '100%');
        svg.style.setProperty('color', color);

        outer.setAttribute('class', 'outer');
        outer.setAttribute('cx', '50%');
        outer.setAttribute('cy', '50%');
        outer.setAttribute('r', '40%');
        outer.style.setProperty('stroke', 'currentColor');
        outer.style.setProperty('stroke-dasharray', '252%');
        outer.style.setProperty('stroke-dashoffset', '252%');
        outer.style.setProperty('stroke-width', '10%');
        outer.style.setProperty('stroke-linecap', 'round');
        outer.style.setProperty('fill', 'none');
        outer.style.setProperty('transition', 'stroke-dashoffset 0.5s ease-in-out');

        inner.setAttribute('class', 'inner');
        inner.setAttribute('cx', '50%');
        inner.setAttribute('cy', '50%');
        inner.setAttribute('r', '27%');
        inner.style.setProperty('stroke', 'currentColor');
        inner.style.setProperty('stroke-width', '5%');
        inner.style.setProperty('fill', 'transparent');
        inner.style.setProperty('transition', 'fill 0.5s ease-in-out');

        svg.append(outer, inner);
        return svg;
    }
    setStyles() {
        if (!RadioWrap.stylesApplied) {
            this.appendChild(this.getStyleNode());
            RadioWrap.stylesApplied = true;
        } 
    }
    getStyleNode() { //THESE STYLES ARE APPLIED TO THE LIGHT DOM
        const style = document.createElement('style');
        style.textContent = `        
            .radio-wrap-input:checked + .radio-wrap-label circle.outer {
                stroke-dashoffset: 0 !important;
            }
            .radio-wrap-input:checked + .radio-wrap-label circle.inner, 
            .radio-wrap-label:hover circle.inner{
                fill: currentColor !important;
            }`;

        return style;
    }   
    setupText() {
        const textBox = document.createElement('span');
        const textContent = label.textContent;
        label.textContent = '';
        textBox.textContent = textContent;

        this.appendChild(textBox);
    }
}
customElements.define('radio-wrap', RadioWrap);
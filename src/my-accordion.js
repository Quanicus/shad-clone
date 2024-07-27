

class Accordion extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
        <style>
        :host, ::slotted(ul) {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        :host {
            font-family: Ariel;
            font-size: 1.2rem;
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 0.5em;
            overflow: auto;
            width: fit-content;
        }
        ::slotted(ul) {
            font-family: 'Courier New', monospace;
            list-style: none;
            display: grid;
            grid-template-rows: 0fr;
            border-bottom: 3px solid blue;
            transition: grid-template-rows 350ms ease-in-out;
        }
        </style>
        <slot><slot>
        `;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(template.content.cloneNode(true));
    }
    connectedCallback() {
        //this.buildAccordion();
        this.setupAccordion();
    }
    setupAccordion() {
        
        const config = {childList: true, subtree: false};
        const observer = new MutationObserver((mutationList, observer) => {
            for (const mutation of mutationList) {
                for (const ul of mutation.addedNodes) {
                    if (ul.tagName && ul.tagName.toLowerCase() === 'ul') {
                        const gridItem = this.makeGridItem();
                        const liContainer = this.makeliContainer();
                        const heading = this.makeHeading(ul, liContainer);

                        for (const li of ul.children) {
                            this.formatli(li);                 
                        }
                        liContainer.append(...ul.children);
                        gridItem.append(heading, liContainer);
                        ul.appendChild(gridItem);
                    }
                }
            }
        });
        observer.observe(this, config);
    }

    makeHeading(ul) {
        
        const title = ul.getAttribute('data-title');
        const heading = document.createElement('div');

        heading.setAttribute('class', 'my-accordion-heading');
        heading.setAttribute('tabindex', '-1');
        heading.style.setProperty('position', 'relative');
        heading.style.setProperty('display', 'flex');
        heading.style.setProperty('justify-content', 'space-between');
        heading.style.setProperty('align-items', 'center');
        heading.style.setProperty('gap', '1.5em');
        heading.style.setProperty('height', '2em');
        heading.style.setProperty('padding', '0 0.5em 0 0.5em');
        heading.style.setProperty('cursor', 'pointer');

        heading.textContent = title;

        const svg = this.makeSVG();
        heading.appendChild(svg);

        const border = this.makeBorder();
        heading.appendChild(border);

        heading.addEventListener('click', () => {
            if(ul.getAttribute('expanded') === 'true') {
                ul.setAttribute('expanded', 'false');
                ul.style.setProperty('grid-template-rows', '0fr');
                border.style.setProperty('transform', 'translateX(100%)');
                
                svg.style.setProperty('transform', 'rotate(0)');
            } else {
                ul.setAttribute('expanded', 'true');
                ul.style.setProperty('grid-template-rows', '1fr');
                border.style.setProperty('transform', 'translateX(0)');
                svg.style.setProperty('transform', 'rotate(180deg)');
            }
        });

        return heading;
    }
    makeGridItem() {
        const gridItem = document.createElement('div');
        gridItem.setAttribute('class', 'accordion-grid-item');
        gridItem.style.setProperty('overflow', 'hidden');
        //gridItem.style.setProperty('font-size', '1.2rem');
        gridItem.style.setProperty('min-height', '2em');
        //gridItem.style.setProperty('border-bottom', '0.3em solid red');
        return gridItem;
    }
    makeliContainer() {
        const liContainer = document.createElement('div');
        liContainer.setAttribute('class', 'li-container');
        //liContainer.style.setProperty('position', 'relative');
        liContainer.style.setProperty('display', 'flex');
        liContainer.style.setProperty('flex-direction', 'column');
        //liContainer.style.setProperty('padding', '0.2em 0 0.2em 0');
        liContainer.style.setProperty('gap', '0.3em');
        return liContainer;
    }
    formatli(li) {
        li.style.setProperty('display', 'block');
        li.style.setProperty('list-style', 'none');
        li.style.setProperty('font-size', '.85em')
        //li.style.setProperty('text-align', 'center');
        li.style.setProperty('padding', '0.5em 0 0.5em 1.5em');
        //li.style.setProperty('background-color', 'aqua');
    }
    makeSVG() {
        const chevron = document.createElement('div');
        chevron.style.setProperty('max-width', '1.5em');
        chevron.style.setProperty('max-height', '1.5em');
        chevron.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none">
            <path xmlns="http://www.w3.org/2000/svg" d="M7 14.5L12 9.5L17 14.5" stroke="#000000" stroke-width="0.1em" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        chevron.style.setProperty('transition', 'transform 350ms ease-out');
        return chevron;
    }
    makeBorder() {
        const border = document.createElement('div');
        border.setAttribute('class', 'border');
        border.style.setProperty('position', 'absolute');
        border.style.setProperty('width', '100%');
        border.style.setProperty('height', '2em');
        border.style.setProperty('border-bottom', '3px solid blue');
        border.style.setProperty('transform', 'translateX(100%)');
        border.style.setProperty('transition', 'all 350ms ease-in-out');
        return border;
    }
}

customElements.define('my-accordion', Accordion);
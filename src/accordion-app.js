class AccordionApp extends HTMLElement {
    constructor() {
        super() 
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
            :host {
                display: flex;
                background-color: grey;
            }
            #accordion-app-content {
                overflow: hidden;
                width: 100%;
                height: 100%;
                background-color: green;
                transition: width 1s ease-in-out;
            }
            .app-display {
                flex-grow: 1;
                overflow: auto;
            }
            </style>
            <slot></slot>
            <div id="accordion-app-display" class="app-display">
                <div id="accordion-app-content">sup foo</div>
            </div>
        `;
        const shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(template.content.cloneNode(true));
        this.display = shadow.querySelector('.app-display');
    }
    connectedCallback() {
        //this.connectTemplate();
        this.setInitialView();
        this.connectAccordion();
    }

    connectAccordion() {
        const slot = this.shadowRoot.querySelector('slot');
        let firecount = 0;
        slot.addEventListener('slotchange', () => {

            
            const accordion = slot.assignedElements()[0];
            //console.log(accordion);
            if (accordion) {
                //console.log('inside', firecount);
                for (const ul of accordion.children) {
                    const liContainer = ul.querySelector('.li-container');
                    for (const li of liContainer.children) {
                        this.processLiElement(li)
                    }
                }
                htmx.process(this.shadowRoot);
            }
        });
    }
    processLiElement(li) {
        const endpoint = li.getAttribute('data-endpoint');
        const liShadow = document.createElement('div');

        liShadow.setAttribute('hx-get', endpoint);
        liShadow.setAttribute('hx-target', '#accordion-app-content');
        liShadow.setAttribute('hx-swap', 'outerHTML swap:1s');

        li.style.setProperty('cursor', 'pointer');

        //liShadow.addEventListener('') add a listener for when connected
        const display = this.shadowRoot.querySelector('#accordion-app-display');
        
        li.addEventListener('click', () => {
            const content = this.shadowRoot.querySelector('#accordion-app-content');
            
            content.style.setProperty('width', '0');
            content.style.setProperty('background-color', 'blue');
            liShadow.click();//trigger hx-get on content
        });

        this.shadowRoot.appendChild(liShadow);
    }
    setInitialView() {
        const content = this.shadowRoot.querySelector('#accordion-app-content');
        /* content.style.setProperty('width', '200px');
        content.style.setProperty('height', '200px');
        content.style.setProperty('background-color', 'blue'); */
    }
}
customElements.define('accordion-app', AccordionApp);
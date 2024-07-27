class customRadio extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host {
                    width: fit-content;
                    display: flex;
                    justify-content: space-between;
                    
                }
                svg {

                }
                circle.outer {
                    stroke-dasharray: 252%;
                    stroke-dashoffset: 252%;
                    stroke-width: 10%;
                    stroke-linecap: round;
                    fill: none;
                    transition: stroke-dashoffset 0.8s ease-in;
                }
                circle.inner {
                    stroke-width: 5%;
                    fill: transparent;
                    transition: fill 0.5s ease-in;
                }
                label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                input:checked + label .outer {
                    stroke-dashoffset: 0;
                }
                input {
                    display: none;
                }
            </style>
            
            <slot></slot>
            
            
            `;
        const shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(template.content.cloneNode(true));
        //this.radioCount = 0;
        this.setRadioButtons();
        
        
        
    }
    connectedCallback() {
        this.setStyles();
    }
    setStyles() {
        const styles = document.createElement('style');

        const direction = this.getAttribute('data-direction') || 'row';
        const gap = this.getAttribute('data-gap') || '0';
        const color = this.getAttribute('data-color') || 'black';
        styles.textContent = `
            :host {
                flex-direction: ${direction};
                gap: ${gap};
            }
            circle {
                stroke: ${color};
            }
            input:checked + label .inner,
            label:hover .inner {
                fill: ${color};
            }
        `;
        this.shadowRoot.appendChild(styles.content.cloneNode(true));
    }
    setRadioButtons() {
        /* const div = document.createElement('div');
        this.shadowRoot.appendChild(div); */
        let radioCount = 0;
        const groupName = this.getAttribute('data-group') || 'cust-radio-grp';
        const slot = this.shadowRoot.querySelector('slot');

        slot.addEventListener('slotchange', () => {

            slot.assignedElements().forEach((input) => {

                if(!input.id) {input.setAttribute('id', String(radioCount++))}
                input.setAttribute('type', 'radio');
                input.setAttribute('name', groupName);

                const text = document.createElement('span');
                text.textContent = input.getAttribute('data-label');

                const label = document.createElement('label');
                label.setAttribute('for', input.id);
                label.style.setProperty('cursor', 'pointer');
                label.appendChild(this.getSVGClone());
                label.appendChild(text);

                this.shadowRoot.append(input, label);
            });
        });
    }
    getSVGClone()  {
        const width = this.getAttribute('data-width') || '25';
        const height = this.getAttribute('data-height') || '25';
        const svgTemplate = document.createElement('template');
        svgTemplate.innerHTML = `
            <svg width="${width}" height="${height}"> 
                <circle class="outer" cx="50%" cy="50%" r="40%"/>
                <circle class="inner" cx="50%" cy="50%" r="27%"/>  
            </svg>
        `;
        return svgTemplate.content.cloneNode(true);
    }
}
customElements.define('custom-radio', customRadio);
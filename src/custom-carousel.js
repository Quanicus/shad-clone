class Carousel extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
        <style>
            * {
                box-sizing: border-box;
                padding: 0;
                margin: 0;
            }
            :host {
                display: block;
                position: relative;
                min-height: 250px;
                min-width: 250px;
                border-radius: 10px;
                overflow: hidden;
            }
            slot {
                position: absolute;
                display: flex;
                flex-direction: row;
                width: 100%;
                height: 100%;
                overflow: hidden;
                scroll-snap-type: x mandatory;
            }
            ::slotted(*) {
                flex: 0 0 100%;
                scroll-snap-align: start;
            }
            .button svg {
                fill: white;
                width: 50%;
                z-index: 2;
            }
            #radio-buttons {
                display: flex;
                width: 30%;
                justify-content: space-between;
                margin-bottom: 5%;
            }

            #radio-buttons label {
                background: black;
                width: 10px;
                height: 10px;
            }
            nav {
                display: flex;
                position: absolute;
                justify-content: space-between;
                align-items: flex-end;
                height: 100%;
            }
            .button {
                height: 100%;
                width: 15%;
                display: flex;
                justify-content: center;
                position: relative;
                overflow: hidden;
            }
            .button:hover svg {
                fill: gold;
                filter: drop-shadow(0 0 10px rgba(255, 255, 0, 1));
            }
            #previous:hover::before, #next:hover::before {
                transform: translateX(0);
            }
            .button::before {
                content: "";
                position: absolute;
                width: 100%;
                height: 100%;
                transition: transform 0.3s ease;
                z-index: 1;
            }
            #previous::before {
                background: linear-gradient(to right, rgba(0,0,0,0.6), transparent);
                transform: translateX(-100%);

            }
            #next::before {
                background: linear-gradient(to left, rgba(0,0,0,0.6), transparent);
                transform: translateX(100%);
            }
        </style>
        <slot></slot>
        <div class="radio-box"></div>
        <nav>
            <div class="button" id="previous">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M15.293 3.293 6.586 12l8.707 8.707 1.414-1.414L9.414 12l7.293-7.293-1.414-1.414z"/>
                </svg>
            </div>
            <custom-radio id="radio-buttons"></custom-radio>
            <div class="button" id="next">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M7.293 4.707 14.586 12l-7.293 7.293 1.414 1.414L17.414 12 8.707 3.293 7.293 4.707z"/>
                </svg>
            </div>
        </nav>
        
        `;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(template.content.cloneNode(true));
        
        this.current = 0;
        
        this.radioButtons = this.shadowRoot.querySelector('#radio-buttons');
    }

    connectedCallback() {
        this.setRadioButtons();
        this.setScrollButtons();
    }

    setRadioButtons () {
        const slot = this.shadowRoot.querySelector('slot');
        const color = this.getAttribute('data-color') || 'white';
        this.radioButtons.setAttribute('data-color', color);
        // Use slotchange event to wait for assigned elements
        slot.addEventListener('slotchange', () => {
            //loop through slotted images
            slot.assignedElements().forEach((element) => {
                const input = document.createElement('input');
                
                input.addEventListener('change', () => {
                    element.scrollIntoView({behavior: 'smooth'});
                });
                this.radioButtons.appendChild(input);//SENT TO SLOT
                
            });
            this.radioButtons.firstElementChild.setAttribute('checked', true);  
            this.radioButtons = Array.from(this.radioButtons.querySelectorAll('input'));
        });
        
    }
    setScrollButtons() {
        const previous = this.shadowRoot.querySelector('#previous');
        const next = this.shadowRoot.querySelector('#next');
        
        previous.addEventListener('click', () => {
            if(this.current === 0) {
                this.current = this.radioButtons.length -1;
            } else {
                this.current--;
            }
            this.radioButtons[this.current].checked = true;
            const changeEvent = new Event('change', { bubbles: true });
            this.radioButtons[this.current].dispatchEvent(changeEvent);
        });

        next.addEventListener('click', () => {
            if(this.current === this.radioButtons.length - 1) {
                this.current = 0;
            } else {
                this.current++;
            }
            this.radioButtons[this.current].checked = true;
            const changeEvent = new Event('change', { bubbles: true });
            this.radioButtons[this.current].dispatchEvent(changeEvent);
        });
    }
    nextSlide() {
        this.radioButtons[this.current].checked = true;
        const changeEvent = new Event('change', { bubbles: true });
        this.radioButtons[this.current].dispatchEvent(changeEvent);
    }
}

customElements.define('custom-carousel', Carousel);
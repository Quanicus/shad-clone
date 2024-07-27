const template = document.createElement('template');
template.innerHTML = `
    <style>
        :host([active]) {
            & .modal-container {
                transform: translateY(0);
                transition-delay: 0s;
            }
        } 
        .modal-container {
            display: grid;
            place-items: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0,0,0,0.8);
            z-index: 9999;
            transform: translateY(-100%);
            transition: transform 0.4s ease-in-out;
        }
        .wrapper {
            width: min(66vw, 1000px);
            height: min(66vh, 800px);
        }

        .view-container {
            position: relative;
            width: 0;
            height: 0;
            transition: all 0.6s ease-in-out;
            transition-delay: 1.0s;

            &[active] {
                width: 100%;
                height: 100%;
                transition-delay: 0.6s;
            }
            &[active=preswap] {
                width: 0;
                height: 0;
                transition-delay: 0s;
            }
            &[active=postswap] {
                transition-delay: 0s;
            } 
            
            .content-container {
                box-sizing: border-box;
                display: grid;
                place-items: center;
                height: 100%;
                width: 100%;
                overflow: hidden;
                border: 1px solid white;
                transform: translateX(-101%);
                transition: transform 0.8s ease-in-out;

                &[active] {
                    transform: translate(0);
                    transition-delay: 1.4s;
                }
            }

            svg.corner {     
                position: absolute;
                fill: none;
                stroke: white;
                stroke-width: 0.6rem;
                transition: all 0.4s ease-in-out;
                transition-delay: 0.6s;
                
                &.left {
                    top: -2.5px;
                    left: -2.5px;

                    [active] & {
                        top: -2rem;
                        left: -2rem;
                    }
                    [active=preswap] & {
                        top: -2.5px;
                        left: -2.5px;
                    }
                }

                &.right {
                    bottom: -2.5px;
                    right: -2.5px;

                    [active] & {
                        bottom: -2rem;
                        right: -2rem;
                    }
                    [active=preswap] & {
                        bottom: -2.5px;
                        right: -2.5px;
                    }
                } 
            }

            svg.border {
                position: absolute;
                width: calc(100% + 4rem);
                height: calc(100% + 4rem);
                inset: -2rem;  

                line {
                    stroke: white;
                    stroke-width: 1px;
                    stroke-dasharray: 8 5;
                    stroke-dashoffset: 50%;
                    transition: transform 0.6s ease-in-out;

                    &.left {
                        transform: scale(1, 0);
                        transform-origin: top;
                        transition-delay: 0.6s;

                        [active] & {
                            transition-delay: 1.0s;
                            transform: scale(1);
                        }
                        
                    }

                    &.bottom {
                        transform: scale(0, 1);
                        transform-origin: right;
                        transition-delay: 0.4s;

                        [active] & {
                            transition-delay: 1.2s;
                            transform: scale(1);
                        }
                
                    }
                }
            }
        }

        .content-wrap {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        .close-button {
            position: absolute;
            top: 50px;
            right: 50px;
            width: 50px;
            height: 50px;
            background-color: white;
        }
        .activate-button {
            
        }
    </style>
    <div class="modal-container">
        <div class="wrapper">
            <div class="view-container" >
                <svg class="corner left" width="50" height="50">
                    <path d="M0 0 H50"></path>
                    <path d="M0 0 V50"></path>
                </svg>
                <svg class="corner right" width="50" height="50">
                    <path d="M50 50 H-50"></path>
                    <path d="M50 50 V-50"></path>
                </svg>
                <svg class="border">
                    <line class="left" x1="0.15rem" y1="60px" x2="0.15rem" y2="calc(100% - 0.15rem)"></line>
                    <line class="bottom" x1="0.15rem" y1="calc(100% - 0.15rem)" x2="calc(100% - 60px)" y2="calc(100% - 0.15rem)"></line>
                </svg>
                <div class="content-wrap">
                    <div class="content-container" >
                        <slot><slot>
                    </div> 
                </div>
            </div>
        </div>
        <div class="close-button"></div>
    </div>
    <shad-button class="activate-button" hx-swap="innerHTML" hx-trigger="click delay:.5s">
    </shad-button>
`;
class HTMXModal extends HTMLElement {
    static count = 0;
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        shadow.appendChild(template.content.cloneNode(true));
        this.closeButton = shadow.querySelector('.close-button');
        this.viewContainer = shadow.querySelector('.view-container');
        this.modalContainer = shadow.querySelector(".modal-container");
        this.contentContainer = shadow.querySelector('.content-container');
        this.activateButton = shadow.querySelector(".activate-button");
        this.activateButtons();
        
    }
    connectedCallback() {
        this.setLabel();
        this.setTarget();
        this.addHTMXListeners();
        htmx.process(this.shadowRoot);
    }
    setLabel() {
        const label = this.getAttribute("data-label") ?? "Lob me in daddy";
        const textNode = document.createTextNode(label);
        this.activateButton.appendChild(textNode);
    }
    setTarget() {
        //this.activateButton.setAttribute("hx-target", `.content-container`);
        let id = this.id || `htmx-modal-${HTMXModal.count++}`;
        this.id = id;
        this.activateButton.setAttribute("hx-target", `global #${id}`);

        const url = this.getAttribute("data-url");
        if (!url) throw new Error("must provide a data-url to htmx-modal");
        this.activateButton.setAttribute("hx-get", url);
    }    
    activateButtons() {
        this.closeButton.addEventListener('click', this.close);
        this.activateButton.addEventListener("click", this.open);
    }
    addHTMXListeners() {
        this.addEventListener('htmx:beforeRequest', () => {
            this.viewContainer.setAttribute('active', 'preswap');

        });        
        this.addEventListener("htmx:afterRequest", (event) => {
            const response = event.detail.xhr.response;
            if (response === "User successfully logged in.") {         
                this.closeButton.dispatchEvent(new Event("click"));
            }
        });
        this.addEventListener('htmx:afterSwap', (event) => {
            const response = event.detail.xhr.response;
            if (response) {
                this.viewContainer.setAttribute('active', 'postswap');
            }
        })
    }
    open = () => {
        this.modalContainer.style.transform = "translateY(0)";
        this.modalContainer.style.transitionDelay = "0s";
        this.viewContainer.setAttribute('active', null);
        this.contentContainer.setAttribute('active', null); 
    }
    close = () => {
        this.removeAttribute('active');
        this.viewContainer.removeAttribute('active');
        this.contentContainer.removeAttribute('active');
        this.modalContainer.style.transform = "translateY(-100%)";
        this.modalContainer.style.transitionDelay = "1.8s";
    }

}
customElements.define('htmx-modal', HTMXModal);

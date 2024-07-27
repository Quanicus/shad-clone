const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            position: fixed;
            top: 0;
            background-color: rgba(0,0,0, 0.5);
            z-index: 999;
            
        }
        .nav-container {
            position: absolute;
            display: flex;
            flex-direction: column;
            min-width: 30px;
            width: 4vw;
            height: 100vh;
            cursor: pointer;
        }
        .top-btn, .bottom-btn {
            height: 4vw;
            min-height: 30px;
            border: 1px solid white;
        }
        .main-btn {
            display: grid;
            place-content: center;
            flex-grow: 1;
            border: 1px solid white;

            & path {
                fill: white;
            }
            &:hover path {
                fill: gold;
            }
        }
        .transition-cover {
            position: absolute;
            width: 100vw;
            height: 100vw;
            transform: translateX(-100%);
            transition: transform 0.8s ease-in-out;
            background-color: gold;
            transition-delay: 0.25s;

            &[active] {
                transform: translateX(0);
                transition: transform 0.6s ease-in-out;
            }
        }
        .display {
            position: absolute;
            width: 100vw;
            height: 100vh;
            background-color: grey;
            transform: translateX(-100%);
            transition: transform 0.6s ease-in-out;
            transition-delay: 0.25s;

            &[active] {
                transform: translateX(0);
                transition: transform 0.8s ease-in-out;

                &::after {
                    opacity: 0;
                    transition-delay: 0.8s;
                    pointer-events: none;
                }
            }

            &::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: black;
                opacity: 1;
                z-index: 2;
                transition: opacity 0.25s ease-in-out;
            }
            
            &.main {
                & .control-box {
                    display: flex;
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    gap: .5rem;
                
                    & .close-btn {
                        position: static;
                    }
                }
            }
        }
        .display.bottom {
            display: grid;
            place-content: center;
        }
        .close-btn {
            position: absolute;
            width: 2em;
            height: 2em;
            top: 1rem;
            right: 1rem;
            background-color: white;
            cursor: pointer;
        }
        ::slotted([slot="top"]) {
            display: grid;
            place-content: center;
            height: 100%;
        }
        #testput {
            appearance: none;
            padding: 1rem;
            outline: transparent;
            background: black;
            color: gold;
        }
    </style>

    <div class="nav-container">
        <div class="top-btn"></div>
        <div class="main-btn">
            <svg width="50px" height="50px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g id="icomoon-ignore"></g>
                <path d="M15.306 2.672h1.066v12.795h-1.066v-12.795z"></path>
                <path d="M21.17 4.829v1.179c3.881 1.914 6.559 5.912 6.559 10.524 0 6.467-5.261 11.729-11.729 11.729s-11.729-5.261-11.729-11.729c0-4.484 2.53-8.386 6.236-10.359v-1.199c-4.318 2.056-7.302 6.457-7.302 11.558 0 7.066 5.729 12.795 12.795 12.795s12.795-5.729 12.795-12.795c0-5.226-3.135-9.718-7.625-11.704z" ></path>
            </svg>
        </div>
        <div class="bottom-btn"></div>
    </div>

    <div class="transition-cover"></div>

    <div class="top display">
        <div class="close-btn"></div>
        <slot name="top"></slot>
    </div>

    <div class="main display">
        <div class="control-box">
            <slot name="login"></slot>
            <div class="close-btn"></div>
        </div>
        <slot name="main"></slot>
    </div>

    <div class="bottom display">
        <div class="close-btn"></div>
        <slot name="bottom"></slot>
        <input id="testput" type="email" />
    </div>  
`;
class SideNav extends HTMLElement {
    constructor() {
        super();
        
        const shadow = this.attachShadow({mode: "open"});
        shadow.appendChild(template.content.cloneNode(true));

        this.topBtn = shadow.querySelector(".top-btn");
        this.mainBtn = shadow.querySelector(".main-btn");
        this.bottomBtn = shadow.querySelector(".bottom-btn");
        this.topDisplay = shadow.querySelector(".top");
        this.mainDisplay = shadow.querySelector(".main");
        this.bottomDisplay = shadow.querySelector(".bottom");
        this.transitionCover = shadow.querySelector(".transition-cover");
    }
    connectedCallback() {
        this.createModal();
        this.activateDisplays();
    }
    createModal() {
        //TODO: fetch login and turn the modal to a logout button if needed.
        const htmxModal = document.createElement("htmx-modal");
        htmxModal.setAttribute("data-url", "views/login.html");
        htmxModal.setAttribute("slot", "login");
        htmxModal.setAttribute("data-label", "Login");
        this.appendChild(htmxModal);
    }
    activateDisplays() {
        this.topBtn.addEventListener("click", () => {
            this.topDisplay.toggleAttribute("active");
            this.transitionCover.setAttribute("active", true);
        });
        this.mainBtn.addEventListener("click", () => {
            this.mainDisplay.toggleAttribute("active");
            this.transitionCover.setAttribute("active", true);
        });
        this.bottomBtn.addEventListener("click", () => {
            this.bottomDisplay.toggleAttribute("active");
            this.transitionCover.setAttribute("active", true);
        });
        const displays = this.shadowRoot.querySelectorAll(".display");
        displays.forEach(display => {
            const closeBtn = display.querySelector(".close-btn");
            closeBtn.addEventListener("click", () => {
                display.toggleAttribute("active");
                this.transitionCover.removeAttribute("active");
            });
        });
    }
}
customElements.define("side-nav", SideNav);
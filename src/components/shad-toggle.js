const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: flex;
            align-items: center;
            gap: .5rem;
            height: 1rem;
            font-size: 0.75rem;
            color: #D3D3D3;
        }
        .toggle_container {
            height: 100%;
            padding: 0.1rem;
            background-color: #303030;
            transition: background-color 0.2s ease-in;

            &:hover {
                cursor: pointer;
            }
            &[active] {
                background-color: white;

                & .slider {
                    transform: translateX(100%);
                }
            }
            & .slider {
                height: 100%;
                border-radius: 50%;
                background-color: black;
                transform: translateX(0);
                transition: all 0.2s ease-in-out;
            }
        }
    </style>
    <div class="toggle_container">
        <div class="slider"></div>
    </div>
    <div class="label"></div>
`;
class ShadToggle extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.container = this.shadowRoot.querySelector(".toggle_container");
        this.slider = this.shadowRoot.querySelector(".slider");
        this.label = this.shadowRoot.querySelector(".label");
    }
    connectedCallback() {
        const height = this.clientHeight;
        this.slider.style.width = `${height}px`;
        this.container.style.width = `${2 * height}px`;
        this.container.style.borderRadius = `${height}px`;
        this.label.textContent = this.getAttribute("data-label");
        this.container.addEventListener("click", this.handleToggle);
    }
    handleToggle = () => {
        this.container.toggleAttribute("active");
        const toggleEvent = new CustomEvent("custom-toggle", {
            detail: {
                isActive: this.hasAttribute("active"),
            },
            bubbles: true,
            composed: true
        });

        this.dispatchEvent(toggleEvent);
    }
}
customElements.define("shad-toggle", ShadToggle);
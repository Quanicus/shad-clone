const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: block;
            background-color: white;
            color: #303030;
            font-size: 12px;
            padding: .5rem;
            border: 1px solid #303030;
            border-radius: 5px;
            transition: opacity 0.2s ease-in;
            transition-delay: 0.25s;
            pointer-events: none;
            z-index: 99999;
        }
    </style>
    <slot><slot>
`;
class ShadTooltip extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.style.opacity = "0";
        this.style.position = "fixed";
        this.triggerElement = false;
    }
    connectedCallback() {
        if (this.parentElement === document.body) return;

        this.triggerElement = this.parentElement;
        this.formatTriggerElement();
        this.parentElement.removeChild(this); 
    }
    formatTriggerElement() {
        const triggerElement = this.triggerElement;
        triggerElement.addEventListener("mouseover", this.activateTooltip);
        triggerElement.addEventListener("mouseout", this.deactivateTooltip);
        triggerElement.addEventListener("click", this.deactivateTooltip);
    }
    activateTooltip = (event) => {
        document.body.appendChild(this);
        const triggerRect = this.triggerElement.getBoundingClientRect();
        const tooltipRect = this.getBoundingClientRect();
        
        this.style.left = `${triggerRect.left - tooltipRect.width/2 + triggerRect.width/2}px`;

        if (triggerRect.top - tooltipRect.height < 0) {
            this.style.top = `${triggerRect.bottom}px`;
            this.style.transform = "translateY(0)";
        } else {
            this.style.top = `${triggerRect.top}px`;
            this.style.transform = "translateY(-100%)";
        }
        
        this.style.opacity = "1";
    }
    deactivateTooltip = (event) => {
        document.body.removeChild(this);
        this.style.opacity = "0";
    }
}
customElements.define("shad-tooltip", ShadTooltip);
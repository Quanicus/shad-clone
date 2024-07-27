const template = document.createElement("template");
template.innerHTML = `
    <style>
        :host {
            display: block;
            font-size: .75rem;
            padding: .5rem .75rem;
            border-radius: 5px;
            border: 1px solid;
            cursor: pointer;
            transition: background-color 0.05s ease-in;
            user-select: none;
            width: fit-content;

            background-color: white;
            border-color: #303030;
            color: #303030;
        }
        :host([disabled]) {
            background-color: grey;
            cursor: auto;
            pointer-events: none;
        }
    </style>
    <slot></slot>
`;
class ShadButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this.eventName = "";
        this.mousedown = false;
        this.colorScheme = {};

        // this.internals_ = this.attachInternals();
        // this.addEventListener('click', this._onClick);
    }
    // _onClick = () => {
    //     const event = new Event('submit', { cancelable: true, bubbles: true });
    //     if (this.form && this.type === "submit") { // Accessing `this.form` calls the `get form()` method
    //         if (this.form.checkValidity()){
    //             this.form.dispatchEvent(event);
    //         } else {
    //             this.form.reportValidity();
    //         }
    //     }
    // }
    // Indicate that the element is form-associated
    static get formAssociated() {
        return true;
    }
    get disabled() {
        return this.hasAttribute("disabled");
    }
    get form() {
        return this.internals_.form;
    }
    // Get the name of the element (for form submission)
    get name() {
        return this.getAttribute('name');
    }
    // Get the type of the element (default to "submit")
    get type() {
        return this.getAttribute('type') || "submit";
    }
    // Get and set the value of the element (for form submission)
    get value() {
        return this.getAttribute('value') || '';
    }
    set value(value) {
        this.setAttribute('value', value);
    }
    connectedCallback() {
        this.initColorScheme();
        // const eventName = this.getAttribute("data-event");
        // this.eventName = eventName ?? "shad-button-click";
        
        
        this.addListeners();
        if (this.type === "submit") {
            this.addEventListener("click", this.submitForm);
        }
    }
    initColorScheme() {
        const primary = this.getAttribute("data-primary-color") ?? "white";
        const secondary = this.getAttribute("data-secondary-color") ?? "black";
        const accent = this.getAttribute("data-accent-color") ?? "#303030";
        const highlight = this.getAttribute("data-highlight-color") ?? "#D4D4D4";
        const scheme = this.colorScheme;

        scheme.hover = {
            bgColor: highlight,
            bdrColor: secondary,
            txtColor: secondary
        }
        scheme.press = {
            bgColor: secondary,
            bdrColor: primary,
            txtColor: primary
        }
    }
    setColors(colors) {
        const { bgColor, bdrColor, txtColor } = colors;
        this.style.backgroundColor = bgColor;
        this.style.borderColor = bdrColor;
        this.style.color = txtColor;
    }
    resetColors() {
        this.style.removeProperty("background-color");
        this.style.removeProperty("border-color");
        this.style.removeProperty("color");
    }
    addListeners() {
        this.addEventListener("mouseenter", this.handleMouseIn);
        this.addEventListener("mousedown", this.handleMouseDown);
        this.addEventListener("mouseleave", this.handleMouseOut);
        document.addEventListener("mouseup", this.handleMouseUp);
        this.addEventListener("click", this.handleClick);
    }
    handleClick = () => {
        const clickEvent = new CustomEvent(this.eventName, {
            detail: {target: this},
            bubbles: true,
            composed: true
        });
        this.dispatchEvent(clickEvent);
    }
    handleMouseIn = () => {
        if (this.disabled) return;
        if (this.mousedown) {
            this.setColors(this.colorScheme.press);
        } else {
            //this.setColors(this.colorScheme.hover);
            this.style.backgroundColor = this.colorScheme.hover.bgColor;
        }
    }
    handleMouseDown = (event) => {
        this.mousedown = true;
        this.setColors(this.colorScheme.press);
    }
    handleMouseUp = () => {
        this.mousedown = false;
        //this.setColors(this.colorScheme.neutral);
        this.resetColors();
    }
    handleMouseOut = () => {
        //this.setColors(this.colorScheme.neutral);
        this.resetColors();
    }
    submitForm = () => {
        const form = this.closest('form');
        if (form) {
            form.requestSubmit();
        }
    }
}
customElements.define("shad-button", ShadButton);
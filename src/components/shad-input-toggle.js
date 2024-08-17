const template = document.createElement('template');
template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        :host {
            position: relative;
            cursor: pointer;
            border: 1px solid white;
            width: 1em;
            height: 1em; 
        }
        :host([type="checkbox"]) {
            display: grid;
            place-content: center;
            border-radius: 3px;
       
        }
        :host([type="checkbox"][checked]) {
            background-color: white;
            &::after {
                content: url('data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3C!--%20License%3A%20PD.%20Made%20by%20Templarian%3A%20https%3A%2F%2Fgithub.com%2FTemplarian%2FWindowsIcons%20--%3E%3Csvg%20width%3D%2215px%22%20height%3D%2215px%22%20viewBox%3D%220%200%2076%2076%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%20baseProfile%3D%22full%22%20enable-background%3D%22new%200%200%2076.00%2076.00%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23000000%22%20fill-opacity%3D%221%22%20stroke-width%3D%220.2%22%20stroke-linejoin%3D%22round%22%20d%3D%22M%2023.7501%2C33.25L%2034.8334%2C44.3333L%2052.2499%2C22.1668L%2056.9999%2C26.9168L%2034.8334%2C53.8333L%2019.0001%2C38L%2023.7501%2C33.25%20Z%20%22%2F%3E%3C%2Fsvg%3E');
                display: block;
                width: 15px;
                height: 15px;
            }
        }
        :host([type="switch"]) {
            display: flex;
            align-items: center;
            width: calc(2em + 3px);
            height: calc(1em + 3px);
            border-radius: calc(.5em + 1.5px);
            border: none;
            padding-inline: 1.5px;
            background-color: #4d4d4d;
            transition: background-color 200ms ease-in-out;

            &::after {
                content: "";
                display: block;
                width: 1em;
                height: 1em;
                border-radius: 50%;
                background-color: black;
                transition: transform 200ms ease-in-out;
            }
        }
        :host([type="switch"][checked]) {
            background-color: white;

            &::after {
                transform: translateX(100%);
            }
        }
        :host([type="radio"]) {
            display: grid;
            place-content: center;
            border-radius: 50%;
            border-color: #696969;
        }
        :host([type="radio"][checked]) {
            border-color: white;

            & .center {
                stroke: white;
                fill: white;
            }
        }
        .svg-container {
            position: absolute;
            top: 50%;
            left: 50%;
            translate: -50% -50%;
            width: 132%;
            height: 132%;

            & .border {
                stroke-dasharray: 40; /* Length of the stroke */
                stroke-dashoffset: 40;
                transition: stroke-dashoffset 600ms ease-in-out;
                filter: blur(.3px);
                
                &.glow {
                    filter: blur(1px);
                }
            }
            & .center {
                fill: transparent;
                stroke: transparent;
            }
        }
        :host(:hover) svg,
        :host(:focus-within) svg {
            stroke-dashoffset: 0;
            transition-duration: 400ms;
        }
        :host(:not([type="radio"]):hover),
        :host(:not([type="radio"]):focus) {
            box-shadow: 0 0 1px 2px white;
        }
        input {
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
            width: 100%;
            height: 100%;
            opacity: 0;
        }
        .label {
            position: absolute;
            top: 50%;
            left: calc(100% + .5em);
            transform: translateY(-50%);
            cursor: pointer;
            width: max-content;
        }
        
    </style>
    <input id="input"></input>
    <div class="label">
        <slot></slot>
    <div>
`;
const radioSvgTemplate = document.createElement("template");
radioSvgTemplate.innerHTML = `
    <div class="svg-container">
        <svg class="border glow" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="40%" stroke="white" stroke-width="2" fill="transparent"/>
        </svg>
    </div>
    <div class="svg-container">
        <svg class="border glow" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="40%" stroke="gold" stroke-width="2" fill="transparent"/>
        </svg>
    </div>
    <div class="svg-container">
        <svg class="border" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="40%" stroke="white" stroke-width="1" fill="transparent"/>
        </svg>
    </div>
    <div class="svg-container">
        <svg class="center" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="50%" r="20%" stroke-width="1"/>
        </svg>
    </div>
`;
class ShadInputToggle extends HTMLElement {
    static formAssociated = true;
    static inputTypes = ["checkbox", "radio", "switch"];
    static radioGroups = {};
    constructor() {
        super();
        this.attachShadow({ mode: 'open', delegatesFocus: true })
        .appendChild(template.content.cloneNode(true));
        this.input = this.shadowRoot.querySelector("input");
        this._internals = this.attachInternals();
    }
    static get observedAttributes() {
        return ["value", "checked", "name", 'type', 'required'];
    }
    attributeChangedCallback(name, oldValue, newValue) {//mainly to handle initial inline values
        //console.log("attr changed: ", name, newValue);
        switch(name) {
            case "type":
                if (!ShadInputToggle.inputTypes.includes(newValue)) {
                    throw Error(`shad-input-toggle must be of type: ${ShadInputToggle.inputTypes}`);
                } 
                this.input.type = "checkbox";
                break;
            case "checked":
                //console.log(`checked changed from ${oldValue} to ${newValue}`);
                if (newValue !== null) {
                    this.checked = true;
                } else {
                    this.checked = false;
                }
                break;
            case "value":
                if (this.hasAttribute("checked")) {
                    this._internals.setFormValue(newValue);
                }
                
                this.input.value = newValue;
                break;
            default:
                this.input[name] = newValue;
        }
    }    
    #proxyInput() {//getters and setters reroute to the shadow input
        const input = this.input;
        const propsToBind = ["value", "type", "checked", 'required', 'name'];

        propsToBind.forEach(prop => {
            Object.defineProperty(this, prop, {
                get: () => input[prop],
                set: (newValue) => {
                    input[prop] = newValue
                    if (prop === "value") {
                        this._internals.setFormValue(newValue);
                    }
                },
                enumerable: true,
                configurable: true
            });
        });
    }
    connectedCallback() {
        this.#proxyInput();
        this.setValidity();
        
        this.tabIndex = this.getAttribute("tabindex") ?? "0";
        
        this.addEventListener("click", this.handleClick);
        this.input.addEventListener("change", this.handleChange);
        this.input.addEventListener("click", (event) => {event.stopPropagation()});
        
        if (!this.hasAttribute("type")) {
            this.setAttribute("type", "checkbox");
        } else if (this.getAttribute("type") === "radio") {
            this.shadowRoot.appendChild(radioSvgTemplate.content.cloneNode(true));
            if (this.hasAttribute("name")) {
                //console.log('name', this.name, this.input);
                this.input.addEventListener("change", this.handleNewRadioSelection);
                //this.addToRadioGroup();
            }
        }
    }

    handleClick = (event) => {
        this.checked = !this.checked;
        //this.handleChange();
        this.input.dispatchEvent(new Event("change"));
    }
    handleChange = (event) => {
        if (this.checked) {
            this.setAttribute("checked", "");
            this._internals.setFormValue(this.value);
        } else {
            this.removeAttribute("checked");
            this._internals.setFormValue(null);
        }
        this.setValidity();
        this.dispatchEvent(new Event("change"));
    }
    handleNewRadioSelection = (event) => {
        const newRadio = event.target;
        const groupName = newRadio.name;
        const prevRadio = ShadInputToggle.radioGroups[groupName];

        if (!newRadio.checked || !groupName || prevRadio === newRadio) return;
           
        if (prevRadio && prevRadio.checked) {
            ShadInputToggle.radioGroups[groupName] = newRadio;

            prevRadio.checked = false;
            prevRadio.dispatchEvent(new Event("change"));
        } else {
            ShadInputToggle.radioGroups[groupName] = newRadio;
        }
        
    }
    setValidity = () => {
        if (this.hasAttribute("required") && !this.checked) {
            this._internals.setValidity({ valueMissing: true }, 'This field is required', this.input);
        } else {
            this._internals.setValidity({});
        }
    }
    addToRadioGroup() {
        ShadInputToggle.radioGroups
    }
    get form() {
        return this._internals.form;
    }
}
customElements.define('shad-input-toggle', ShadInputToggle);
const template = document.createElement("template");
template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            scrollbar-width: none;
        }
        :host {
            position: relative;
            display: block;
            font-size: 1rem;
            cursor: text;
            width: 100%;
            max-width: 100%;
        }
        :host(:focus) {
            & .placeholder::after {
                font-size: 0.65rem;
                top: -0.65em;
                color: gold;
                padding-inline: 0.3em;
                transition-duration: 0.15s;
            }
            & .text-display {
                border-color: white;
                
            }
            & span{
                &.caret::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    width: 1px;
                    height: 100%;
                    background-color: gold;
                    animation: blink 1s step-end infinite;
                }
                &.selected {
                    background-color: gold;
                    color: black;
                }
            }
            & input {
                z-index: 2;
            }
        }
        :host(:hover) {
            & .placeholder::after {
                
            }
            & .text-display {
                border-color: white;
            }
        }
        :host([type="password"]) {
            & input {
                letter-spacin: 0.2em;
            }
        }
        .placeholder {
            --placeholder: "default";
            position: relative;
            padding: 0.5em;
            height: 100%;
            width: 100%;
            background-color: black;

            &::after {
                content: var(--placeholder);
                position: absolute;
                font-size: 0.65rem;
                top: -0.65em;
                left: 1em;
                color: gold;
                background-color: inherit;
                padding-inline: 0.3em;
                transition-property: top, font-size;
                transition-duration: 0.15s;
                transition-timing-function: ease-in;
            }     
        }
        .placeholder.empty {
            &::after {
                top: 0.5rem;
                border-radius: 50%;
                transition-duration: 0.25s;
                font-size: 1rem;
                color: white;
            }
        }
        .text-display {
            position: absolute;
            display: flex;
            align-items: center;
            padding-inline: .5rem;
            top: 0;
            left: 0;
            border: 1px solid #303030;
            border-radius: 5px;
            width: 100%;
            height: 100%;
            background-color: black;
            overflow-x: scroll;

            & span {
                position: relative;
                animation: drop-in .35s forwards;
                flex-shrink: 0;
            }
        }
        @keyframes drop-in {
            0%, 35% {
                transform: translateY(0);
                opacity: 1;
                color: gold;
                
            }
            100% {
                transform: translateY(0);
                opacity: 1;
                color: white;
            }
        }
        @keyframes blink {
            from, to {
                visibility: visible;
            }
            50% {
                visibility: hidden;
            }
        }
        input {
            all: unset;
            position: relative;
            width: 100%;
            height: 100%;

            opacity: 0;
        }
    </style>
    <div class="placeholder">
        <input spellcheck="false"/>
        <div class="text-display"></div>
    </div>
    
    
`;
//pattern-error
class ShadInputText extends HTMLElement {
    static formAssociated = true;
    //static emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
    static emailRegex = "^[^@]+@[^@]+\.[^@]+$";
    static inputTypes = ['text', 'password', 'email', 'search', 'tel', 'url'];

    constructor() {
        super();
        this.attachShadow({ mode: "open", delegatesFocus: true }).
        appendChild(template.content.cloneNode(true));

        this._internals = this.attachInternals();
        

        this.display = this.shadowRoot.querySelector(".text-display");
        this.input = this.shadowRoot.querySelector("input");

        this.selectedCards = [];
        
        this.bubbleEvents(['change']);
        //, 'input', 'focus', 'blur'
        this.attachListeners();
    }    
    static get observedAttributes() {
        return ["value", 'type', 'disabled', 'required', 'maxlength', 'minlength', 'pattern', 'readonly', 'autocomplete', 'autofocus', 'name', 'size'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;//mostly serves to initialize shadow input attributes
        switch(name) {
            case "type":
                if (!ShadInputText.inputTypes.includes(newValue)) {
                    throw new Error("shad-input-text can only be of types:", ShadInputText.inputTypes);
                } else if (newValue === "email") {
                    this.input.pattern = ShadInputText.emailRegex
                    newValue = "text";    
                }
                this.input.type = newValue;
                break;
            case "value":
                this.input.value = newValue;
                this.input.dispatchEvent(new Event("input"));
                break;
            default:
                this.input[name] = newValue;
        }
    }
    connectedCallback() {        
        this._proxyInput();
        this._internals.setFormValue(this.value);
        this._internals.setValidity(this.input.validity, this.input.validationMessage, this.input);
        
        this.tabIndex = this.getAttribute("tabindex") ?? "0";
        this.input.tabIndex = this.tabIndex;
        this.initialValue = this.value;
        console.log("initial value: ", this.value);
        
        this.setPlaceholder();
        this.initCaret();

        // this.attachListeners();
    }
    bubbleEvents(events) {
        events.forEach(eventName => {
            this.input.addEventListener(eventName, (originalEvent) => {
                // Create a new custom event
                const customEvent = new CustomEvent(eventName, {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                    detail: {
                        originalEvent: originalEvent
                    }
                });

                this.dispatchEvent(customEvent);
            });
        });
    }
    attachListeners() {
        const input = this.input;
        input.addEventListener("beforeinput", this.handleBeforeInput);
        input.addEventListener('input', this.handleAfterInput);
        input.addEventListener("scroll", this.syncScroll);
        input.addEventListener("mousedown", this.startSelecting);
        input.addEventListener('mouseup', this.captureSelection);
        input.addEventListener("click", this.captureSelection);
        input.addEventListener('keyup', this.captureSelection);
        //this.addEventListener("focus", () => this.input.focus());
        //this.addEventListener("input", () => console.log("custom element inputted"));
        // input.addEventListener("paste", this.handlePaste);
        
    }
    _proxyInput() {//getters and setters reroute to the shadow input
        const input = this.shadowRoot.querySelector("input");
        const propsToBind = ["value", 'placeholder', 'disabled', 'required', 'maxlength',
            'minlength', 'pattern', 'readonly', 'autocomplete', 'autofocus',
            'name', 'size',];

        propsToBind.forEach(prop => {
            Object.defineProperty(this, prop, {
                get: () => input[prop],
                set: (newValue) => {
                    input[prop] = newValue;
                    
                    if (prop === "value") {
                        this.input.dispatchEvent(new Event("input"));
                    }
                },
                enumerable: true,
                configurable: true
            });
        });
    }
    get value() { return this.input.value };
    get caretElement() { return this._caretElement; }
    set caretElement(caret) {
        if (this._caretElement === caret) return;
        this._caretElement.classList.remove("caret");
        if (caret) {
            caret.classList.add("caret");
        }
        this._caretElement = caret;
    }
    //HANDANDLERS
    handleBeforeInput = (event) => {
        const display = this.display;
        const input = this.input;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const selectedText = input.value.substring(start, end);

        if (selectedText) {//remove highlighted text
            this.selectedCards.forEach(card => this.display.removeChild(card));
            this.caretElement = this.display.children[start];
        }
        switch (event.inputType){
            case "insertText":
                const char = event.data;
                //add inserted text into container starting at start
                display.insertBefore(this.makeCharCard(char),this.caretElement);
                
                break;
            case "deleteContentBackward":
                if (!selectedText) {
                    //remove charCards[start - 1]
                    display.removeChild(display.children[start - 1]);    
                }
                break;
            case "insertFromPaste":
                //add pasted text to display container
                const pasteText = event.data;
                [...event.data].forEach(char => {
                    display.insertBefore(this.makeCharCard(char),this.caretElement);
                });
                break;
        }
    }
    handleAfterInput = (event) => {
        const placeholder = this.shadowRoot.querySelector(".placeholder");
        const input = this.input;
        if (this.value.length !== this.display.childElementCount - 1) {
            //console.log("syncing...");
            this.syncInput();
        }
        const patternErrorMsg = this.getAttribute("pattern-error") ?? "";
        if (this.input.validity.patternMismatch) {
            const msg = (this.getAttribute("type") === "email") 
                        ? "Please use a valid email format." 
                        : patternErrorMsg;
            input.setCustomValidity(msg);   
        } else {
            input.setCustomValidity("");
        }
        this._internals.setFormValue(this.value);
        this._internals.setValidity(input.validity, input.validationMessage, this.input);

        if (input.value.length === 0) {
            placeholder.classList.add("empty");
        } else {
            placeholder.classList.remove("empty");
        }
    }
    syncInput() {
        this.display.innerHTML = "";
        this.initCaret();
        [...this.value].forEach(char => {
            this.display.insertBefore(this.makeCharCard(char),this.caretElement);
        });
    }
    syncScroll = () => {
        this.display.scrollLeft = this.input.scrollLeft;
    }
    startSelecting = (event) => {
        const input = this.input;
        input.addEventListener("mousemove", this.captureSelection);
        document.addEventListener("mouseup", () => {
            input.removeEventListener("mousemove", this.captureSelection);
        })
    }
    captureSelection = (event) => {
        const input = this.input;
              
        const start = input.selectionStart;
        const end = input.selectionEnd;
        if (start !== end) {//if text selected
            //this.caretElement.classList.remove("caret");
            this.selectText(start, end);
        } else {
            this.selectText();
            //update caret position
            this.caretElement = this.display.children[start]
        }
    }

    setPlaceholder() {
        const placeholder = this.shadowRoot.querySelector(".placeholder");
        const text = this.getAttribute("placeholder") ?? "";
        placeholder.style.setProperty("--placeholder", `"${text}"`);//the goofy extra "" is bc we're setting the content of ::after
        if (!this.value) {
            placeholder.classList.add("empty");
        }
    }

    initCaret() {
        const caret = this.makeCharCard();
        caret.innerHTML = "&nbsp;";
        caret.classList.add("caret");
        this.display.appendChild(caret);
        this._caretElement = caret;
    }

    makeCharCard(char) {
        if (!char || char == " ") {
            char = "&nbsp;";
        }
        if (this.getAttribute("type") === "password") {
            char = `<svg fill="currentcolor" width="8" height="8" viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <title>shield-solid</title>
            <path d="M31.25,7.4a43.79,43.79,0,0,1-6.62-2.35,45,45,0,0,1-6.08-3.21L18,1.5l-.54.35a45,45,0,0,1-6.08,3.21A43.79,43.79,0,0,1,4.75,7.4L4,7.59v8.34c0,13.39,13.53,18.4,13.66,18.45l.34.12.34-.12c.14,0,13.66-5.05,13.66-18.45V7.59Z" class="clr-i-solid clr-i-solid-path-1"></path>
            <rect x="0" y="0" width="36" height="36" fill-opacity="0"/>
            </svg>`
        }
        
        const card = document.createElement("span");
        card.classList.add("char-card");
        card.innerHTML = char;
        return card;
    }
    
    selectText(start, end) {
        this.selectedCards = [];
        const charCards = this.display.children;
        for (let position = 0; position < charCards.length; position++) {
            if (position >= start && position < end) {
                charCards[position].classList.add("selected");
                this.selectedCards.push(charCards[position]);
            } else {
                charCards[position].classList.remove("selected");
            }
        }
    }

    // Form-related methods
    formAssociatedCallback(form) {
        // Called when the element is associated with a form
        this.form = form;
    }

    formDisabledCallback(disabled) {
        // Called when the element is disabled/enabled
        this.input.disabled = disabled;
    }

    formResetCallback() {
        // Called when the form is reset
        this.display.innerHTML = "";
        if (this.initialValue) {
            this.value = this.initialValue;
        } else {
            this.initCaret();
            this.shadowRoot.querySelector(".placeholder").classList.add("empty");
        }
    }

    formStateRestoreCallback(state, mode) {
        // Called when the browser restores the form state
        this.value = state;
    }
}
customElements.define("shad-input-text", ShadInputText);

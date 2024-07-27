const template = document.createElement("template");
template.innerHTML = `
    <style>
        * {
            box-sizing: border-box;
            scrollbar-width: none;
        }
        :host  {
            
            position: relative;
            border: 1px solid #303030;
            height: 100%;
            min-width: min-content;
                                
            max-width: 100%;
        }
        :host([collapsed]) {
            
            & .nav_item .label {
                display: none;
                width: 0;
            } 
        }
        .nav_container {
            display: flex;
            flex-direction: column;
            gap: 0.3em;
            padding: 0.5rem;
            height: 100%;
            overflow: scroll;

            .nav_item {
                display: flex;
                align-items: center;
                padding: .5rem;
                background-color: black;
                border-radius: 6px;

                & .label {
                    display: inline-flex;
                    justify-content: space-between;
                    width: 100%;
                    margin-left: 0.7em;
                }
                & svg {
                    flex-shrink: 0;
                }
                
                &:hover, &[selected] {
                    background-color: #303030;
                    cursor: pointer;
                }
            }
        }
        .handle-container {
            position: absolute;
            right: -.3rem;
            height: 100%;
            width: .6rem;
            
            &:hover {
                cursor: ew-resize;
            }
            & .handle {
                display: grid;
                place-content: center;
                position: absolute;
                width: .7rem;
                height: 1rem;
                top: 50%;
                border-radius: 4px;
                background-color: #303030;
                z-index: 10;
            }
        }
    </style>
    <div class="handle-container">
        <div class="handle">
            <svg width="10" height="10" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-2.5 w-2.5">
                <path d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.8787 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.8787 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.8787 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.8787 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path>
            </svg>
        </div>
    </div>
    <div class="nav_container"></div>
`;
class IconNav extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.entries = [];
        this.resizeHandle = this.shadowRoot.querySelector(".handle-container");
        this.container = this.shadowRoot.querySelector(".nav_container");
        this.resizeObserver = new ResizeObserver(this.handleResize);
        this.widthThreshold = 0;
        this.selectedEntry = null;
    }
    connectedCallback() {
        this.activateResizeHandle();
        document.addEventListener("DOMContentLoaded", () => {
            this.setEntries();
            this.setListenersOnEntries();
        });
        
    }
    setEntries() {
        Array.from(this.children).forEach(entry => {  
            const navEntry = document.createElement("div");
            const data = document.createElement("span");
            const label = document.createElement("div");
            const name = document.createElement("span");

            name.textContent = entry.getAttribute("data-name");
            name.classList.add("name");
            label.classList.add("label");
            navEntry.classList.add("nav_item");
            data.classList.add("data");
            data.textContent = "c:"

            this.resizeObserver.observe(label);


            label.append(name, data);
            navEntry.append(entry, label);

            this.entries.push(navEntry);
            this.container.appendChild(navEntry);

            const labelWidth = label.getBoundingClientRect().width;
            if (labelWidth > this.widthThreshold) {
                this.widthThreshold = labelWidth;
            }
        });
        if (this.entries.length > 0) {
            this.selectedEntry = this.entries[0];
            this.entries[0].setAttribute("selected", true);
            this.dispatchEvent(new CustomEvent("nav-entry-selected", {bubbles: true, detail: this.entries[0], composed: true}))
        }
    }
    setListenersOnEntries() {
        this.entries.forEach(navEntry => {
            navEntry.addEventListener("click", (event) => {
                if (this.selectedEntry === navEntry) return;
        
                this.selectedEntry.removeAttribute("selected");
                navEntry.setAttribute("selected", true);
                this.selectedEntry = navEntry;
        
                this.dispatchEvent(new CustomEvent("nav-entry-selected", {bubbles: true, detail: navEntry, composed: true}))
            });
        });
    }
    activateResizeHandle() {

        this.resizeHandle.addEventListener("mousedown", (event) => {
            document.body.style.userSelect = "none";
            document.body.style.cursor = "ew-resize";
            this.resizeHandle.style.cursor = "ew-resize";
            document.addEventListener("mousemove", this.resize);
        });
        document.addEventListener("mouseup", this.disengageMouse);
        document.addEventListener("mouseout", this.disengageMouse);
    }
    resize = (event) => {
        const rect = this.getBoundingClientRect();
        const cursorFromLeft = event.clientX - rect.left;
        if (!this.hasAttribute("collapsed")) {
            this.style.width = `${cursorFromLeft}px`;
        } else if (cursorFromLeft > this.widthThreshold) {
            this.style.width = `${cursorFromLeft}px`;
            this.removeAttribute("collapsed");
        }
    };
    handleResize = (entries) => {
        entries.forEach(element => {
            const nameRect = element.target.querySelector(".name").getBoundingClientRect();
            const dataRect = element.target.querySelector(".data").getBoundingClientRect();
            if (dataRect.left - nameRect.right < 1 && !this.hasAttribute("collapsed")) {
                //this.widthThreshold = this.getBoundingClientRect().width + 1;
                this.style.width = "0";
                this.setAttribute("collapsed", "true");
                 
            }
            //console.log(element);
        });
    };
    disengageMouse = (event) => {
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        document.removeEventListener("mousemove", this.resize);
    };
}
customElements.define("icon-nav", IconNav);
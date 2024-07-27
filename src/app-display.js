class AppDisplay extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement("template");
        template.innerHTML = `
            <style>
                :host {
                    box-sizing: border-box;
                    position: fixed;
                    display: grid;
                    place-items: center;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    overflow: hidden;
                    image-rendering: pixelated;
                    background-color: rgba(0,0,0, 0.8);
                    transform: translateX(-100%);   
                }
                :host([active=true]) {
                        transform: translateX(0);
                        transition: 0.6s transform ease-in-out;
                    }
                :host([active=false]) {
                    transform: translateX(-100%);
                    transition: 0.6s transform ease-in-out;
                }
                .display {
                    position: relative;
                }
            </style>
            <div class="display"></div>
        `;
        const shadow = this.attachShadow({mode: "open"});
        shadow.appendChild(template.content.cloneNode(true));
        
        //this.canvas = shadow.querySelector("canvas");
        this.display = shadow.querySelector(".display");
        this.app = null;
        this.appIsLoaded = false;
    }
    connectedCallback() {
        this.addListeners();
        
    }
    addListeners() {
        // eventBus.on("activate-app", async () => {
        //     if (this.getAttribute("active") === "true") {
        //         this.setAttribute("active", "false");
        //         console.log("wtf");
        //         //close connection
        //         if (this.appIsLoaded) {
        //             this.app.closeWebSocket();
        //         }
                
        //     } else {
        //         //authorize
        //         fetch("/api/v1/users/authenticate", {method: "POST"})
        //         .then(response => {
        //             if(!response.ok) {
        //                 throw new Error("Authentication failed");
        //             }
        //             this.setAttribute("active", "true");
        //             return response.json();
        //         })
        //         .catch(error => {
        //             eventBus.emit("toggle-modal");
        //             return;
        //         }); 
        //         //open connection
        //         if (this.appIsLoaded) {
        //             this.app.openWebSocket();
        //         }
                
        //     }
        // });
    }

}customElements.define("app-display", AppDisplay);
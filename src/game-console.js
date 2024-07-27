class GameConsole extends HTMLElement {
    constructor() {
        super()
        this.game = null;
    }
    connectedCallback() {
        this.style.overflow = "hidden";
        document.addEventListener("DOMContentLoaded", () => {
            //initiate game from <script> module
            this.game = new window.Game(this);
        })
    }
    startGame() {
        this.game.openWebSocket();
    }
    endGame() {
        this.game.closeWebSocket();
    }
}
customElements.define("game-console", GameConsole);
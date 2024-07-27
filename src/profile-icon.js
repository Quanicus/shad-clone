const template = document.createElement("template");
template.innerHTML = `
    <div class="icon">
        <div class="initials"></div>
    <div>
`;
class ProfileIcon extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.icon = this.shadowRoot.querySelector(".icon");
        this.initials = this.shadowRoot.querySelector(".initials");
    }
    connectedCallback() {
        this.drawIcon();
        this.setInitials();
    }
    drawIcon() {
        const icon = this.icon;
        const parentRect = this.parentElement.getBoundingClientRect();
        const maxWidth = parentRect.width;
        const maxHeight = parentRect.height;
        const sideLength = Math.min(maxWidth, maxHeight);
        this.style.width = `${sideLength}px`;
        this.style.height = `${sideLength}px`;

        icon.style.display = "grid";
        icon.style.placeContent = "center";
        icon.style.width = "100%";
        icon.style.height = "100%";
        icon.style.backgroundColor = "#303030";
        icon.style.borderRadius = "50%";
        icon.style.fontSize = "1.5rem";

        this.shadowRoot.appendChild(icon);
    }
    setInitials() {
        this.initials.textContent = this.getInitials();
    }
    getInitials() {
        const name = this.getAttribute("data-name");
        const initials = name.split(" ").map(name => name.charAt(0).toUpperCase());
        if (initials.length < 1 || initials.length > 2) {
            throw new Error("profile-icon only accepts 1 and 2 strings as the name");
        }
        return initials.join("");
    }
}
customElements.define("profile-icon", ProfileIcon);
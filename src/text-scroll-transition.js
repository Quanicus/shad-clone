class TextScrollTransition extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <style></style>
            <slot></slot>
        `;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.setTestElement();
    }
    connectedCallback() {
        textSurgery();
    }
    textSurgery() {
        const container = this.parentElement;
        const maxWidth = container.contentWidth;

        const lines = splitTextByWidth(container, maxWidth);
        //iterate through each line
        for (const line of lines) {
            //iterate through each word in a line
            line = line.split(' ');
            for (const word of line) {
                const wordElement = document.createElement('span');

            }
        }
    }
    //split text into lines based on max width of container
    splitTextByWidth(container, maxWidth) {
        //'this' custom element is the container
        const text = this.textContent;
        const words = text.split(' ');

        let line = '';
        let lines = [];
        //iterate through each word of text
        for (const word of words) {
            const testLine = line + word + ' ';
            const testWidth = getTextWidth(testLine, );
            //if the new word makes the line longer than max, start a new line with current word
            if (testWidth > maxWidth && line !== '') {
                lines.push(line);
                line = word + ' ';
            } else {
                line = testLine;//continue building current line
            }
        }
        lines.push(line.trim());//push remaining text to array;

        return lines;
    }
    getTextWidth(testLine) {
        this.appendChild(this.testElement);
        this.testElement.textContent = testLine;

        const width = this.testElement.offsetWidth;
        this.removeChild(this.testElement);

        return width;
    }
    setTestElement() {
        const testElement = document.createElement('span');
        testElement.style.visibility = 'hidden';
        testElement.style.whiteSpace = 'nowrap';
    }
}
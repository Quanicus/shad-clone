class ScrollWords extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host {

                }
                ::slotted(span) {
                    display: inline-block;
                    font-size: 20px;
                    opacity: 0;
                    transform: scale(4);
                    transform: translateY(-1em);
                    transition: all 0.3s ease-in-out;
                }
            </style>
            <slot></slot>
        `;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.setText();     
    }
    connectedCallback() {
        
    }
    
    setText() {
        const observer = new MutationObserver(this.mutationHandler);
        const config = {childList: true};
        observer.observe(this, config);
    }
    mutationHandler = (mutations, observer) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const text = mutation.addedNodes[0].textContent.trim();
                console.log(text);
                observer.disconnect();
                this.processText(text);
            }
        });
    }
    processText(text) {
        text = text.split(' ');
        this.textContent = '';

        for (let i = 0; i < text.length; i++) {

            const wordWrap = document.createElement('span');
            wordWrap.textContent = text[i];
            wordWrap.style.setProperty('padding-right', '0.3em');
    
            const observer = new IntersectionObserver(this.intersectHandler, this.getConfig(i));
            observer.observe(wordWrap);
            this.appendChild(wordWrap);
        }
        
    }
    intersectHandler = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const top = entry.target.getBoundingClientRect().top;

                console.log('intersexted');
                entry.target.style.setProperty('opacity', '1');
                entry.target.style.setProperty('scale', '1');
                entry.target.style.setProperty('transform', 'translateY(0)');
                observer.disconnect();
            }
        });
    }
    getConfig(i) { 
        const container = this.getContainer(this.parentElement);
        let marginBottom = null;
        if (container) {
            marginBottom = container.clientHeight * 0.05;
        } else {
            marginBottom = window.innerHeight * 0.05;
        }
        

        const fontSize = window.getComputedStyle(this).fontSize;
        //offset scroll detection by 1/3 of an em
        const marginBuffer = parseFloat(fontSize) * i / 3;

        marginBottom += marginBuffer;
        console.log(marginBottom);
        const config = {
            root: container,
            rootMargin: `-500px 0px -${marginBottom}px 0px` ,
            threshold: 0
        };
        return config;
    }
    getContainer(element) {
        let candidate = element;
        while(candidate) {
            const style = getComputedStyle(candidate);
            if (style.overflow === 'auto' || style.overflow === 'scroll') {
                return candidate;
            }
            candidate = candidate.parentElement;
        }
        return null;
    }
}
customElements.define('scroll-words', ScrollWords);
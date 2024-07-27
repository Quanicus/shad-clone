class ScrollBar extends HTMLElement {
    constructor() {
        super()
        const template = document.createElement('template');
        template.innerHTML = `
        <style>
            :host, .scroll-bar, .scroll-button {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center; 
            }
            :host {
                position: absolute;
                font-size: 16px;
                top: 0;
                right: 0;
                height: 100%;
                min-width: 30px;
                width: 4vw;
                background-color: rgba(0,0,0, 0.5) ;
                z-index: 1;
            }
            .scroll-bar {
                width: 100%;
                min-height: 25%;
                gap: 0.6em;
            }
            .scroll-button {
                width: 100%;           
                color: lightgrey;
                transition: color 0.3s ease-in-out;
            }
            .scroll-button:hover span{
                color: aqua;
            }
            .progress-bar {
                position: relative;
                width: 2px;
                height: 0.6em;
                border: 1px solid darkgray;
                border-radius: 2px;
                background-color: gray;
                overflow: hidden;
                transition: height 0.3s ease-in-out;
            }
            .progress {
                height: 100%;
                background-color: aqua;
                border: 1px solid aqua;
                border-radius: 2px;
                transform: translateY(-100%);
                transition: transform 0.4s linear;
            }
        </style>
        <div class="scroll-bar"></div>
        `;
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.activePage = null;
    }
    connectedCallback() {
        this.parentElement.style.setProperty('position', 'relative');
        
        //this.hideScroll();
        this.attachContent();
    }
    attachContent() {
        document.addEventListener('DOMContentLoaded', () => {
          
            const scrollBar = this.shadowRoot.querySelector('div');
            const pageContainer = this.previousElementSibling;
            
            //iterate through content pages
            const content = pageContainer.querySelectorAll('.page-content');
            content.forEach((page, pageNum) => {
                
       
                const label = this.makeScrollLabel(pageNum);
                const progressBar = this.makeProgressBar();
                label.appendChild(progressBar);
                
                this.setListeners(page, label);
                scrollBar.appendChild(label);
            });
            //this.shadowRoot.appendChild(scrollBar);
            this.setupScrollContainer();

        });
    }

    makeScrollLabel(pageNum) {
        const buttonLabel = document.createElement('label');
        buttonLabel.setAttribute('class', 'scroll-button');

        
        const labelNum = document.createElement('span');
        labelNum.textContent = '0' + String(pageNum);
        labelNum.style.setProperty('margin-bottom', '0.4em');
        labelNum.style.setProperty('cursor', 'pointer');

        buttonLabel.appendChild(labelNum);
        return buttonLabel;
    } 
       
    makeProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.setAttribute('class', 'progress-bar');
        
        const progress = document.createElement('div');
        progress.setAttribute('class', 'progress');

        progressBar.append(progress);
        return progressBar;
    }
    setListeners(page, label) {
        const config = {
            root: this.previousElementSibling,
            rootMargin: '-1px 0px -100% 0px',
            threshold: 0
        }
        const observer = new IntersectionObserver((entries, observer) => {
            const progressBar = label.lastElementChild;
            const progress = progressBar.firstElementChild;
            for (const entry of entries) {
                const page = entry.target;
                
                if (entry.isIntersecting) {
                    progressBar.style.setProperty('height', '4em');
                    page.setAttribute('intersecting', 'true');
                    label.style.setProperty('color', 'aqua');
                } else {
                    progressBar.style.setProperty('height', '0.66em');
                    page.removeAttribute('intersecting');
                    label.style.setProperty('color', 'lightgrey');
                }
            }
        }, config);
        observer.observe(page);

        label.firstElementChild.addEventListener('click', () => {
            page.scrollIntoView({behavior: 'smooth', block: 'start'});
        });
    }
    setupScrollContainer() {
        const scrollContainer = this.previousElementSibling;
        const progresses = this.shadowRoot.querySelectorAll('.progress');
        const pages = scrollContainer.querySelectorAll('.page-content');

        
        if(progresses.length < pages.length){
            throw new Error("number of pages does not match number of generated scroll-bar progBars");
        }
        //scroll event listener that actively monitors the position of the scroll position and updates the scrollbar.
        scrollContainer.addEventListener('scroll', () => {  
            //iterate through the pages to find which is intersecting.           
            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const progress = progresses[i];
                const pageTop = page.getBoundingClientRect().top
                if (page.hasAttribute('intersecting')) {
                    const scrollPercent = pageTop / page.offsetHeight * 100;
                    const progPercent = 100 + scrollPercent;
                    progress.style.setProperty('transform', `translateY(-${progPercent}%)`);
                } else if (pageTop < 0) {//keep progress of pages passed at 100%;
                    progress.style.setProperty('transform', `translateY(0)`);
                }
            }               
        });   
    }   
}
customElements.define('scroll-bar', ScrollBar);




class ParticleCanvas extends HTMLElement {
    constructor() {
        super();
        
        const template = document.createElement("template");
        template.innerHTML = `
            <style>
                :host {
                    display: block;
                    position: sticky;
                    top: 0;
                }
                div.slider:hover {
                    bottom: 0 !important;
                }
            </style>

        `;
        //background: radial-gradient(#ffc38c, #ff9b40);
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));


        this.canvas = this.getCanvas();
        this.context = this.canvas.getContext('2d');
        this.slider = this.getSlider();
        this.container = this.getContainer();
        this.division = this.getDivision();
        this.isDragging = false;
        this.mouse = { x: null, y: null, radius: (this.canvas.height/100) * (this.canvas.width/100) }
        this.particlesArray = null;

        // Attach to the shadow DOM.
        this.container.append(this.canvas, this.division, this.slider);
        this.shadowRoot.appendChild(this.container);
        
        
        //this.draw();
        window.addEventListener("resize", () => {
            this.canvas.width = innerWidth;
            this.canvas.height = innerHeight;
            this.mouse.radius = (innerHeight/100) * (innerWidth/100);
            this.initParticles();
        });
    }

/*     draw() {
        if (this.context) {
            this.context.fillStyle = 'red';
            this.context.fillRect(0, 0, 100, 100);
        }
    } */


    connectedCallback() {
        //this.attachCloud();
        this.initParticles();
        this.animate();
    }

    disconnectedCallback() {
        console.log('Custom canvas element removed from the page.');
    }

    // check particle position, check mouse postion, move particle, draw particle
    updateParticle(particle) {
        // keep particle within canvas
        if (particle.x > innerWidth || particle.x < 0) {
            particle.velocity_x = -particle.velocity_x;
        }
        if (particle.y > innerHeight || particle.y < 0) {
            particle.velocity_y = -particle.velocity_y;
        }
        //calculate distance between two particles
        let dx = this.mouse.x - particle.x;
        let dy = this.mouse.y - particle.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        //check for collision
        if (distance < this.mouse.radius + particle.size) {
            //check which direction to push particles
            if (this.mouse.x < particle.x && particle.x < innerWidth - particle.size * 10) {
                particle.x += 5;
                particle.velocity_x = -particle.velocity_x;
            }
            if (this.mouse.x > particle.x && particle.x > particle.size * 10) {
                particle.x -= 5;
                particle.velocity_x = -particle.velocity_x;
            }
            if (this.mouse.y < particle.y && particle.y < innerHeight - particle.size * 10) {
                particle.y += 5;
                particle.velocity_y = -particle.velocity_y;
            }
            if (this.mouse.y > particle.y && particle.y > particle.size * 10) {
                particle.y -= 5;
                particle.velocity_y = -particle.velocity_y;
            }
        }
        particle.x += particle.velocity_x;
        particle.y += particle.velocity_y;

       this.drawParticle(particle);
    }
    initParticles() {
        const particlesArray = [];
        let numberOfParticles = (innerHeight * innerWidth / 9000);
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 5) + 1;
            //random position inside canvas
            let x = (Math.random() * (innerWidth - size * 4) + size * 2);
            let y = (Math.random() * (innerHeight - size * 4) + size * 2);
            //random velocity between -2.5 and 2.5
            let velocity_x = (Math.random() * 3) - 1.5;
            let velocity_y = (Math.random() * 3) - 1.5;
            let color = "white";
            //let color = "#FFE993";
            particlesArray.push(new Particle(x, y, velocity_x, velocity_y, size, color));
        }
        this.particlesArray = particlesArray;
    }

    drawParticle(particle) {
        const ctx = this.context;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2, false);
        ctx.fillStyle = particle.color;
        if(particle.x > parseInt(this.division.style.left)) {
            ctx.fillStyle = "black";
        }
        ctx.fill();
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        const ctx = this.context;
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, parseInt(this.division.style.left), this.canvas.height);
        for (let i = 0; i < this.particlesArray.length; i++) {
            this.updateParticle(this.particlesArray[i]);
        }
        this.connect();
    }

    connect() {
        let opacity = 1;
        const pArr = this.particlesArray;
        const ctx = this.context;
        for (let i = 0; i < pArr.length; i++) {
            for (let j = i; j < pArr.length; j++) {
                let dx = pArr[i].x - pArr[j].x;
                let dy = pArr[i].y - pArr[j].y;
                let distance = (dx*dx + dy*dy);
                const divisionPosition = parseInt(this.division.style.left);
                if (distance < (innerWidth/7) * (innerHeight/7)) {
                    opacity = 1 - (distance/20000);
                    if (pArr[i].x > divisionPosition && pArr[j].x > divisionPosition) {
                        ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
                    } else if (pArr[i].x < divisionPosition && pArr[j].x < divisionPosition) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    } else {
                        ctx.strokeStyle = `rgba(255, 233, 147, ${opacity})`;
                    }
                    
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(pArr[i].x, pArr[i].y);
                    ctx.lineTo(pArr[j].x, pArr[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    getCanvas() {
        const canvas = document.createElement('canvas');
        //canvas.style.background = "black";
        canvas.width = innerWidth;
        canvas.height = innerHeight;

        canvas.addEventListener("mousemove", (event) => {
            this.mouse.x = event.x;
            this.mouse.y = event.y;
        });
        canvas.addEventListener("mouseout", () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        return canvas;
    }

    getSlider() {
        const slider = document.createElement("div");
        slider.classList.add("slider");
        slider.style.position = "absolute";
        slider.style.width = "50px";
        slider.style.height = "50px";
        slider.style.background = "white";
        slider.style.rotate = "45deg";
        slider.style.borderRadius = "0 50% 50% 50%";
        slider.style.transition = "bottom 0.3s ease-in-out";
        slider.style.border = "1px solid black";
        slider.style.bottom = `-${parseInt(slider.style.height)/2}px`;
        slider.style.left = `${(innerWidth - parseInt(slider.style.width))/2}px`;

        slider.addEventListener("mousedown", () => {
            this.isDragging = true;
        });
/*         slider.addEventListener("mouseover", () => {
            slider.bottom = "0";
        }); */
        document.addEventListener("mouseup", () => {
            this.isDragging = false;
        });
        document.addEventListener("mouseout", () => {
            this.isDragging = false;
        });

        document.addEventListener("mousemove", (event) => {
            if (!this.isDragging) {
                return;
            }
            const dx = event.movementX;
            const positionSliderX = parseInt(this.slider.style.left);
            const positionDivision = parseInt(this.division.style.left);
            this.slider.style.left = `${positionSliderX + dx}px`;
            this.division.style.left = `${positionDivision + dx}px`;
        });
        return slider;
    }
    
    getContainer() {
        const container = document.createElement("div");
        container.classList.add("container");
        container.style.position = "relative";
        container.style.height = "100vh";
        return container;
    }

    getDivision() {
        const division = document.createElement("div");
        division.classList.add("division");
        division.style.width = "2px";
        division.style.height = "100%";
        division.style.position = "absolute";
        division.style.top = "0";
        division.style.left = `${this.canvas.width/2 - 1}px`;
        division.style.border = "1px solid orange";
        division.style.background = "orange";

        return division;
    }

    attachCloud() {
        const img = new Image();
        img.src = "/images/cloud-layer.png";
        img.style.position = "absolute";
        img.style.bottom = "-20%";
        img.style.left = "0";
        img.style.width = "100%";
        img.style.opacity = "0.75";
        img.style.pointerEvents = "none"; 

        this.shadowRoot.appendChild(img);
    }
}

// Define the custom element.
customElements.define('particle-canvas', ParticleCanvas);

class Particle {
    constructor(x, y, velocity_x, velocity_y, size, color, context) {
        this.x = x;
        this.y = y;
        this.velocity_x = velocity_x;
        this.velocity_y = velocity_y;
        this.size = size;
        this.color = color;
        this.context  = context;
    }
    // draw individual particle
/*     draw() {
        const ctx = this.context;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    } */
    // check particle position, check mouse position, move the particle, draw the particle
    /* update() {
        if (this.x > )
    } */
}
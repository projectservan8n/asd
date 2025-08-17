document.addEventListener('DOMContentLoaded', function() {
    const d = document, body = d.body;

    // Smooth scroll for anchor links on this page
    d.querySelectorAll('a[href^="#"]').forEach(a => 
        a.addEventListener('click', e => {
            e.preventDefault();
            d.querySelector(a.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        })
    );

    // Theme Toggle (Business vs Engineering Mode)
    const themeToggle = d.getElementById('theme-toggle');
    if (themeToggle) {
        const themeIcon = themeToggle.querySelector('i'), storageKey = 'theme-mode-preference';
        const setTheme = t => {
            body.classList.toggle('engineering-mode', t === 'engineering');
            themeIcon.className = `fas fa-${t === 'engineering' ? 'briefcase' : 'terminal'}`;
            localStorage.setItem(storageKey, t);
        };
        const savedTheme = localStorage.getItem(storageKey) || 'business';
        setTheme(savedTheme);
        themeToggle.addEventListener('click', () => 
            setTheme(body.classList.contains('engineering-mode') ? 'business' : 'engineering')
        );
    }
    
    // Scroll Reveal
    const animatedElements = d.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));

    // Magnetic Buttons
    d.querySelectorAll('.magnetic-button').forEach(b => {
        b.addEventListener('mousemove', e => {
            const r = b.getBoundingClientRect();
            b.style.transform = `translate(${(e.clientX - r.left - r.width/2)*0.2}px, ${(e.clientY - r.top - r.height/2)*0.4}px)`;
        });
        b.addEventListener('mouseleave', () => b.style.transform = 'translate(0,0)');
    });

    // 3D Card Tilt Effect
    d.querySelectorAll('.guarantee-card, .workflow-node').forEach(c => {
        c.addEventListener('mousemove', e => {
            const r = c.getBoundingClientRect();
            c.style.setProperty('--rotateY', `${-1 * ((e.clientX - r.left - r.width/2) / (r.width/2)) * 8}deg`);
            c.style.setProperty('--rotateX', `${((e.clientY - r.top - r.height/2) / (r.height/2)) * 8}deg`);
        });
        c.addEventListener('mouseleave', () => {
            c.style.setProperty('--rotateY', '0deg');
            c.style.setProperty('--rotateX', '0deg');
        });
    });

    // ROI Calculator
    const empS = d.getElementById('employees'), hrsS = d.getElementById('hours');
    if(empS && hrsS) {
        const empV = d.getElementById('employees-value'), hrsV = d.getElementById('hours-value'), hrsSaved = d.getElementById('hours-saved');
        const updateROI = () => {
            const e = parseInt(empS.value), h = parseInt(hrsS.value);
            empV.textContent = e; 
            hrsV.textContent = h; 
            hrsSaved.textContent = Math.round(e * h * 0.7).toLocaleString();
        };
        [empS, hrsS].forEach(s => s.addEventListener('input', updateROI));
        updateROI();
    }

    // DUAL-MODE CANVAS ANIMATION (MATRIX + PARTICLES)
    const canvas = d.getElementById('data-stream-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [], columns, drops = [];
    const fontSize = 16;
    const characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン01';
    
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for(let i=0; i < (canvas.width * canvas.height) / 25000; i++) {
            particles.push(new (function() { 
                this.x = Math.random() * canvas.width; 
                this.y = Math.random() * canvas.height; 
                this.vx = Math.random() * 0.4 - 0.2; 
                this.vy = Math.random() * 0.4 - 0.2; 
                this.r = Math.random() * 1.5 + 1;
                this.color = Math.random() > 0.5 ? '#FF832F' : '#3B82F6';
                this.update = () => { 
                    this.x += this.vx; 
                    this.y += this.vy; 
                    if (this.x < 0 || this.x > canvas.width) this.vx *= -1; 
                    if (this.y < 0 || this.y > canvas.height) this.vy *= -1; 
                };
                this.draw = () => { 
                    ctx.beginPath(); 
                    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); 
                    ctx.fillStyle = this.color; 
                    ctx.fill(); 
                };
            })());
        }
        columns = Math.floor(canvas.width / fontSize);
        drops = [];
        for (let i = 0; i < columns; i++) drops[i] = 1;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function drawParticleNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        for(let i=0; i<particles.length; i++){
            for(let j=i+1; j<particles.length; j++){
                const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                if(dist < 120){
                    ctx.beginPath(); 
                    ctx.moveTo(particles[i].x, particles[i].y); 
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(59, 130, 246, ${(1 - (dist / 120)) * 0.4})`;
                    ctx.lineWidth = 0.5; 
                    ctx.stroke();
                }
            }
        }
    }
    
    function drawMatrixRain() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00FF41';
        ctx.font = fontSize + 'px Fira Code';
        for (let i = 0; i < drops.length; i++) {
            const text = characters.charAt(Math.floor(Math.random() * characters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }

    function animate() {
        if (body.classList.contains('engineering-mode')) {
            drawMatrixRain();
        } else {
            drawParticleNetwork();
        }
        requestAnimationFrame(animate);
    }
    
    animate();

    // Terminal Typer
    const terminalContent = d.getElementById('terminal-content');
    if(terminalContent) {
        const lines = [
            "$ INITIATE: AUTOMATION_ANALYSIS...",
            "QUERY: MANUAL_TASKS, REPETITIVE_WORKFLOWS",
            "<span class='highlight'>...Found 14 bottlenecks.</span>",
            "CALCULATE: POTENTIAL_TIME_SAVINGS",
            "<span class='highlight'>...Estimated >10 hours/week.</span>",
            "$ EXECUTE: GROWTH_STRATEGY.EXE",
        ];
        let lineIndex = 0, charIndex = 0;
        function typeLine() {
            if (lineIndex < lines.length) {
                const currentLine = lines[lineIndex];
                if (charIndex < currentLine.length) {
                    terminalContent.innerHTML = lines.slice(0, lineIndex).join('<br>') + '<br>' + currentLine.substring(0, charIndex + 1) + '<span class="terminal-cursor"></span>';
                    charIndex++;
                    setTimeout(typeLine, Math.random() * 40 + 20);
                } else {
                    lineIndex++; 
                    charIndex = 0;
                    setTimeout(typeLine, lineIndex === 3 || lineIndex === 5 ? 1000 : 500);
                }
            } else {
                terminalContent.innerHTML = lines.join('<br>') + '<span class="terminal-cursor"></span>';
            }
        }
        typeLine();
    }
});

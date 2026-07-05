
/* =====================================
   PHASE 1 - PART 5
   Hero Animation Engine
   main.js
   ===================================== */

// =====================================
// HERO COUNTERS
// =====================================

function animateCounters(){

    const counters =
    document.querySelectorAll(
        ".counter"
    );

    counters.forEach(counter=>{

        const target =
        Number(
            counter.dataset.target
        );

        let current = 0;

        const increment =
        Math.ceil(
            target/120
        );

        const timer =
        setInterval(()=>{

            current += increment;

            if(current>=target){

                current = target;

                clearInterval(timer);

            }

            counter.innerHTML =
            target>=1000
            ? current.toLocaleString()
            : current;

        },15);

    });

}

// =====================================
// HERO REVEAL
// =====================================

function revealHero(){

    const elements =
    document.querySelectorAll(

        ".hero-badge,\
.hero-title,\
.hero-description,\
.hero-buttons,\
.hero-companies,\
.hero-trust,\
.hero-preview"

    );

    elements.forEach((el,index)=>{

        el.style.opacity="0";

        el.style.transform=
        "translateY(40px)";

        setTimeout(()=>{

            el.style.transition=
            "all .8s ease";

            el.style.opacity="1";

            el.style.transform=
            "translateY(0)";

        },index*120);

    });

}

// =====================================
// CTA PULSE
// =====================================

function pulseButton(){

    const btn =
    document.querySelector(
        ".btn-primary"
    );

    if(!btn) return;

    setInterval(()=>{

        btn.classList.add(
            "pulse"
        );

        setTimeout(()=>{

            btn.classList.remove(
                "pulse"
            );

        },1200);

    },5000);

}

// =====================================
// DASHBOARD LIVE VALUES
// =====================================

function updateDashboardMetrics(){

    const metrics =
    document.querySelectorAll(

".preview-metric strong"

    );

    if(metrics.length<4)
    return;

    setInterval(()=>{

        metrics[0].innerHTML=
        (
        2400+
        Math.floor(
        Math.random()*120
        )
        ).toLocaleString();

        metrics[1].innerHTML=
        (
        1900+
        Math.floor(
        Math.random()*80
        )
        ).toLocaleString();

        metrics[2].innerHTML=
        (
        300+
        Math.floor(
        Math.random()*25
        )
        );

        metrics[3].innerHTML=
        "$"+
        (
        18000+
        Math.floor(
        Math.random()*900
        )
        ).toLocaleString();

    },3500);

}

// =====================================
// LIVE STATUS
// =====================================

function animateStatusDot(){

    const dot =
    document.querySelector(
        ".status-dot"
    );

    if(!dot) return;

    setInterval(()=>{

        dot.classList.toggle(
            "online"
        );

    },900);

}

// =====================================
// HERO PARALLAX
// =====================================

function heroParallax(){

    const hero =
    document.querySelector(
        ".hero"
    );

    const preview =
    document.querySelector(
        ".hero-preview"
    );

    if(!hero || !preview)
    return;

    hero.addEventListener(

        "mousemove",

        e=>{

            const rect =
            hero.getBoundingClientRect();

            const x =
            (
            e.clientX-
            rect.left
            )/
            rect.width;

            const y =
            (
            e.clientY-
            rect.top
            )/
            rect.height;

            preview.style.transform=

`rotateY(${(x-.5)*8}deg)
 rotateX(${-(y-.5)*8}deg)
 translateZ(0)`;

        }

    );

    hero.addEventListener(

        "mouseleave",

        ()=>{

            preview.style.transform=
            "rotateY(0deg) rotateX(0deg)";

        }

    );

}

// =====================================
// SCROLL INDICATOR
// =====================================

function scrollIndicator(){

    const indicator =
    document.querySelector(
        ".scroll-indicator"
    );

    if(!indicator) return;

    indicator.onclick=()=>{

        window.scrollTo({

            top:
            window.innerHeight,

            behavior:"smooth"

        });

    };

}

// =====================================
// INITIALIZE HERO
// =====================================

window.addEventListener(

    "load",

    ()=>{

        revealHero();

        animateCounters();

        pulseButton();

        updateDashboardMetrics();

        animateStatusDot();

        heroParallax();

        scrollIndicator();

    }

);

/* =====================================
NEXT

PHASE 1
PART 6

Professional Navbar

• Sticky Glass Navbar
• Scroll Blur
• Active Menu
• Mobile Menu
• Smooth Navigation
• Premium Hover Effects

===================================== */

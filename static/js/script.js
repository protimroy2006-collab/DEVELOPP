const particles = document.getElementById("particles");

for(let i=0;i<60;i++){

    const particle = document.createElement("span");

    particle.classList.add("particle");

    particle.style.left = Math.random()*100 + "%";

    particle.style.animationDuration =
    (8 + Math.random()*12) + "s";

    particle.style.animationDelay =
    Math.random()*5 + "s";

    particle.style.opacity =
    Math.random();

    particles.appendChild(particle);
}

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Intersection Observer for animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('why-us')) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        }
    });
}, { threshold: 0.3 });

const statsSection = document.querySelector('.why-us');
if (statsSection) {
    observer.observe(statsSection);
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});
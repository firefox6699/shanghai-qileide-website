const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const progress = document.querySelector("[data-progress]");
const kineticField = document.querySelector("[data-kinetic-field]");
const slabs = document.querySelectorAll(".slab");
const cinema = document.querySelector("[data-cinema]");
const cinemaPanels = document.querySelectorAll("[data-cinema-panel]");
const cinemaCards = document.querySelectorAll("[data-cinema-card]");
const floorCards = document.querySelectorAll(".floor-card");
const cinemaCurrent = document.querySelector("[data-cinema-current]");
const cinemaBar = document.querySelector("[data-cinema-bar]");

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let ticking = false;

const updateChrome = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const amount = max > 0 ? window.scrollY / max : 0;
  header.classList.toggle("scrolled", window.scrollY > 12);
  progress.style.width = `${clamp(amount) * 100}%`;
};

const updateKineticField = () => {
  if (!kineticField || prefersReducedMotion) {
    return;
  }

  const scroll = window.scrollY;
  kineticField.style.setProperty("--kinetic-y", `${scroll * -0.045}px`);

  slabs.forEach((slab, index) => {
    const direction = index % 2 === 0 ? 1 : -1;
    const wave = Math.sin(scroll * 0.003 + index) * 18;
    slab.style.setProperty("--slab-x", `${direction * scroll * 0.018 + wave}px`);
    slab.style.setProperty("--slab-y", `${scroll * (0.028 + index * 0.004)}px`);
  });
};

const updateCinema = () => {
  if (!cinema || !cinemaPanels.length) {
    return;
  }

  const total = Math.max(1, cinema.offsetHeight - window.innerHeight);
  const progressAmount = clamp(-cinema.getBoundingClientRect().top / total);
  const panelCount = cinemaPanels.length;
  const phase = progressAmount * (panelCount - 1);
  const activeIndex = Math.round(phase);

  cinema.style.setProperty("--cinema-progress", progressAmount.toFixed(4));
  cinema.style.setProperty("--cinema-shift-x", `${progressAmount * -8}vw`);
  cinema.style.setProperty("--cinema-shift-y", `${progressAmount * -10}vh`);
  cinema.style.setProperty("--cinema-scale", (1 + progressAmount * 0.16).toFixed(3));
  cinema.style.setProperty("--cinema-bg-x", `${50 - progressAmount * 10}%`);
  cinema.style.setProperty("--cinema-bg-y", `${50 + progressAmount * 8}%`);
  cinema.style.setProperty("--cinema-bg-scale", (1.04 + progressAmount * 0.08).toFixed(3));

  if (cinemaBar) {
    cinemaBar.style.setProperty("--cinema-bar", `${progressAmount * 100}%`);
  }

  if (cinemaCurrent) {
    cinemaCurrent.textContent = String(activeIndex + 1).padStart(2, "0");
  }

  cinemaPanels.forEach((panel, index) => {
    const active = index === activeIndex;
    panel.classList.toggle("is-active", active);
    panel.setAttribute("aria-hidden", String(!active));
  });

  cinemaCards.forEach((card, index) => {
    const offset = index - phase;
    const focus = 1 - clamp(Math.abs(offset));
    const side = index % 2 === 0 ? -1 : 1;
    card.style.setProperty("--card-opacity", String(0.13 + focus * 0.87));
    card.style.setProperty("--card-scale", (0.74 + focus * 0.26).toFixed(3));
    card.style.setProperty("--card-x", `${offset * side * 22}vw`);
    card.style.setProperty("--card-y", `${offset * 8}vh`);
    card.style.setProperty("--card-rotate", `${-6 + offset * 5}deg`);
  });

  floorCards.forEach((card, index) => {
    const depth = 0.55 + index * 0.18;
    const drift = progressAmount - 0.5;
    const wave = Math.sin(progressAmount * Math.PI * 2 + index * 0.9);
    const direction = index % 2 === 0 ? 1 : -1;
    card.style.setProperty("--floor-x", `${drift * direction * depth * 24}vw`);
    card.style.setProperty("--floor-y", `${progressAmount * depth * -16 + wave * 1.8}vh`);
    card.style.setProperty("--floor-r", `${-24 + wave * 2.5}deg`);
    card.style.setProperty("--floor-scale", (0.92 + progressAmount * depth * 0.18).toFixed(3));
    card.style.setProperty("--floor-opacity", String(0.34 + clamp(1 - Math.abs(drift) * 1.2) * 0.38));
  });
};

const updateFrame = () => {
  updateChrome();
  updateKineticField();
  updateCinema();
  ticking = false;
};

const requestFrame = () => {
  if (!ticking) {
    window.requestAnimationFrame(updateFrame);
    ticking = true;
  }
};

window.addEventListener("scroll", requestFrame, { passive: true });
window.addEventListener("resize", requestFrame);
updateFrame();

toggle.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  toggle.setAttribute("aria-expanded", String(open));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));

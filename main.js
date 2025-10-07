// Typewriter animacija za naslov
const text = "Dobrodošli na stranicu SPC Salzburg";
let index = 0;
const speed = 70;

function typeWriter() {
  if (index < text.length) {
    document.getElementById("animated-title").innerHTML += text.charAt(index);
    index++;
    setTimeout(typeWriter, speed);
  }
}

window.onload = () => {
  typeWriter();
};

// Fade-in animacija za sekcije
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  {
    threshold: 0.1
  }
);

document.querySelectorAll("section").forEach(section => {
  section.classList.add("hidden");
  observer.observe(section);
});

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Valot
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 3, 5);
scene.add(light);

const ambient = new THREE.AmbientLight(0x333333);
scene.add(ambient);

// Tekstuurien lataus
const loader = new THREE.TextureLoader();
const earthTexture = loader.load('earth.jpg');
const cloudTexture = loader.load('clouds.png');

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(2, 64, 64),
  new THREE.MeshPhongMaterial({ map: earthTexture })
);

// Pilvet ja niiden läpinäkyvyys
const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(2.02, 64, 64),
  new THREE.MeshLambertMaterial({ map: cloudTexture, transparent: true, opacity: 0.6 })
);

scene.add(sphere);
scene.add(clouds);

camera.position.z = 7;

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  let delta = clock.getDelta();
  const rotationSpeed = (Math.PI * 2) / 34; // Pyörimisnopeus puoliksi
  sphere.rotation.y += delta * rotationSpeed;
  clouds.rotation.y += delta * rotationSpeed * 1.02;
  renderer.render(scene, camera);
}

animate();

// Pilven päivitys 1 h välein (nyt demo 30s)
setInterval(() => {
  const newCloud = loader.load('clouds.png?rand=' + Math.random());
  clouds.material.map = newCloud;
  clouds.material.needsUpdate = true;
}, 3600000); // 1 h = 3600000 ms

// --- Aikajana ja askelpalkki ---
const progressLabel = document.getElementById('progress-label');
function updateFontSizes() {
  const size = window.innerWidth <= 600 ? '32px' : '16px';
  if (progressLabel) progressLabel.style.fontSize = size;
  if (currentTimeLabel) currentTimeLabel.style.fontSize = size;
}
if (progressLabel) {
  progressLabel.style.position = 'absolute';
  progressLabel.style.bottom = '35px';
  progressLabel.style.left = '50%';
  progressLabel.style.transform = 'translateX(-50%)';
  progressLabel.style.color = '#fff';
  progressLabel.style.fontFamily = 'monospace';
  progressLabel.style.zIndex = '20';
}
const currentTimeLabel = document.getElementById('current-time-label');
updateFontSizes();

// Parametrit
const totalHours = 120;
const weekdaysShort = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'];
const pastHours = 72;
const futureHours = 48;
const stepHours = 1;
const steps = totalHours / stepHours;
const stepBar = document.getElementById('step-bar');
const now = Date.now();
const startTime = now - pastHours * 60 * 60 * 1000;

let currentStep = 0;

// Luo askelpalkki (vain yksi silmukka!)
for (let i = 0; i < steps; i++) {
  const div = document.createElement('div');
  div.className = 'step ' + (i < pastHours ? 'havainto' : 'ennuste');
  // Päivän lyhenne label
  const stepTime = new Date(startTime + i * stepHours * 60 * 60 * 1000);
  const weekdayShort = weekdaysShort[stepTime.getUTCDay()];
  div.title = `${weekdayShort} ${stepTime.getUTCHours()}:00`;
  stepBar.appendChild(div);
}

// Hae stepDivs vasta nyt!
const stepDivs = stepBar.querySelectorAll('.step');

// Animaatio: siirry seuraavaan askeleeseen 30s/120 = 250ms välein
const stepInterval = 30000 / steps;
setInterval(() => {
  // Poista vanha aktiivinen
  stepDivs.forEach(div => div.classList.remove('active'));
  // Lisää uusi aktiivinen, vain jos olemassa
  const safeStep = currentStep % stepDivs.length;
  if (stepDivs[safeStep]) {
    stepDivs[safeStep].classList.add('active');
  }
  // Päivitä aika ja labelit
  const stepTime = new Date(startTime + safeStep * stepHours * 60 * 60 * 1000);
  const weekdayShort = weekdaysShort[stepTime.getUTCDay()];
  if (progressLabel) {
    const tyyppi = safeStep < pastHours ? 'Havainto' : 'Ennuste';
    progressLabel.textContent = `${tyyppi} ${weekdayShort} ${stepTime.getUTCDate()}.${stepTime.getUTCMonth()+1}. ${stepTime.getUTCHours()}:00`;
  }
  // Seuraava askel
  currentStep = (currentStep + 1) % stepDivs.length;
}, stepInterval);

// --- Nykyinen aika ylhäällä ---

function updateCurrentTime() {
  const now = new Date();
  const weekday = weekdaysShort[now.getUTCDay()];
  const timeString = now.toISOString().replace('T', ' ').substring(0, 19);
  if (currentTimeLabel) {
    currentTimeLabel.textContent = `${weekday} ${timeString} UTC`;
  }
}
setInterval(updateCurrentTime, 1000);
updateCurrentTime();

// Skaalautuvuus
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateFontSizes();
});
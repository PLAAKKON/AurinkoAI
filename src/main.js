import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Valot
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 3, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x333333));

// Tekstuurit
const loader = new THREE.TextureLoader();
const earthTexture = loader.load('public/earth.jpg');
const cloudTexture = loader.load('public/clouds.png'); // pitää olla läpinäkyvä PNG!

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(2, 64, 64),
  new THREE.MeshPhongMaterial({ map: earthTexture })
);
const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(2.02, 64, 64),
  new THREE.MeshLambertMaterial({ map: cloudTexture, transparent: true })
);
scene.add(earth);
scene.add(clouds);

camera.position.z = 6;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.enableRotate = true;
controls.autoRotate = false; // tärkeää – jotta ennuste ei mene sekaisin

// Animaatio
const clock = new THREE.Clock();
const rotationSpeed = (Math.PI * 2) / 17; // 1 kierros / 17 s

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Pyöritä maapalloa vain jos käyttäjä EI pyöritä (ei hiiren painallusta)
  if (!controls.mouseButtons || !controls._state || controls._state === -1) {
    earth.rotation.y += delta * rotationSpeed;
    clouds.rotation.y += delta * rotationSpeed * 1.02;
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Fix progress bar creation
let progressBar = document.getElementById("progress");
if (!progressBar) {
  progressBar = document.createElement("div");
  progressBar.id = "progress";
  progressBar.style.position = "absolute";
  progressBar.style.bottom = "50px";
  progressBar.style.left = "0";
  progressBar.style.height = "10px";
  progressBar.style.background = "#0af";
  progressBar.style.width = "0";
  document.body.appendChild(progressBar);
}

// Add label for timeline
const label = document.createElement("div");
label.style.position = "absolute";
label.style.bottom = "65px";
label.style.left = "50%";
label.style.transform = "translateX(-50%)";
label.style.fontSize = "18px";
label.style.color = "white";
document.body.appendChild(label);

// Responsive renderer
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Dispose old texture when updating clouds
setInterval(() => {
  loader.load('/public/clouds.png?rand=' + Math.random(), (texture) => {
    if (clouds.material.map) clouds.material.map.dispose();
    clouds.material.map = texture;
    clouds.material.needsUpdate = true;
  });
}, 3600000);

function updateTimeline() {
  const now = Date.now();
  const offset = now % 17000;
  const hour = Math.floor(offset / 1000);
  const percent = (offset / 17000) * 100;
  progressBar.style.width = percent + "%";
  label.textContent = `Ennusteaika: +${hour} h`;
}
setInterval(updateTimeline, 100);

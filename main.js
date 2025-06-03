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

const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(2.02, 64, 64),
  new THREE.MeshLambertMaterial({ map: cloudTexture, transparent: true })
);

scene.add(sphere);
scene.add(clouds);

camera.position.z = 7;

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  let delta = clock.getDelta();
  const rotationSpeed = (Math.PI * 2) / 17;
  sphere.rotation.y += delta * rotationSpeed;
  clouds.rotation.y += delta * rotationSpeed * 1.02;
  renderer.render(scene, camera);
}

animate();

// Pilven päivitys 1 h välein (nyt demo 30s)
setInterval(() => {
  const newCloud = loader.load('/clouds.png?rand=' + Math.random());
  clouds.material.map = newCloud;
  clouds.material.needsUpdate = true;
}, 3600000); // 1 h = 3600000 ms

// Aikajana
const progressBar = document.getElementById('progress');
function updateTimeline() {
  const now = Date.now();
  const offset = now % 17000;
  const percent = (offset / 17000) * 100;
  progressBar.style.width = percent + '%';
}
setInterval(updateTimeline, 1000);

// Skaalautuvuus
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

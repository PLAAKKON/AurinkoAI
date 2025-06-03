import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.z = 6;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 3, 5);
scene.add(light);

scene.add(new THREE.AmbientLight(0x333333));

const loader = new THREE.TextureLoader();
const earthTexture = loader.load('/earth.jpg');
const cloudTexture = loader.load('/clouds.png');

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

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;
controls.autoRotate = false; // Käytämme omaa automaattipyöritystä

let userIsInteracting = false;
controls.addEventListener('start', () => { userIsInteracting = true; });
controls.addEventListener('end', () => { userIsInteracting = false; });

const clock = new THREE.Clock();
const rotationSpeed = (Math.PI * 2) / 17; // 1 kierros / 17 s

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  if (!userIsInteracting) {
    earth.rotation.y += delta * rotationSpeed;
    clouds.rotation.y += delta * rotationSpeed * 1.02;
  }

  controls.update();
  renderer.render(scene, camera);
}

// Pilvien päivitys 1 h välein
setInterval(() => {
  const newCloud = loader.load('/clouds.png?rand=' + Math.random());
  clouds.material.map = newCloud;
  clouds.material.needsUpdate = true;
}, 3600000);

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene & Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// Material (shared for all shapes)
const material = new THREE.MeshStandardMaterial({ color: 0x44aa88 });

// Current mesh
let currentMesh;

// Current particale
let particleSystem; // this will hold our points version of the shape

let mode = 'mesh'; // can be 'mesh' or 'particles'


// Function to create geometry based on type
function createGeometry(type) {
  switch (type) {
    case 'cube': return new THREE.BoxGeometry(1, 1, 1);
    case 'sphere': return new THREE.SphereGeometry(1, 32, 32);
    case 'cone': return new THREE.ConeGeometry(1, 2, 32);
    case 'torus': return new THREE.TorusGeometry(1, 0.4, 16, 100);
    case 'cylinder': return new THREE.CylinderGeometry(1, 1, 2, 32);
    case 'dodecahedron': return new THREE.DodecahedronGeometry(1, 0)
    case 'icosahedron': return new THREE.IcosahedronGeometry(1);
    case 'Plane': return new THREE.PlaneGeometry(1, 1, 1)
 case 'triangle':
    const triangleGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        0, 1, 0,   // vertex 1 (x, y, z)
        -1, -1, 1, // vertex 2
        1, -1, -1   // vertex 3
    ]);
    triangleGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    triangleGeometry.computeVertexNormals(); // optional, for lighting
    return triangleGeometry;
    default: return new THREE.BoxGeometry();
  }
}

function createParticleOutline(type) {
  // Remove previous particle system
  if (particleSystem) scene.remove(particleSystem);

  // Get the geometry of the shape
  const geometry = createGeometry(type);

  // Create a new BufferGeometry for points
  const points = new THREE.BufferGeometry();
  points.setAttribute('position', geometry.getAttribute('position'));

  // Create rainbow colors for each vertex
  const colors = new Float32Array(geometry.attributes.position.count * 3);
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const hue = (i / geometry.attributes.position.count) * 360;
    const color = new THREE.Color(`hsl(${hue}, 100%, 50%)`);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  points.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Create the Points material
  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true
  });

  // Create the Points object and add it to the scene
  particleSystem = new THREE.Points(points, material);
  scene.add(particleSystem);
}


// Function to change shape
function changeShape(type) {
  if (currentMesh) scene.remove(currentMesh);
  if (particleSystem) scene.remove(particleSystem);

  if (mode === 'mesh') {
    const geometry = createGeometry(type);
    currentMesh = new THREE.Mesh(geometry, material);
    scene.add(currentMesh);
  } else {
    createParticleOutline(type);
  }
}

const modeSelect = document.getElementById('modeSelect');
modeSelect.addEventListener('change', e => {
  mode = e.target.value;
  changeShape(shapeSelect.value); // redraw current shape in the new mode
});


// Initial shape
changeShape('cube');

// Attach UI listener **after DOM is loaded**
const shapeSelect = document.getElementById('shapeSelect');
shapeSelect.addEventListener('change', (event) => {
  changeShape(event.target.value);
});

// Get title screen and start button
const titleScreen = document.getElementById('titleScreen');
const startButton = document.getElementById('startButton');

// When the user clicks Start
startButton.addEventListener('click', () => {
  titleScreen.style.display = 'none'; // hide title screen
  changeShape(shapeSelect.value);      // show initial shape
  animate();                           // start animation
});


// Animate
function animate() {
  requestAnimationFrame(animate);
  if (currentMesh) {
    currentMesh.rotation.x += 0.01;
    currentMesh.rotation.y += 0.01;
    
    if (particleSystem) {
  const colors = particleSystem.geometry.attributes.color;
  for (let i = 0; i < colors.count; i++) {
    const hue = (Date.now() * 0.0001 + i / colors.count) % 1;
    const color = new THREE.Color();
    color.setHSL(hue, 1, 0.5);
    colors.setXYZ(i, color.r, color.g, color.b);
  }
  colors.needsUpdate = true;

  // Rotate the particle outline
  particleSystem.rotation.x += 0.01;
  particleSystem.rotation.y += 0.01;
}

  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
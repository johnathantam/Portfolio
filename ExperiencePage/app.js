import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// get canvas object where the scene will be drawn
var canvasContainer = document.getElementById("canvasContainer");
var canvas = document.getElementById('bg');

// Create variables for mouse targeting
var mouseX = 0;
var mouseY = 0;
var target = new THREE.Vector3();

// make all necessary scene variables
var scene = null, camera = null, renderer = null, ambientLight = null;

// make all post processing scene variables
var renderPass = null, bloomPass = null, composer = null;

// make main object variables
var geometry = null, material = null, mesh = null, widthSegments = 600, heightSegments = 600;

function initializeScene() {	

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, canvasContainer.offsetWidth / canvasContainer.offsetHeight, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer({ 
		canvas: canvas,
	});

	//set positions and widths
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( canvasContainer.offsetWidth, canvasContainer.offsetHeight );

}

function applyPostProcessing() {

	// Create a render pass for the initial scene
	renderPass = new RenderPass(scene, camera);

	// Create a bloom pass
	bloomPass = new UnrealBloomPass(
		new THREE.Vector2(canvasContainer.offsetHeight, canvasContainer.offsetWidth),
		0., 0.2, 0.1
	);

	// Set up the composer
	composer = new EffectComposer(renderer);
	composer.addPass(renderPass);
	composer.addPass(bloomPass);

}

function createLight() {

	//create light
	ambientLight = new THREE.AmbientLight(0xfffffff);
	scene.add(ambientLight);


}

function placeCamera() {

	//set camera position
	camera.position.set(0,0,5.5);

}

function createSoapyBubblePiece() {

	// Create a plane geometry to apply the Perlin noise texture to
    geometry = new THREE.BoxGeometry( 5, 5, 0.3, 650, 650 ); 
    material = new THREE.ShaderMaterial({
		vertexShader: `
			uniform float time;
			uniform vec2 resolution;
			uniform vec2 mouse;
			
			varying vec3 vertexColor; 

			const int AMOUNT = 50;
			const float color_intensity = 1.0;
			const float fluid_speed = 100.0;
			
			void main() {
				
				// Generate Color
				vec2 coord = 0.5 * (position.xy - resolution / min(resolution.y, resolution.x));

				float len;

				for (int i = 1; i < AMOUNT; i++){
					vec2 newCoord = coord + time * 0.001;
					newCoord.x += 0.6/float(i) * sin(float(i) * coord.y + time / fluid_speed + 20.3 * float(i)) + 0.5 + mouse.y;
					newCoord.y += 0.6/float(i) * sin(float(i) * coord.x + time / fluid_speed + 0.3 * float(i + 10)) - 0.5 + mouse.x;

					coord = newCoord;
				}

				//Calculate the pattern effect within the gradient colors
				vertexColor = vec3(color_intensity*sin(4.0*coord.x)+color_intensity, color_intensity*sin(2.0*coord.y)+color_intensity, color_intensity*sin(coord.x+coord.y)+color_intensity);

				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

			}
		`,
		fragmentShader: `
			varying vec3 vertexColor; // Receive the color from the vertex shader

			void main() {
				gl_FragColor = vec4(vertexColor, 1.0); // Use the color passed from the vertex shader
			}
		`,
		uniforms: {
			time: { value: 0 },
			resolution: { value: new THREE.Vector2(widthSegments, heightSegments) },
		}
    });

	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

}

// credit to https://stackoverflow.com/questions/53887057/threejs-object-look-at-mouse-with-ease

function planeLookAtCursor() {

    // Calculate the target position for the plane to look at
    target.x += ( mouseX - (target.x * 0.2) ) * .09;
    target.y += ( mouseY - (target.y * 0.2) ) * .09;
    target.z = camera.position.z; // assuming the camera is located at ( 0, 0, z );

	mesh.lookAt( target );

}

// Update function called every frame for animation

function animate() {

    requestAnimationFrame(animate);
	
	// Update time uniform for the shader
	material.uniforms.time.value += 0.01;

	// Make plane look at cursor
	planeLookAtCursor();

	// Your animation/rendering code goes here
	if (composer) composer.render();
} 

// Mousemove event handler
function onDocumentMouseMove(event) {
    // Calculate the normalized mouse position in the canvas
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
}

// Initialize three.js scene, objects, and effects
initializeScene();
applyPostProcessing();

createLight();
placeCamera();

createSoapyBubblePiece();

animate();

//add event listener to update mouseX and mouseY so the piece can look at cursor
window.addEventListener('mousemove', onDocumentMouseMove);

//add event listeners to resize camera and scene, as well as the background plane
//also add functionality to load different pages haha
window.onresize = function onWindowResize() {

	// Update Camera aspect
    camera.aspect = canvasContainer.offsetWidth / canvasContainer.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);

}
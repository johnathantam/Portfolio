import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// get canvas object where the scene will be drawn
var canvasContainer = document.getElementById("canvasContainer");
var canvas = document.getElementById('bg');

// make all necessary scene variables
var scene = null, camera = null, renderer = null, ambientLight = null;

// make all post processing scene variables
var renderPass = null, bloomPass = null, composer = null;

// make main object variables
var geometry = null, material = null, mesh = null;

// get time.deltaTime
const delta = new THREE.Clock();

// the particle point - this is needed for the stars / particles in the scene
var points;

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
		0.3, 0.2, 0.1
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
	camera.position.set(0,0,0);

}

function loadStars() {

	const geometry = new THREE.BufferGeometry();
	const vertices = [];

	for ( let i = 0; i < 1000; i ++ ) {
		const x = Math.random() * 2000 - 1000;
		const y = Math.random() * 2000 - 1000;
		const z = Math.random() * 2000 - 1000;

		vertices.push( x, y, z );
	}

	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

	const material = new THREE.PointsMaterial( { size: 5, map: new THREE.TextureLoader().load( './Images/UnityDefaultParticleSprite.png' ), transparent: true } );
	material.color.set(0xC190FF);
	points = new THREE.Points( geometry, material );

	scene.add( points );
	
}

function loadPlane() {

	geometry = new THREE.PlaneBufferGeometry( 500, 600, 1000, 1000 );

	const displacementMap = new THREE.TextureLoader().load('./Images/diablo_crop_displacement_map.jpg');

	// Create a shader material with a Perlin noise texture
    material = new THREE.ShaderMaterial({
		vertexShader: `
			uniform float time;
			uniform vec2 resolution;
			uniform sampler2D displacementMap;
			
			varying vec3 vertexColor; 

			const float displacementScale = 30.0;

			vec2 rotz(in vec2 p, float ang) { return vec2(p.x*cos(ang)-p.y*sin(ang),p.x*sin(ang)+p.y*cos(ang)); }

			void main() {

				// Set color to vertex
				vec2 p = 0.5*( position.xy / resolution.xy )-0.0; 
				p.x *= resolution.x/resolution.y; 	
				vec3 col = vec3(-.4); 

				p = rotz(p, time*0.35+atan(p.y,p.x)*0.5);
				p *= 1.1+sin(time*0.5); 
				
				for (int i = 0; i < 4; i++) {
					float dist = abs(p.y + sin(float(i)+time*2.+4.0*p.x));
					if (dist < 1.0) { col += (1.0-pow(abs(dist), 0.25))*vec3(0.5+0.25*sin(p.y*4.0+time*5.),0.7+0.3*sin(p.x*5.0+time*5.5),1); }
					p.xy *= 1.5; 
					p = rotz(p, 2.0);
				}

				vertexColor = vec3(col/1.5);

				// Set displacement map to vertex
				vec3 displacedPosition = position + normalize(normal) * texture2D(displacementMap, uv).r * displacementScale;

				gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);

			}
		`,
		fragmentShader: `
			varying vec3 vertexColor; // Receive the color from the vertex shader

			void main() {
				gl_FragColor = vec4(vertexColor, 0.5); // Use the color passed from the vertex shader
			}
		`,
		uniforms: {
			time: { value: 0 },
			resolution: { value: new THREE.Vector2( 1000, 1000 ) },
			displacementMap: { value: displacementMap }
		}
    });

	mesh = new THREE.Mesh( geometry, material );

	mesh.rotation.set(-90, 0, 0);
	mesh.position.set(0, -25, 0);

	scene.add(mesh);

}

// Update function called every frame for animation

function animate() {

    requestAnimationFrame(animate);

	// Update time uniform for the shader
	material.uniforms.time.value += 0.001;

	if (camera && points) {

		camera.translateZ(-0.1);
		camera.translateY(-0.05);
		points.rotation.z += -0.1 * delta.getDelta();

		if (camera.position.z <= -100) {
			camera.position.set(0, 0, 0);
		}

	}

	// Your animation/rendering code goes here
	if (composer) composer.render();
} 

// Initialize three.js scene, objects, and effects
initializeScene();
applyPostProcessing();

createLight();
placeCamera();

loadPlane();
loadStars();

animate();

//add event listeners to resize camera and scene, as well as the background plane
//also add functionality to load different pages haha
window.onresize = function onWindowResize() {

	// Update Camera aspect
    camera.aspect = canvasContainer.offsetWidth / canvasContainer.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);

}
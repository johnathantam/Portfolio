//script for managing the second scene with its entirely different camera, renderer, etc
import * as THREE from 'https://cdn.skypack.dev/three@0.133.0';
import { RGBELoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/RGBELoader.js';
import { FontLoader } from 'https://cdn.skypack.dev/three@0.133.0/examples/jsm/loaders/FontLoader.js';

// get canvas object where the scene will be drawn
var canvasContainer = document.getElementById("canvasContainer");
var canvas = document.getElementById('bg');

// make all necessary scene variables
var scene = null, camera = null, renderer = null, ambientLight = null;

// make main object variables
var glassObjects = [], textMovingRight = [], textMovingLeft = [];
var glassObjectRotationSpeed = 0.001;
var textDistanceTravelled = 0, textSpeed = 0.001, textResetOffset = 7;

function initializeScene() {	

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, canvasContainer.offsetWidth / canvasContainer.offsetHeight, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer({ 
		canvas: canvas,
	});

	//set positions and widths
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( canvasContainer.offsetWidth, canvasContainer.offsetHeight );
	// Create an opaque background
	renderer.setClearColor(0x000000);

}

function createLight() {

	//create light
	ambientLight = new THREE.AmbientLight(0xfffffff, 1);
	scene.add(ambientLight);
	// ambientLight = new THREE.DirectionalLight(0xfff0dd, 10);
	// ambientLight.position.set(0, 5, 10);
	// scene.add(ambientLight);

}

function placeCamera() {

	//set camera position
	camera.position.set(0,0,5);

}

function loadText(font) {

	// Build text
	const color = 0xffffff;

	const matLite = new THREE.MeshBasicMaterial( {
		color: color,
		side: THREE.DoubleSide
	} );

	const message = "About me. About me. About me. About me. About me."
	const shapes = font.generateShapes( message, 1 );
	const geometry = new THREE.ShapeGeometry( shapes );
	geometry.computeBoundingBox();

	// Center Text
	const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

	geometry.translate( xMid, 0, 0 );

	const text = new THREE.Mesh( geometry, matLite );
	scene.add( text );

	return {'text': text, 'geometry': geometry};

}

function loadOutlinedText(font) {


	// Build text
	const color = 0xffffff;

	const matDark = new THREE.LineBasicMaterial( {
		color: color,
		side: THREE.DoubleSide,
	} );

	const message = "Nice to meet you! I hope you are well. Nice to meet you! I hope you are well.";
	const shapes = font.generateShapes( message, 1 );
	const geometry = new THREE.ShapeGeometry( shapes );
	geometry.computeBoundingBox();

	// Center Text
	const xMid = - 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );

	geometry.translate( xMid, 0, 0 );

	// Make outline

	const holeShapes = [];

	for ( let i = 0; i < shapes.length; i ++ ) {

		const shape = shapes[ i ];

		if ( shape.holes && shape.holes.length > 0 ) {

			for ( let j = 0; j < shape.holes.length; j ++ ) {

				const hole = shape.holes[ j ];
				holeShapes.push( hole );

			}

		}

	}

	shapes.push.apply( shapes, holeShapes );

	const lineText = new THREE.Object3D();

	for ( let i = 0; i < shapes.length; i ++ ) {

		const shape = shapes[ i ];

		const points = shape.getPoints();
		const buffer = new THREE.BufferGeometry().setFromPoints( points );

		buffer.translate( xMid, 0, 0 );

		const lineMesh = new THREE.Line( buffer, matDark );
		lineText.add( lineMesh );

	}

	scene.add( lineText );

	return {'text': lineText, 'geometry': geometry};

}

async function loadStackedText(count) {

	// Load font
	const loader = new FontLoader();
	loader.load('./fonts/Roboto_Regular.json', function ( font ) { 

		var height = 0;
		var offset = 0.6;
		var isOutlined = false;

		for (let i = 0; i < count; i++) {

			// Create solid or outlined text
			var newText = isOutlined ? loadOutlinedText(font) : loadText(font);
			var text = newText.text;

			// Stack on previous text
			text.position.set(0, -6 + height + offset, 0 );
			text.rotation.set(0, 0, Math.PI / 6);

			height += newText.geometry.boundingBox.max.y - newText.geometry.boundingBox.min.y;
			height += offset;

			// Store text to animate left or right
			isOutlined ? textMovingLeft.push(text) : textMovingRight.push(text);
			isOutlined = !isOutlined;

		}

	});
	

}

function loadGlassObjects() {

	// Load Texture
	const normalMapTexture = new THREE.TextureLoader().load("./Images/2Q.png");
	normalMapTexture.wrapS = THREE.RepeatWrapping;
	normalMapTexture.wrapT = THREE.RepeatWrapping;

	const colorMapTexture = new THREE.TextureLoader().load('./Images/grainy.jpg');

	// Load environment map
	const hdrEquirect = new RGBELoader().load(
		"./hdris/empty_warehouse_01_2k.hdr",  () => { hdrEquirect.mapping = THREE.EquirectangularReflectionMapping; }
	);
	
	// Compile material
	const material = new THREE.MeshPhysicalMaterial({
		color: 0xffffff,
		roughness: 0,   
		transmission: 1,  
		thickness: 1,
		map: colorMapTexture,
		envMap: hdrEquirect,
		normalMap: normalMapTexture,
		clearcoatNormalMap: normalMapTexture,
	});

	// Create glass objects
	const cylinderGeometry = new THREE.CylinderGeometry( 0.5, 0.5, 2, 32 ); 
	const cubeGeometry = new THREE.BoxGeometry( 1, 1, 1 ); ;
	const torusGeometry = new THREE.TorusGeometry( 0.6, 0.3, 16, 100 ); 

	// Create meshes
	const cylinderMesh = new THREE.Mesh( cylinderGeometry, material );
	const cubeMesh = new THREE.Mesh( cubeGeometry, material );
	const torusMesh = new THREE.Mesh( torusGeometry, material );

	// Set mesh positions
	cylinderMesh.position.set(1.5, -0.2, 2);
	cubeMesh.position.set(-1, -1, 2);
	torusMesh.position.set(-1, 1.4, 2);

	// Add meshes to global var
	glassObjects.push(cylinderMesh);
	glassObjects.push(cubeMesh);
	glassObjects.push(torusMesh);

	// Add meshes to scene
	scene.add(cylinderMesh);	
	scene.add(cubeMesh);
	scene.add(torusMesh);	

}

function animateText() {

	// Don't run unless text are loaded
	if (textMovingLeft.length == 0) return;

	// Move text to the left
	for (let i = 0; i < textMovingLeft.length; i++) { textMovingLeft[i].translateX(-1 * textSpeed); }

	// Move text to the right
	for (let x = 0; x < textMovingRight.length; x++) { textMovingRight[x].translateX(textSpeed); }

	// Track distance text has travelled
	textDistanceTravelled += Math.abs(textSpeed);

	// If text is reaching out of the screen, switch directions
	if (textDistanceTravelled > textResetOffset) {
		textSpeed = textSpeed * -1;
		textDistanceTravelled = 0;
	}

}

function animateGlass() {

	// Don't run unless objects are loaded
	if (glassObjects.length == 0) return;

	for (let i = 0; i < glassObjects.length; i++) {

		var obj = glassObjects[i];

		obj.rotation.x += glassObjectRotationSpeed;
		obj.rotation.y += glassObjectRotationSpeed;
		obj.rotation.z += glassObjectRotationSpeed;

	}

}

// Update function called every frame for animation

function animate() {

    requestAnimationFrame(animate);

	animateText();
	animateGlass();

	// Your animation/rendering code goes here
	if (renderer) renderer.render( scene, camera);
} 

// Initialize three.js scene, objects, and effects
initializeScene();

createLight();
placeCamera();

loadGlassObjects();
loadStackedText(7);

animate();

//add event listeners to resize camera and scene, as well as the background plane
//also add functionality to load different pages haha
window.onresize = function onWindowResize() {

	// Update Camera aspect
    camera.aspect = canvasContainer.offsetWidth / canvasContainer.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);

}
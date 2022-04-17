//script for managing the second scene with its entirely different camera, renderer, etc
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import * as TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.esm.js';

//make all necessary variables
var scene = null, camera = null, renderer = null;

//mouse trail variables
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const mouseDirection = new THREE.Vector2();
var mouseTrailSpawnPoint = new THREE.Vector3();

//for mobile direction variable
var previousTouch;
//load mouse trail texture
var mouseTrailTexture = new THREE.TextureLoader().load("./CustomImages/UnityDefaultParticleSprite.png" );

function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	mouseDirection.x = event.movementX;
	mouseDirection.y = event.movementY;

	setCursorTrail();
}

function onMobileTouch( event )
{	
	const touch = event.touches[0];

	mouse.x = ( touch.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( touch.clientY / window.innerHeight ) * 2 + 1;

	//calculate direction of touch from previous point as touches dont have the .movementX/Y 
	if (previousTouch) {
        // be aware that these only store the movement of the first touch in the touches array
        event.movementX = touch.pageX - previousTouch.pageX;
        event.movementY = touch.pageY - previousTouch.pageY;
    };

    previousTouch = touch;

	mouseDirection.x = event.movementX;
	mouseDirection.y = event.movementY;

	console.log(event.movementY)

	setCursorTrail();
}

function setCursorTrail()
{	
	const geometry = new THREE.PlaneGeometry( 0.003, 0.003 );
	const material = new THREE.MeshBasicMaterial( {map: mouseTrailTexture, transparent: true, opacity: 1,} );
	material.color.set(0xffffff)
	var plane = new THREE.Mesh( geometry, material );
	plane.position.x = mouseTrailSpawnPoint.x;
	plane.position.y = mouseTrailSpawnPoint.y;
	scene.add( plane );

	//the direction the - plane.position.clone().setX(Math.random() < 0.5 ? -10 : 10).setY(Math.random() < 0.5 ? -10 : 10)
	let planeEndingPos = plane.position.clone().setX(mouse.x - mouseDirection.x).setY(mouse.y - mouseDirection.y);

	new TWEEN.Tween(plane.position)
    .to(planeEndingPos, 20000)
    .onStart(function() {
      	new TWEEN.Tween(plane.material)
		.to({color: new THREE.Color( 0xffd700 )}, 1000)
		.onStart(function() {
		
		})
		.onComplete(function() {
			plane.geometry.dispose(); 
			plane.material.dispose();
			scene.remove( plane ); 
			plane = undefined;
		})
		.start();
    })
    .onComplete(function() {
		
    })
    .start();
}

function setUpPlaneForMouseTrail()
{	
	const geometry = new THREE.PlaneGeometry( 200, 100 );
	const material = new THREE.MeshBasicMaterial( {color: 0x000000, side: THREE.DoubleSide} );
	const plane = new THREE.Mesh( geometry, material );
	scene.add( plane );
}

function initScene()
{	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer({ 
		canvas: document.querySelector('#bg'),
	});

	//set positions and widths
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild(renderer.domElement); //this is to overlay html onto the camera

	//add light
	const light = new THREE.AmbientLight( 0x404040 ); // soft white light
	scene.add( light );

	//set positions and widths
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

	const controls = new OrbitControls( camera, renderer.domElement );

	//controls.update() must be called after any manual changes to the camera's transform
	camera.position.set( 0, 0, 1 );
	controls.update();

	setUpPlaneForMouseTrail();

	//render - draw
	renderer.render( scene, camera );
}

//pretty much the Update() function like in unity - callen every frame
function Update()
{	
    requestAnimationFrame( Update );

	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse, camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( scene.children );

	for ( let i = 0; i < intersects.length; i ++ ) {

		mouseTrailSpawnPoint = intersects[ i ].point;

	}

	//update TWEEN - animation module
	TWEEN.update();

    if (renderer) renderer.render( scene, camera );
}

//init scene
initScene();
Update();

//now before we add the event listeners, we have to do something really important
//since the canvas will naturally be at the bottom of other elements
//because it is edited in this script, we must append everything else
//back to the bottom so that the canvas is at the top
var otherElements = document.getElementsByClassName("project-section");
for (let i = 0; i < otherElements.length; i++) {
	document.body.append(otherElements[i]);
}

//add event listener for mouse trail - for keyboard and mouse users
window.addEventListener( 'mousemove', onMouseMove, false );

//detect mobile touch move
window.addEventListener( 'touchmove', onMobileTouch, false );

window.addEventListener("resize", onWindowResize, false);

//resize the camera everytime the window is resized
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
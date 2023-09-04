//script for managing the second scene with its entirely different camera, renderer, etc
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';
import { SimplexNoise } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/math/SimplexNoise.js';

//make all necessary variables
var scene = null, camera = null, renderer = null, simplex = new SimplexNoise();
//the background plane - store here so we can animate it 
var plane;
//get time.deltaTime
const delta = new THREE.Clock();

//config
var conf = {
    fov: 75,
    cameraZ: 75,
    xyCoef: 50,
    zCoef: 10,
    lightIntensity: 0.9,
    ambientColor: 0x000000,
    light1Color: 0x0E09DC,
    light2Color: 0x1CD1E1,
    light3Color: 0x18C02C,
    light4Color: 0xee3bcf,
};

function loadBackground()
{	
	const geometry = new THREE.PlaneBufferGeometry( 100, 100, 25, 25 );
	const material = new THREE.MeshPhongMaterial( {color: 0xFFFFFF, side: THREE.DoubleSide, wireframe: false} );
	plane = new THREE.Mesh( geometry, material );
	plane.rotation.x = Math.PI / 2;

	scene.add( plane );
}

function animateBackground()
{
	let gArray = plane.geometry.attributes.position.array;

	const time = Date.now() * 0.0002;
	for (let i = 0; i < gArray.length; i+=3)
	{	
		gArray[i + 2] = simplex.noise4d(gArray[i] / conf.xyCoef, gArray[i + 1] / conf.xyCoef, time, 1.9667596826360398) * conf.zCoef;
	}

	plane.geometry.attributes.position.needsUpdate = true;
}

function initSecondScene()
{	
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
	renderer = new THREE.WebGLRenderer({ 
		canvas: document.querySelector('#bg'),
	});

	camera.position.set(0,5,10);

	//set positions and widths
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.soft = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.shadowMap.needsUpdate = true;
	document.body.appendChild(renderer.domElement); //this is to overlay html onto the camera

	//create light
	const r = 30;
    const y = 10;
    const lightDistance = 500;

	let light1 = new THREE.PointLight(conf.light1Color, conf.lightIntensity, lightDistance);
    light1.position.set(0, y, r);
    scene.add(light1);
    let light2 = new THREE.PointLight(conf.light2Color, conf.lightIntensity, lightDistance);
    light2.position.set(0, -y, -r);
    scene.add(light2);
    let light3 = new THREE.PointLight(conf.light3Color, conf.lightIntensity, lightDistance);
    light3.position.set(r, y, 0);
    scene.add(light3);
    let light4 = new THREE.PointLight(conf.light4Color, conf.lightIntensity, lightDistance);
    light4.position.set(-r, y, 0);
    scene.add(light4);

	//load scene assets and effects
	loadBackground();

	//render - draw
	renderer.render( scene, camera );
}

function animateScene()
{	
	animateBackground();
}

//pretty much the Update() function like in unity - callen every frame
function Update()
{	
    requestAnimationFrame( Update );

	let deltaSpeed = delta.getDelta();

	animateScene()

    if (renderer) renderer.render( scene, camera );
}

//set everything ups
initSecondScene();
Update();

window.addEventListener("resize", onWindowResize, false);

//resize the camera everytime the window is resized
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//apply - load new page function
var letsGoBackButton = document.getElementById("goBackButton");

if (letsGoBackButton) letsGoBackButton.addEventListener(('click'), () =>
{   
    //load second page html
    var a = document.createElement('a');

    a.href = "https://johnathantam.github.io/Portfolio/index.html";
    a.click();
})

var githubButton = document.getElementById("goToGithub");

if (githubButton) githubButton.addEventListener(('click'), () =>
{   
    //load second page html
    var a = document.createElement('a');

    a.href = "https://github.com/johnathantam";
	a.target = "blank";
    a.click();
})

var resumeButton = document.getElementById("goToResume");

resumeButton.addEventListener(('click'), () => {
    //load second page html
    var a = document.createElement('a');

    a.href = "./CustomImages/Resume2022.pdf";
    a.target = "blank";
    a.click();
})

var experience = document.getElementById("goToExperience");

if (experience) experience.addEventListener(('click'), () => {
    //load second page html
    var a = document.createElement('a');

    a.href = "https://johnathantam.github.io/Portfolio/ExperiencePage/index.html";
    a.click();
})
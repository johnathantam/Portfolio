import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

//make all necessary variables
var scene = null, camera = null, renderer = null;

//the particle point - this is needed for the stars / particles in the scene
var points;
//get time.deltaTime
const delta = new THREE.Clock();

function loadStars()
{
	const geometry = new THREE.BufferGeometry();
	const vertices = [];

	for ( let i = 0; i < 1000; i ++ ) {
		const x = Math.random() * 2000 - 1000;
		const y = Math.random() * 2000 - 1000;
		const z = Math.random() * 2000 - 1000;

		vertices.push( x, y, z );
	}

	geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

	const material = new THREE.PointsMaterial( { size: 5, map: new THREE.TextureLoader().load( './CustomImages/UnityDefaultParticleSprite.png' ), transparent: true } );
	material.color.set(0xC190FF);
	points = new THREE.Points( geometry, material );

	scene.add( points );
}

//load ground for first scene - plane
function loadPlane()
{
	const geometry = new THREE.PlaneBufferGeometry( 2000, 2000, 20, 20 );
	const material = new THREE.MeshStandardMaterial( { 
		color: 'gray',
		map:  new THREE.TextureLoader().load('./CustomImages/blurry-gradient-haikei.png'),
		displacementMap: new THREE.TextureLoader().load('./CustomImages/diablo_crop_displacement_map.jpg'),
		displacementScale: 65,
	} );

	const plane = new THREE.Mesh( geometry, material );

	plane.rotation.set(-90, 0, 0);
	plane.position.set(0, -50, 0);

	scene.add(plane);
}

function init()
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
	camera.position.set(0,0,0);

	//create light
	const ambientLight = new THREE.AmbientLight(0xfffffff);
	scene.add(ambientLight);

	//load up all scene assets
	loadPlane();
	loadStars();

	//render - draw
	renderer.render( scene, camera );
}

function Animate()
{	
	if (camera && points)
	{
		camera.translateZ(-0.1);
		camera.translateY(-0.05);
		points.rotation.z += -0.1 * delta.getDelta();

		if (camera.position.z <= -100)
		{
			camera.position.set(0, 0, 0);
		}
	}
}

//pretty much the Update() function like in unity - callen every frame
function Update()
{	
    requestAnimationFrame( Update );

	Animate();

    if (renderer) renderer.render( scene, camera );
}

//add event listeners to resize camera and scene
//also add functionality to load different pages haha
window.onresize = onWindowResize;

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//apply - load new page function
var LetsGetStartedButton = document.getElementById("getStartedButton");

if (LetsGetStartedButton) LetsGetStartedButton.addEventListener(('click'), () =>
{   
    //load second page html
    var a = document.createElement('a');

    a.href = "./SocialPage/index.html";
    a.click();
})

//initialize and start animating scene
init();
Update();
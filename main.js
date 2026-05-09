import { FunctionOverloadingNode, PointLightHelper } from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { MathUtils } from 'three';
import './index.css'
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

import * as three from 'three'
import { EffectComposer, RenderPass } from 'three/examples/jsm/Addons.js';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { abs, cos, sin } from 'three/tsl';
import { degToRad, radToDeg } from 'three/src/math/MathUtils.js';


//Couleurs/Mats
const PLANE_COLOR = {color: 0xAAAAAA}
const MTN_COLOR = {color: 0xBBBBBB}
const SUN_COLOR = {color: 0xFFFFFF}
const BG_COLOR = {color: 0x000000}

//Variables géometrie
const GRID_SIZE = 900;
const SUN_POS = new three.Vector3(0,10,-500);   
const PYRS_CENTER = new three.Vector3(0,10,-60);
//Pyramides
const BASE_PYR_NB = 10;
const NB_ROWS = 7;
const PYR_RADIUS = 50;
const MAX_HEIGHT = 20;
const MIN_HEIGHT = 10;
const MAX_WIDTH = 10;
const MIN_WIDTH = 5;
var pyr_list = [];


//Camera
const CAM_BASE_Y = 30;
const CAM_Z = 70;

const SCROLL_COEFF = 0.01;
const ROTATE_COEFF = 0.0001;
const MIN_DOCUMENT_HEIGHT = 1137;
const CAM_BASE_ANGLE = -Math.PI/2;

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

const scene = new three.Scene();
const cam = new three.PerspectiveCamera(80, winWidth / winHeight, 0.1,1000);
const render = new three.WebGLRenderer({
    canvas : document.querySelector('#glcanvas'),
});


const pyrMaterial = new three.MeshBasicMaterial({
    color: 0x332222,
})

const planeMaterial = new three.MeshBasicMaterial({
    color: 0x999999,
})

render.setPixelRatio(window.devicePixelRatio);
render.setSize(winWidth,winHeight);

//Camera
cam.position.setZ(CAM_Z);
cam.position.setY(CAM_BASE_Y);
cam.rotation.x = -Math.PI/2+Math.atan((CAM_BASE_Y-SUN_POS.y)/Math.abs(SUN_POS.z)+CAM_Z);

render.render(scene, cam);



//Soleil
const sphere = new three.SphereGeometry(50);

const matS = new three.MeshPhongMaterial(SUN_COLOR);
matS.emissive.set(0xDDDDDD);

const matPyrEmm = new three.MeshPhongMaterial(SUN_COLOR);
matPyrEmm.emissive.set(0xFFFFFF);
matPyrEmm.specular.set(0xFFFFFF);
matPyrEmm.shininess = 50;

const soleil = new three.Mesh(sphere,matS);
soleil.position.set(SUN_POS.x,SUN_POS.y,SUN_POS.z);


//Plan
const GeomP = new three.PlaneGeometry(GRID_SIZE,GRID_SIZE);
const matP = new three.MeshBasicMaterial(PLANE_COLOR);
const plane = new three.Mesh(GeomP, matP);
plane.rotation.x = -Math.PI/2;
plane.material = planeMaterial;
scene.add( plane );

//pyramide
var geomPyr = new three.ConeGeometry(10, 20,3);
var pyr = new three.Mesh(geomPyr,matPyrEmm);
pyr.position.set(20,10,-50);

var lines = new three.LineSegments
//Placement des pyramides
var angle = 0;
var rotation = 0;
var i = 0;
var base_angle;
var rotation
var height
var j = 0;
var pyr_nb = BASE_PYR_NB
var width;
for(j = 1;j<=NB_ROWS;j++){
    base_angle = Math.PI/pyr_nb;

    for(i =0;i<pyr_nb;i++){        
        angle = i*base_angle + base_angle/2; // Little offset
        height = Math.random() * (MAX_HEIGHT + MIN_HEIGHT) + MIN_HEIGHT;
        width = Math.random() * (MAX_WIDTH + MIN_WIDTH) + MIN_WIDTH;
        rotation = Math.random()*180;
        geomPyr = new three.ConeGeometry(width, height,3);
        pyr = new three.Mesh(geomPyr,pyrMaterial);
        pyr.position.set(PYRS_CENTER.x-Math.cos(angle)*PYR_RADIUS*j ,height/2,PYRS_CENTER.z-Math.sin(angle)*PYR_RADIUS*j)
        pyr.rotateY(rotation);
    
        scene.add(pyr);
        pyr_list.push(pyr);
    }
    pyr_nb+=4;
}




const ambient = new three.AmbientLight(0xFFFFFF);

//Grille
// const gridHelper = new three.GridHelper(GRID_SIZE, 20, 0xFF0000, 0xFF0000)
// scene.add(gridHelper)

//Axes
// const axesHelper = new three.AxesHelper( 5 );
// scene.add( axesHelper );


//const controls = new OrbitControls(cam,render.domElement);


scene.add(ambient);

scene.add(soleil);
scene.background = BG_COLOR;

function moveCam(){
    const t =document.documentElement.scrollTop;
    if(t >MIN_DOCUMENT_HEIGHT){
        return
    }
    cam.position.y = CAM_BASE_Y + t*SCROLL_COEFF *-1;
    cam.rotation.x = -Math.PI/2+Math.atan((CAM_BASE_Y-SUN_POS.y)/Math.abs(SUN_POS.z)+CAM_Z)+t*ROTATE_COEFF;

}

document.body.onscroll = moveCam;

//Post Process

//BloomRenderer
const renderer = new RenderPass(scene,cam);
const bloomP = new UnrealBloomPass( new three.Vector2(winWidth,winHeight),1.5,0.4,0.85);
bloomP.threshold = 1;
bloomP.strength = 1;
bloomP.radius = 1;

//Outlines
const outlines = new OutlinePass(new three.Vector2(winWidth,winHeight),scene,cam);
outlines.selectedObjects = pyr_list;
outlines.edgeStrength = 2.5;
outlines.pulsePeriod =10;
//Composer
const composer = new EffectComposer(render);
composer.setSize(winWidth, winHeight);
composer.renderToScreen = true;
composer.addPass(renderer);
composer.addPass(bloomP);
composer.addPass(outlines);


function animate(){
    requestAnimationFrame(animate);


    //controls.update();

    render.render(scene, cam);
    composer.render();
}

animate()


/**
scrollPercent = (document.documentElement.scrollTop / (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100

 2531
3127
2033
2531
 */
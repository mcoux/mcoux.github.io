import { FunctionOverloadingNode, PointLightHelper } from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { MathUtils } from 'three';
import './index.css'

import * as three from 'three'
import { EffectComposer, RenderPass } from 'three/examples/jsm/Addons.js';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;

const scene = new three.Scene();
const cam = new three.PerspectiveCamera(90, winWidth / winHeight, 0.1,1000);
const render = new three.WebGLRenderer({
    canvas : document.querySelector('#glcanvas'),
});
//Couleurs/Mats
const PLANE_COLOR = {color: 0xAAAAAA}
const MTN_COLOR = {color: 0xBBBBBB}
const SUN_COLOR = {color: 0xFFFFFF}
const BG_COLOR = {color: 0x000000}

//Variables géometrie
const GRID_SIZE = 300

//Autres Variables
const CAM_BASE_Y = 20
const SCROLL_COEFF = 0.004

const pyrMaterial = new three.MeshBasicMaterial({
    color: 0xFFFFFF,
    wireframe: true,
})

const planeMaterial = new three.MeshBasicMaterial({
    color: 0xFF0000,
    wireframe: true,
})

render.setPixelRatio(window.devicePixelRatio);
render.setSize(winWidth,winHeight);
cam.position.setZ(30);
cam.position.setY(CAM_BASE_Y);

render.render(scene, cam);


//BloomRenderer
const bloomRender = new RenderPass(scene,cam);
const bloomP = new UnrealBloomPass( new three.Vector2(winWidth,winHeight),1.5,0.4,0.85);
bloomP.threshold = 1;
bloomP.strength = 2;
bloomP.radius = 0;
const bloomComposer = new EffectComposer(render);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(bloomRender);
bloomComposer.addPass(bloomP);

//Soleil
const sphere = new three.SphereGeometry(5);

const matS = new three.MeshPhongMaterial(SUN_COLOR);
matS.emissive.set(0xFFFFFF);
matS.specular.set(0xFFFFFF);
matS.shininess = 50;

const matPyrEmm = new three.MeshPhongMaterial(SUN_COLOR);
matPyrEmm.emissive.set(0xFFFFFF);
matPyrEmm.specular.set(0xFFFFFF);
matPyrEmm.shininess = 50;
matPyrEmm.wireframe = true;

const soleil = new three.Mesh(sphere,matS);
soleil.position.set(0,10,-60)


//Plan
// const GeomP = new three.PlaneGeometry(200,200);
// const matP = new three.MeshBasicMaterial(PLANE_COLOR);
// const plane = new three.Mesh(GeomP, matP);
// plane.rotateX(MathUtils.DEG2RAD*-90);
// plane.material = planeMaterial;
// scene.add( plane );

//pyramide
const geomPyr = new three.ConeGeometry(10, 20,3);
const matPyr = new three.MeshBasicMaterial(MTN_COLOR);
const pyr = new three.Mesh(geomPyr,matPyr);
pyr.material = matPyrEmm;
pyr.position.set(20,10,-50);
scene.add(pyr)


const ambient = new three.AmbientLight(0xFFFFFF);

//Grille
const gridHelper = new three.GridHelper(GRID_SIZE, 10, 0xFF0000, 0xFF0000)
scene.add(gridHelper)

//Axes
const axesHelper = new three.AxesHelper( 5 );
scene.add( axesHelper );


//const controls = new OrbitControls(cam,render.domElement);


scene.add(ambient);

scene.add(soleil);
scene.background = BG_COLOR;

function moveCam(){
    const t =document.body.getBoundingClientRect().top;
    cam.position.y = CAM_BASE_Y + t*SCROLL_COEFF;
}

document.body.onscroll = moveCam;



function animate(){
    requestAnimationFrame(animate);


    //controls.update();

    render.render(scene, cam);
    bloomComposer.render();
}

animate()